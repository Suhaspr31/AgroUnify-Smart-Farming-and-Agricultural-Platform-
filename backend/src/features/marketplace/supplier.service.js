const User = require('../user/user.model');
const Product = require('../product/product.model');
const Order = require('../order/order.model');
const logger = require('../../core/logger');

class SupplierService {
  constructor() {
    this.reliabilityWeights = {
      onTimeDelivery: 0.4,
      orderAccuracy: 0.3,
      customerRating: 0.2,
      returnRate: 0.1
    };
  }

  // Rank suppliers based on multiple criteria
  async rankSuppliers(category = null, region = null, limit = 20) {
    try {
      // Get all vendors with products
      const vendors = await User.find({
        role: 'vendor',
        isActive: true
      }).lean();

      const rankings = [];

      for (const vendor of vendors) {
        const metrics = await this.calculateSupplierMetrics(vendor._id, category, region);

        if (metrics.totalOrders > 0) { // Only rank suppliers with order history
          const score = this.calculateCompositeScore(metrics);
          rankings.push({
            supplierId: vendor._id,
            supplierName: vendor.name,
            metrics,
            score,
            rank: 0 // Will be set after sorting
          });
        }
      }

      // Sort by score descending
      rankings.sort((a, b) => b.score - a.score);

      // Assign ranks
      rankings.forEach((ranking, index) => {
        ranking.rank = index + 1;
      });

      return rankings.slice(0, limit);
    } catch (error) {
      logger.error('Error ranking suppliers:', error);
      return [];
    }
  }

  // Calculate supplier metrics
  async calculateSupplierMetrics(supplierId, category = null, region = null) {
    try {
      // Get supplier's products
      const productQuery = { vendor: supplierId, isActive: true };
      if (category) productQuery.category = category;
      if (region && region.length > 0) productQuery.region = { $in: region };

      const products = await Product.find(productQuery).lean();
      const productIds = products.map(p => p._id);

      // Get orders for these products
      const orders = await Order.find({
        'items.product': { $in: productIds },
        status: { $in: ['delivered', 'shipped', 'cancelled'] }
      }).lean();

      // Calculate metrics
      const metrics = {
        totalProducts: products.length,
        totalOrders: orders.length,
        totalRevenue: 0,
        onTimeDeliveryRate: 0,
        orderAccuracyRate: 0,
        averageRating: 0,
        returnRate: 0,
        averageDeliveryTime: 0
      };

      if (orders.length > 0) {
        // Calculate revenue
        metrics.totalRevenue = orders.reduce((sum, order) => {
          const orderRevenue = order.items
            .filter(item => productIds.includes(item.product.toString()))
            .reduce((itemSum, item) => itemSum + (item.price * item.quantity), 0);
          return sum + orderRevenue;
        }, 0);

        // Calculate on-time delivery rate
        const deliveredOrders = orders.filter(order => order.status === 'delivered');
        const onTimeDeliveries = deliveredOrders.filter(order => {
          // Simplified: assume orders delivered within 5 days are on time
          const deliveryTime = new Date(order.updatedAt) - new Date(order.createdAt);
          const days = deliveryTime / (1000 * 60 * 60 * 24);
          return days <= 5;
        });
        metrics.onTimeDeliveryRate = deliveredOrders.length > 0 ? onTimeDeliveries.length / deliveredOrders.length : 0;

        // Calculate average delivery time
        if (deliveredOrders.length > 0) {
          const totalDeliveryTime = deliveredOrders.reduce((sum, order) => {
            const deliveryTime = new Date(order.updatedAt) - new Date(order.createdAt);
            return sum + deliveryTime;
          }, 0);
          metrics.averageDeliveryTime = totalDeliveryTime / deliveredOrders.length / (1000 * 60 * 60 * 24); // in days
        }

        // Calculate return/cancellation rate
        const cancelledOrders = orders.filter(order => order.status === 'cancelled');
        metrics.returnRate = cancelledOrders.length / orders.length;

        // Calculate average rating from products
        const totalRating = products.reduce((sum, product) => sum + product.rating.average, 0);
        metrics.averageRating = products.length > 0 ? totalRating / products.length : 0;
      }

      return metrics;
    } catch (error) {
      logger.error('Error calculating supplier metrics:', error);
      return {
        totalProducts: 0,
        totalOrders: 0,
        totalRevenue: 0,
        onTimeDeliveryRate: 0,
        orderAccuracyRate: 0,
        averageRating: 0,
        returnRate: 0,
        averageDeliveryTime: 0
      };
    }
  }

