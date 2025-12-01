const supplierService = require('./supplier.service');
const { successResponse, errorResponse } = require('../../utils/response');
const logger = require('../../core/logger');

class MarketplaceController {
  async getSupplierRankings(req, res) {
    try {
      const { category, region, limit = 20 } = req.query;
      const rankings = await supplierService.rankSuppliers(category, region ? region.split(',') : null, limit);

      return successResponse(res, rankings, 'Supplier rankings retrieved successfully');
    } catch (error) {
      logger.error('Get supplier rankings error:', error);
      return errorResponse(res, error.message, 500);
    }
  }

  async matchSuppliersToDemand(req, res) {
    try {
      const { cropType, category, quantity, region } = req.body;

      if (!cropType && !category) {
        return errorResponse(res, 'Either cropType or category must be specified', 400);
      }

      if (!quantity || quantity <= 0) {
        return errorResponse(res, 'Valid quantity is required', 400);
      }

      const matches = await supplierService.matchSuppliersToDemand({
        cropType: cropType ? cropType.split(',') : null,
        category,
        quantity: parseInt(quantity),
        region: region ? region.split(',') : null
      });

      return successResponse(res, matches, 'Supplier matches retrieved successfully');
    } catch (error) {
      logger.error('Match suppliers to demand error:', error);
      return errorResponse(res, error.message, 500);
    }
  }

  async getSupplierDashboard(req, res) {
    try {
      const { supplierId } = req.params;
      const dashboard = await supplierService.getSupplierDashboard(supplierId);

      if (!dashboard) {
        return errorResponse(res, 'Supplier dashboard not found', 404);
      }

      return successResponse(res, dashboard, 'Supplier dashboard retrieved successfully');
    } catch (error) {
      logger.error('Get supplier dashboard error:', error);
      return errorResponse(res, error.message, 500);
    }
  }

  async predictSupplierDemand(req, res) {
    try {
      const { supplierId } = req.params;
      const { cropType, days = 30 } = req.query;

      const prediction = await supplierService.predictSupplierDemand(
        supplierId,
        cropType,
        parseInt(days)
      );

      return successResponse(res, prediction, 'Supplier demand prediction retrieved successfully');
    } catch (error) {
      logger.error('Predict supplier demand error:', error);
      return errorResponse(res, error.message, 500);
    }
  }

  async getMarketInsights(req, res) {
    try {
      const { category, region } = req.query;

      // Get top suppliers
      const topSuppliers = await supplierService.rankSuppliers(category, region ? region.split(',') : null, 10);

      // Get market statistics
      const marketStats = {
        totalSuppliers: topSuppliers.length,
        averageRating: topSuppliers.reduce((sum, s) => sum + s.metrics.averageRating, 0) / topSuppliers.length,
        averageDeliveryTime: topSuppliers.reduce((sum, s) => sum + s.metrics.averageDeliveryTime, 0) / topSuppliers.length,
        totalProducts: topSuppliers.reduce((sum, s) => sum + s.metrics.totalProducts, 0),
        totalOrders: topSuppliers.reduce((sum, s) => sum + s.metrics.totalOrders, 0)
      };

      const insights = {
        marketStats,
        topSuppliers: topSuppliers.slice(0, 5),
        trends: this.analyzeMarketTrends(topSuppliers),
        recommendations: this.generateMarketRecommendations(marketStats)
      };

      return successResponse(res, insights, 'Market insights retrieved successfully');
    } catch (error) {
      logger.error('Get market insights error:', error);
      return errorResponse(res, error.message, 500);
    }
  }

  // Helper methods
  analyzeMarketTrends(suppliers) {
    const trends = {
      deliveryImprovement: 0,
      ratingTrends: 0,
      newEntrants: 0
    };

    // Analyze delivery time trends
    const avgDeliveryTime = suppliers.reduce((sum, s) => sum + s.metrics.averageDeliveryTime, 0) / suppliers.length;
    trends.deliveryImprovement = avgDeliveryTime < 3 ? 'improving' : 'stable';

    // Analyze rating trends
    const avgRating = suppliers.reduce((sum, s) => sum + s.metrics.averageRating, 0) / suppliers.length;
    trends.ratingTrends = avgRating > 4.2 ? 'excellent' : avgRating > 3.8 ? 'good' : 'needs_improvement';

    // Count suppliers with low order volume (potential new entrants)
    const lowVolumeSuppliers = suppliers.filter(s => s.metrics.totalOrders < 10).length;
    trends.newEntrants = lowVolumeSuppliers > suppliers.length * 0.3 ? 'high' : 'normal';

    return trends;
  }

  generateMarketRecommendations(stats) {
    const recommendations = [];

    if (stats.averageDeliveryTime > 4) {
      recommendations.push({
        type: 'logistics_improvement',
        priority: 'high',
        description: 'Average delivery time is high. Consider optimizing logistics and warehouse locations.',
        impact: 'Reduce delivery time by 20-30%'
      });
    }

    if (stats.averageRating < 4.0) {
      recommendations.push({
        type: 'quality_focus',
        priority: 'high',
        description: 'Overall supplier ratings are below optimal. Focus on quality control and supplier training.',
        impact: 'Improve customer satisfaction by 15-25%'
      });
    }

    if (stats.totalProducts < 1000) {
      recommendations.push({
        type: 'product_expansion',
        priority: 'medium',
        description: 'Product catalog is limited. Encourage suppliers to expand their offerings.',
        impact: 'Increase product variety and customer choice'
      });
    }

    return recommendations;
  }
}

module.exports = new MarketplaceController();