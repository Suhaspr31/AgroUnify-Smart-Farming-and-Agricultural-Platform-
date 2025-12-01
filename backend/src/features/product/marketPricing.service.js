const axios = require('axios');
const Product = require('./product.model');
const PriceHistory = require('./priceHistory.model');
const logger = require('../../core/logger');

class MarketPricingService {
  constructor() {
    this.agmarknetApiKey = process.env.AGMARKNET_API_KEY;
    this.dataGovApiKey = process.env.DATA_GOV_API_KEY;

    // API endpoints
    this.dataGovBaseUrl = 'https://api.data.gov.in/resource';

    // Commodity mappings
    this.commodityMappings = {
      'wheat': 'wheat',
      'rice': 'rice',
      'corn': 'maize',
      'maize': 'maize',
      'soybean': 'soybean',
      'cotton': 'cotton'
    };
  }

  // Fetch prices from Agmarknet API
  async fetchAgmarknetPrices(commodity) {
    try {
      if (!this.agmarknetApiKey) {
        logger.warn('Agmarknet API key not configured');
        return null;
      }

      const response = await axios.get(`${this.dataGovBaseUrl}/9ef84268-d588-465a-a308-a864a43d0070`, {
        params: {
          'api-key': this.agmarknetApiKey,
          'format': 'json',
          'limit': 50
        },
        timeout: 10000
      });

      return this.processAgmarknetData(response.data, commodity);
    } catch (error) {
      logger.error('Agmarknet API error:', error.message);
      return null;
    }
  }

  // Fetch prices from data.gov.in API
  async fetchDataGovPrices(commodity) {
    try {
      if (!this.dataGovApiKey) {
        logger.warn('Data.gov.in API key not configured');
        return null;
      }

      const response = await axios.get(`${this.dataGovBaseUrl}/daily_price_report`, {
        params: {
          'api-key': this.dataGovApiKey,
          'format': 'json',
          'commodity': commodity,
          'limit': 50
        },
        timeout: 10000
      });

      return this.processDataGovData(response.data, commodity);
    } catch (error) {
      logger.error('Data.gov.in API error:', error.message);
      return null;
    }
  }


  // Get real-time prices from multiple sources
  async getRealTimePrices(commodities = ['wheat', 'rice', 'corn', 'soybean', 'cotton']) {
    try {
      const [agmarknetData, dataGovData] = await Promise.allSettled([
        this.fetchAgmarknetPrices(commodities.join(',')),
        this.fetchDataGovPrices(commodities.join(','))
      ]);

      // Combine and average prices from all sources
      const combinedPrices = {};

      commodities.forEach(commodity => {
        const prices = [];

        if (agmarknetData.status === 'fulfilled' && agmarknetData.value?.[commodity]) {
          prices.push(agmarknetData.value[commodity]);
        }

        if (dataGovData.status === 'fulfilled' && dataGovData.value?.[commodity]) {
          prices.push(dataGovData.value[commodity]);
        }

        if (prices.length > 0) {
          combinedPrices[commodity] = prices.reduce((sum, price) => sum + price, 0) / prices.length;
        }
      });

      return combinedPrices;
    } catch (error) {
      logger.error('Error fetching real-time prices:', error);
      return {};
    }
  }

  // Calculate product price based on market rates
  calculateProductPrice(basePrice, marketRate, discount = 0) {
    // Formula: basePrice × (1 + marketVariation) × (1 - discount%)
    // Market variation is capped at ±20%
    const marketVariation = Math.max(-0.2, Math.min(0.2, (marketRate - basePrice) / basePrice));
    const adjustedPrice = basePrice * (1 + marketVariation);
    const finalPrice = adjustedPrice * (1 - discount / 100);

    return Math.round(finalPrice);
  }

  // Update product prices based on market data
  async updateProductPrices() {
    try {
      logger.info('Starting daily price update...');

      // Get all products that need price updates
      const products = await Product.find({
        category: { $in: ['seeds', 'fertilizers', 'pesticides'] },
        isActive: true
      });

      if (products.length === 0) {
        logger.info('No products found for price update');
        return 0;
      }

      // Get unique commodities from products
      const commodities = [...new Set(products.map(p => this.mapProductToCommodity(p)).filter(Boolean))];

      // Fetch real-time prices
      const marketPrices = await this.getRealTimePrices(commodities);

      if (Object.keys(marketPrices).length === 0) {
        logger.warn('No market prices available for update');
        return 0;
      }

      let updatedCount = 0;

      for (const product of products) {
        const commodity = this.mapProductToCommodity(product);
        const marketRate = marketPrices[commodity];

        if (!marketRate) continue;

        const newPrice = this.calculateProductPrice(product.basePrice, marketRate, product.discount);

        if (newPrice !== product.currentPrice) {
          const oldPrice = product.currentPrice;
          const priceChange = newPrice - oldPrice;
          const percentageChange = (priceChange / oldPrice) * 100;

          // Update product price
          product.currentPrice = newPrice;
          product.lastPriceUpdate = new Date();
          await product.save();

          // Store price history
          await PriceHistory.create({
            productId: product._id,
            oldPrice,
            newPrice,
            priceChange,
            percentageChange,
            source: 'market_api',
            marketData: marketPrices
          });

          updatedCount++;
        }
      }

      logger.info(`Price update completed. Updated ${updatedCount} products`);
      return updatedCount;
    } catch (error) {
      logger.error('Error updating product prices:', error);
      return 0;
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

  // Process Agmarknet API data
  processAgmarknetData(data, commodity) {
    try {
      if (!data || !Array.isArray(data.records)) return null;

      const prices = data.records
        .filter(record => record.commodity?.toLowerCase().includes(commodity.toLowerCase()))
        .map(record => parseFloat(record.modal_price))
        .filter(price => !isNaN(price) && price > 0);

      if (prices.length === 0) return null;

      return prices.reduce((sum, price) => sum + price, 0) / prices.length;
    } catch (error) {
      logger.error('Error processing Agmarknet data:', error);
      return null;
    }
  }

  // Process data.gov.in API data
  processDataGovData(data, commodity) {
    try {
      if (!data || !Array.isArray(data.records)) return null;

      const prices = data.records
        .filter(record => record.commodity?.toLowerCase().includes(commodity.toLowerCase()))
        .map(record => parseFloat(record.modal_price))
        .filter(price => !isNaN(price) && price > 0);

      if (prices.length === 0) return null;

      return prices.reduce((sum, price) => sum + price, 0) / prices.length;
    } catch (error) {
      logger.error('Error processing data.gov.in data:', error);
      return null;
    }
  }


  // Get price history for a product
  async getProductPriceHistory(productId, days = 30) {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const history = await PriceHistory.find({
        productId,
        date: { $gte: startDate }
      }).sort({ date: 1 });

      return history.map(record => ({
        date: record.date,
        price: record.newPrice,
        change: record.priceChange,
        percentageChange: record.percentageChange,
        source: record.source
      }));
    } catch (error) {
      logger.error('Error getting price history:', error);
      return [];
    }
  }
}

module.exports = new MarketPricingService();