  // Calculate composite score using weighted criteria
  calculateCompositeScore(metrics) {
    const normalizedMetrics = {
      onTimeDelivery: metrics.onTimeDeliveryRate,
      orderAccuracy: metrics.orderAccuracyRate || 0.95, // Assume 95% accuracy if not tracked
      customerRating: metrics.averageRating / 5, // Normalize to 0-1
      returnRate: 1 - metrics.returnRate // Invert return rate (lower is better)
    };

    let score = 0;
    score += normalizedMetrics.onTimeDelivery * this.reliabilityWeights.onTimeDelivery;
    score += normalizedMetrics.orderAccuracy * this.reliabilityWeights.orderAccuracy;
    score += normalizedMetrics.customerRating * this.reliabilityWeights.customerRating;
    score += normalizedMetrics.returnRate * this.reliabilityWeights.returnRate;

    return score;
  }

  // Match suppliers to demand patterns
  async matchSuppliersToDemand(demandData, region = null) {
    try {
      const { cropType, category, quantity, region: demandRegion } = demandData;

      // Find suppliers with relevant products
      const productQuery = {
        isActive: true,
        stock: { $gte: quantity }
      };

      if (category) productQuery.category = category;
      if (cropType && cropType.length > 0) productQuery.cropType = { $in: cropType };
      if (demandRegion) productQuery.region = demandRegion;

      const relevantProducts = await Product.find(productQuery)
        .populate('vendor', 'name location rating')
        .sort({ stock: -1, 'rating.average': -1 });

      // Group by supplier and calculate capacity
      const supplierCapacity = new Map();

      relevantProducts.forEach(product => {
        const supplierId = product.vendor._id.toString();
        if (!supplierCapacity.has(supplierId)) {
          supplierCapacity.set(supplierId, {
            supplier: product.vendor,
            products: [],
            totalCapacity: 0,
            averageRating: 0
          });
        }

        const supplier = supplierCapacity.get(supplierId);
        supplier.products.push(product);
        supplier.totalCapacity += product.stock;
        supplier.averageRating = (supplier.averageRating + product.rating.average) / 2;
      });

      // Rank suppliers by capacity and rating
      const rankedSuppliers = Array.from(supplierCapacity.values())
        .sort((a, b) => {
          // Primary: capacity, Secondary: rating
          if (Math.abs(a.totalCapacity - b.totalCapacity) < quantity * 0.1) {
            return b.averageRating - a.averageRating;
          }
          return b.totalCapacity - a.totalCapacity;
        });

      return rankedSuppliers;
    } catch (error) {
      logger.error('Error matching suppliers to demand:', error);
      return [];
    }
  }

