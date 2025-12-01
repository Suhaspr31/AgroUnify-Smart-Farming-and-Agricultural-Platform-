const Product = require('./product.model');
const Order = require('../order/order.model');
const MarketPricingService = require('./marketPricing.service');
const logger = require('../../core/logger');

class PricingService {
  constructor() {
    this.demandWeight = 0.3;
    this.competitionWeight = 0.2;
    this.marketWeight = 0.4;
    this.costWeight = 0.1;
  }

  // Dynamic pricing based on demand forecasting and market rates
  async calculateDynamicPrice(productId) {
    try {
      const product = await Product.findById(productId);
      if (!product) throw new Error('Product not found');

      const demandFactor = await this.calculateDemandFactor(productId);
      const competitionFactor = await this.calculateCompetitionFactor(product);
      const marketFactor = await this.calculateMarketFactor(product);
      const costFactor = await this.calculateCostFactor(product);
      const marginFactor = this.calculateMarginFactor(product);

      // Base price calculation
      let dynamicPrice = product.basePrice;

      // Apply market adjustment (highest weight)
      dynamicPrice *= (1 + (marketFactor - 1) * this.marketWeight);

      // Apply demand adjustment
      dynamicPrice *= (1 + (demandFactor - 1) * this.demandWeight);

      // Apply competition adjustment
      dynamicPrice *= (1 + (competitionFactor - 1) * this.competitionWeight);

      // Apply cost adjustment
      dynamicPrice *= (1 + (costFactor - 1) * this.costWeight);

      // Apply margin adjustment
      dynamicPrice *= (1 + (marginFactor - 1) * this.marginWeight);

      // Ensure price stays within reasonable bounds
      const minPrice = product.basePrice * 0.7; // 30% discount max
      const maxPrice = product.basePrice * 1.8; // 80% markup max

      dynamicPrice = Math.max(minPrice, Math.min(maxPrice, dynamicPrice));

      return Math.round(dynamicPrice * 100) / 100; // Round to 2 decimal places
    } catch (error) {
      logger.error('Error calculating dynamic price:', error);
      return null;
    }
  }

  // Calculate demand factor based on recent sales and trends
  async calculateDemandFactor(productId) {
    try {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const ninetyDaysAgo = new Date();
      ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

      // Recent orders (last 30 days)
      const recentOrders = await Order.countDocuments({
        'items.product': productId,
        createdAt: { $gte: thirtyDaysAgo },
        status: { $in: ['delivered', 'shipped'] }
      });

      // Older orders (31-90 days ago)
      const olderOrders = await Order.countDocuments({
        'items.product': productId,
        createdAt: { $gte: ninetyDaysAgo, $lt: thirtyDaysAgo },
        status: { $in: ['delivered', 'shipped'] }
      });

      if (olderOrders === 0) return 1; // No historical data

      const demandRatio = recentOrders / olderOrders;

      // Normalize demand factor (0.5 to 2.0)
      return Math.max(0.5, Math.min(2.0, demandRatio));
    } catch (error) {
      logger.error('Error calculating demand factor:', error);
      return 1;
    }
  }

  // Calculate competition factor based on similar products
  async calculateCompetitionFactor(product) {
    try {
      const similarProducts = await Product.find({
        _id: { $ne: product._id },
        category: product.category,
        isActive: true
      }).sort({ price: 1 });

      if (similarProducts.length === 0) return 1;

      const avgCompetitorPrice = similarProducts.reduce((sum, p) => sum + p.price, 0) / similarProducts.length;
      const priceRatio = product.price / avgCompetitorPrice;

      // If our price is higher than competitors, reduce it; if lower, can increase slightly
      if (priceRatio > 1.2) return 0.95; // Reduce price if 20% higher
      if (priceRatio < 0.8) return 1.05; // Slight increase if 20% lower

      return 1;
    } catch (error) {
      logger.error('Error calculating competition factor:', error);
      return 1;
    }
  }

  // Calculate market factor based on real-time commodity prices
  async calculateMarketFactor(product) {
    try {
      const commodity = this.mapProductToCommodity(product);
      if (!commodity) return 1;

      const marketPrices = await MarketPricingService.getRealTimePrices([commodity]);
      const marketRate = marketPrices[commodity];

      if (!marketRate) return 1;

      // Calculate market influence on price
      const marketRatio = marketRate / product.basePrice;

      // Normalize market factor (0.8 to 1.5)
      return Math.max(0.8, Math.min(1.5, marketRatio));
    } catch (error) {
      logger.error('Error calculating market factor:', error);
      return 1;
    }
  }

  // Calculate cost factor (simplified - in real implementation, integrate with inventory system)
  calculateCostFactor(product) {
    try {
      // Simplified cost calculation - in reality, this would include procurement costs,
      // storage costs, transportation costs, etc.

      // Assume cost is roughly 60-80% of selling price for agricultural products
      const estimatedCostRatio = 0.7;

      // If stock is low, costs might be higher due to urgency
      const stockFactor = product.stock < 10 ? 1.1 : 1.0;

      return estimatedCostRatio * stockFactor;
    } catch (error) {
      logger.error('Error calculating cost factor:', error);
      return 1;
    }
  }