  // Predict demand for supplier stock planning
  async predictSupplierDemand(supplierId, cropType = null, days = 30) {
    try {
      // Get historical sales data for supplier's products
      const products = await Product.find({ vendor: supplierId, isActive: true }).lean();
      const productIds = products.map(p => p._id);

      const salesData = await Order.aggregate([
        {
          $match: {
            'items.product': { $in: productIds },
            status: { $in: ['delivered', 'shipped'] },
            createdAt: { $gte: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000) } // Last 90 days
          }
        },
        {
          $unwind: '$items'
        },
        {
          $match: {
            'items.product': { $in: productIds }
          }
        },
        {
          $group: {
            _id: {
              date: {
                $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
              },
              cropType: cropType // This would need to be added to order items
            },
            quantity: { $sum: '$items.quantity' }
          }
        },
        {
          $sort: { '_id.date': 1 }
        }
      ]);

      // Simple forecasting based on moving average
      const dailyDemand = salesData.reduce((acc, sale) => {
        const key = cropType ? `${sale._id.date}_${cropType}` : sale._id.date;
        acc[key] = (acc[key] || 0) + sale.quantity;
        return acc;
      }, {});

      // Calculate average daily demand
      const totalDemand = Object.values(dailyDemand).reduce((sum, qty) => sum + qty, 0);
      const averageDailyDemand = totalDemand / Math.max(Object.keys(dailyDemand).length, 1);

      // Predict future demand
      const prediction = {
        averageDailyDemand,
        predictedTotalDemand: averageDailyDemand * days,
        confidence: this.calculatePredictionConfidence(salesData.length),
        recommendations: this.generateStockRecommendations(averageDailyDemand, days)
      };

      return prediction;
    } catch (error) {
      logger.error('Error predicting supplier demand:', error);
      return {
        averageDailyDemand: 0,
        predictedTotalDemand: 0,
        confidence: 0,
        recommendations: []
      };
    }
  }

  // Calculate prediction confidence based on data availability
  calculatePredictionConfidence(dataPoints) {
    if (dataPoints >= 30) return 0.9; // High confidence
    if (dataPoints >= 14) return 0.7; // Medium confidence
    if (dataPoints >= 7) return 0.5; // Low confidence
    return 0.3; // Very low confidence
  }

  // Generate stock recommendations
  generateStockRecommendations(averageDailyDemand, days) {
    const recommendations = [];

    if (averageDailyDemand > 0) {
      const recommendedStock = Math.ceil(averageDailyDemand * days * 1.2); // 20% buffer
      const reorderPoint = Math.ceil(averageDailyDemand * 7); // 1 week supply

      recommendations.push({
        type: 'stock_level',
        recommendedStock,
        reorderPoint,
        reasoning: `Based on ${averageDailyDemand.toFixed(1)} daily demand over ${days} days`
      });

      // Seasonal adjustments (simplified)
      const currentMonth = new Date().toLocaleString('default', { month: 'long' }).toLowerCase();
      if (['march', 'april', 'may', 'june'].includes(currentMonth)) {
        recommendations.push({
          type: 'seasonal_adjustment',
          adjustment: 'increase',
          percentage: 25,
          reasoning: 'Peak agricultural season - increase stock by 25%'
        });
      }
    }

    return recommendations;
  }

  // Get supplier performance dashboard
  async getSupplierDashboard(supplierId) {
    try {
      const metrics = await this.calculateSupplierMetrics(supplierId);
      const rankings = await this.rankSuppliers();
      const supplierRank = rankings.find(r => r.supplierId.toString() === supplierId.toString());

      const dashboard = {
        supplierId,
        metrics,
        rank: supplierRank ? supplierRank.rank : null,
        totalSuppliers: rankings.length,
        performance: this.analyzePerformance(metrics),
        recommendations: this.generateSupplierRecommendations(metrics)
      };

      return dashboard;
    } catch (error) {
      logger.error('Error getting supplier dashboard:', error);
      return null;
    }
  }

  // Analyze supplier performance
  analyzePerformance(metrics) {
    const analysis = {
      overall: 'good',
      strengths: [],
      weaknesses: [],
      score: this.calculateCompositeScore(metrics)
    };

    // Analyze on-time delivery
    if (metrics.onTimeDeliveryRate >= 0.95) {
      analysis.strengths.push('Excellent on-time delivery rate');
    } else if (metrics.onTimeDeliveryRate >= 0.85) {
      analysis.strengths.push('Good on-time delivery rate');
    } else {
      analysis.weaknesses.push('Needs improvement in delivery timeliness');
    }

    // Analyze rating
    if (metrics.averageRating >= 4.5) {
      analysis.strengths.push('Outstanding customer satisfaction');
    } else if (metrics.averageRating >= 4.0) {
      analysis.strengths.push('Good customer satisfaction');
    } else {
      analysis.weaknesses.push('Customer satisfaction needs improvement');
    }

    // Analyze return rate
    if (metrics.returnRate <= 0.05) {
      analysis.strengths.push('Low return rate');
    } else if (metrics.returnRate <= 0.10) {
      analysis.strengths.push('Acceptable return rate');
    } else {
      analysis.weaknesses.push('High return rate needs attention');
    }

    // Overall assessment
    if (analysis.score >= 0.8) {
      analysis.overall = 'excellent';
    } else if (analysis.score >= 0.6) {
      analysis.overall = 'good';
    } else if (analysis.score >= 0.4) {
      analysis.overall = 'fair';
    } else {
      analysis.overall = 'needs_improvement';
    }

    return analysis;
  }

  // Generate supplier recommendations
  generateSupplierRecommendations(metrics) {
    const recommendations = [];

    if (metrics.onTimeDeliveryRate < 0.9) {
      recommendations.push({
        type: 'delivery_improvement',
        priority: 'high',
        action: 'Optimize delivery routes and improve logistics coordination',
        expectedImpact: 'Increase on-time delivery rate by 10-15%'
      });
    }

    if (metrics.averageRating < 4.0) {
      recommendations.push({
        type: 'quality_improvement',
        priority: 'high',
        action: 'Implement quality control measures and gather customer feedback',
        expectedImpact: 'Improve customer satisfaction rating'
      });
    }

    if (metrics.returnRate > 0.1) {
      recommendations.push({
        type: 'return_reduction',
        priority: 'medium',
        action: 'Review product descriptions and quality standards',
        expectedImpact: 'Reduce return rate by 20-30%'
      });
    }

    if (metrics.totalOrders < 50) {
      recommendations.push({
        type: 'marketing',
        priority: 'medium',
        action: 'Increase marketing efforts and expand product catalog',
        expectedImpact: 'Boost order volume and market presence'
      });
    }

    return recommendations;
  }
}

module.exports = new SupplierService();