  // Map product to commodity for pricing
  mapProductToCommodity(product) {
    const categoryMappings = {
      seeds: {
        rice_seeds: 'rice',
        wheat_seeds: 'wheat',
        maize_seeds: 'corn',
        soybean_seeds: 'soybean',
        cotton_seeds: 'cotton'
      },
      fertilizers: {
        nitrogen_fertilizers: 'urea',
        phosphate_fertilizers: 'phosphate',
        potassium_fertilizers: 'potash'
      },
      pesticides: {
        insecticides: 'pesticides',
        fungicides: 'pesticides',
        herbicides: 'pesticides'
      }
    };

    return categoryMappings[product.category]?.[product.subcategory] || product.category;
  }

  // Calculate margin factor based on product performance
  calculateMarginFactor(product) {
    try {
      const rating = product.rating.average;
      const purchaseCount = product.purchaseCount;

      // Higher rated products can command higher margins
      const ratingFactor = rating >= 4.5 ? 1.1 : rating >= 4.0 ? 1.05 : 0.95;

      // Popular products can have higher margins
      const popularityFactor = purchaseCount > 100 ? 1.1 : purchaseCount > 50 ? 1.05 : 0.95;

      return (ratingFactor + popularityFactor) / 2;
    } catch (error) {
      logger.error('Error calculating margin factor:', error);
      return 1;
    }
  }

  // Bulk update dynamic prices for all products
  async updateAllDynamicPrices() {
    try {
      const products = await Product.find({ isActive: true });
      const updates = [];

      for (const product of products) {
        const dynamicPrice = await this.calculateDynamicPrice(product._id);
        if (dynamicPrice && dynamicPrice !== product.currentPrice) {
          updates.push({
            updateOne: {
              filter: { _id: product._id },
              update: {
                currentPrice: dynamicPrice,
                originalPrice: product.currentPrice,
                lastPriceUpdate: new Date(),
                updatedAt: new Date()
              }
            }
          });
        }
      }

      if (updates.length > 0) {
        await Product.bulkWrite(updates);
        logger.info(`Updated dynamic prices for ${updates.length} products`);
      }

      return updates.length;
    } catch (error) {
      logger.error('Error updating dynamic prices:', error);
      return 0;
    }
  }

  // Update prices using market data (daily batch update)
  async updateMarketBasedPrices() {
    try {
      const updatedCount = await MarketPricingService.updateProductPrices();
      logger.info(`Market-based price update completed. Updated ${updatedCount} products`);
      return updatedCount;
    } catch (error) {
      logger.error('Error updating market-based prices:', error);
      return 0;
    }
  }

  // Get price history for analytics
  async getPriceHistory(productId, days = 30) {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const history = await PriceHistory.find({
        productId,
        date: { $gte: startDate }
      }).sort({ date: 1 });

      const product = await Product.findById(productId);
      if (!product) return null;

      return {
        productId,
        currentPrice: product.currentPrice,
        basePrice: product.basePrice,
        originalPrice: product.originalPrice,
        discount: product.discount,
        lastUpdated: product.lastPriceUpdate,
        history: history.map(record => ({
          date: record.date,
          price: record.newPrice,
          change: record.priceChange,
          percentageChange: record.percentageChange,
          source: record.source
        }))
      };
    } catch (error) {
      logger.error('Error getting price history:', error);
      return null;
    }
  }

  // Seasonal pricing adjustments
  async applySeasonalPricing() {
    try {
      const currentMonth = new Date().toLocaleString('default', { month: 'long' }).toLowerCase();

      // Define seasonal multipliers for different crop types
      const seasonalMultipliers = {
        paddy: { kharif: 1.2, rabi: 0.9 },
        wheat: { rabi: 1.3, kharif: 0.8 },
        maize: { kharif: 1.1, rabi: 0.95 },
        cotton: { kharif: 1.25, summer: 0.85 },
        sugarcane: { autumn: 1.15, spring: 0.9 }
      };

      const updates = [];

      for (const [crop, seasons] of Object.entries(seasonalMultipliers)) {
        for (const [season, multiplier] of Object.entries(seasons)) {
          if (this.isCurrentSeason(season, currentMonth)) {
            const products = await Product.find({
              cropType: crop,
              seasonal: true,
              isActive: true
            });

            products.forEach(product => {
              const seasonalPrice = product.price * multiplier;
              updates.push({
                updateOne: {
                  filter: { _id: product._id },
                  update: {
                    price: seasonalPrice,
                    originalPrice: product.price,
                    updatedAt: new Date()
                  }
                }
              });
            });
          }
        }
      }

      if (updates.length > 0) {
        await Product.bulkWrite(updates);
        logger.info(`Applied seasonal pricing to ${updates.length} products`);
      }

      return updates.length;
    } catch (error) {
      logger.error('Error applying seasonal pricing:', error);
      return 0;
    }
  }

  // Helper method to determine if current month matches season
  isCurrentSeason(season, currentMonth) {
    const seasonMonths = {
      kharif: ['june', 'july', 'august', 'september', 'october'],
      rabi: ['november', 'december', 'january', 'february', 'march'],
      summer: ['march', 'april', 'may', 'june'],
      autumn: ['september', 'october', 'november'],
      spring: ['february', 'march', 'april']
    };

    return seasonMonths[season]?.includes(currentMonth) || false;
  }
}

module.exports = new PricingService();