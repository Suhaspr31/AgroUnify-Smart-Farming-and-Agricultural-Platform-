const Product = require('./product.model');
const Order = require('../order/order.model');
const logger = require('../../core/logger');

class InventoryService {
  constructor() {
    this.safetyStockMultiplier = 1.5;
    this.leadTimeDays = 7;
    this.serviceLevel = 0.95; // 95% service level
  }

  // Time series forecasting for stock prediction using simple exponential smoothing
  async forecastDemand(productId, periods = 30) {
    try {
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

      // Get historical sales data
      const salesData = await this.getHistoricalSales(productId, sixMonthsAgo);

      if (salesData.length < 7) {
        return this.simpleAverageForecast(salesData, periods);
      }

      // Use exponential smoothing for forecasting
      return this.exponentialSmoothingForecast(salesData, periods);
    } catch (error) {
      logger.error('Error forecasting demand:', error);
      return [];
    }
  }

  // Calculate optimal reorder point
  async calculateReorderPoint(productId) {
    try {
      const product = await Product.findById(productId);
      if (!product) throw new Error('Product not found');

      const dailyDemand = await this.calculateAverageDailyDemand(productId);
      const demandVariability = await this.calculateDemandVariability(productId);

      // Reorder point = Average daily demand × Lead time + Safety stock
      const leadTimeDemand = dailyDemand * this.leadTimeDays;
      const safetyStock = demandVariability * this.safetyStockMultiplier;

      const reorderPoint = Math.ceil(leadTimeDemand + safetyStock);

      return {
        reorderPoint,
        leadTimeDemand: Math.ceil(leadTimeDemand),
        safetyStock: Math.ceil(safetyStock),
        dailyDemand,
        demandVariability
      };
    } catch (error) {
      logger.error('Error calculating reorder point:', error);
      return null;
    }
  }

  // Predict stock requirements for next period
  async predictStockRequirements(productId, days = 30) {
    try {
      const forecast = await this.forecastDemand(productId, days);
      const currentStock = await this.getCurrentStock(productId);

      const totalPredictedDemand = forecast.reduce((sum, demand) => sum + demand, 0);
      const recommendedStock = Math.ceil(totalPredictedDemand * 1.1); // 10% buffer

      return {
        currentStock,
        predictedDemand: totalPredictedDemand,
        recommendedStock,
        shortfall: Math.max(0, recommendedStock - currentStock),
        forecast
      };
    } catch (error) {
      logger.error('Error predicting stock requirements:', error);
      return null;
    }
  }

  // ARIMA-style forecasting (simplified implementation)
  async arimaForecast(productId, periods = 30) {
    try {
      const salesData = await this.getHistoricalSales(productId);

      if (salesData.length < 14) {
        return this.simpleAverageForecast(salesData, periods);
      }

      // Simplified ARIMA(1,0,1) implementation
      const arimaResult = this.simpleARIMA(salesData, periods);

      return arimaResult;
    } catch (error) {
      logger.error('Error in ARIMA forecast:', error);
      return [];
    }
  }

  // LSTM-style forecasting (simplified - in production, use TensorFlow.js or similar)
  async lstmForecast(productId, periods = 30) {
    try {
      const salesData = await this.getHistoricalSales(productId);

      if (salesData.length < 21) {
        return this.simpleAverageForecast(salesData, periods);
      }

      // Simplified LSTM-like forecasting using weighted moving average
      return this.weightedMovingAverageForecast(salesData, periods);
    } catch (error) {
      logger.error('Error in LSTM forecast:', error);
      return [];
    }
  }

  // Update inventory levels based on orders
  async updateInventoryFromOrder(orderId) {
    try {
      const order = await Order.findById(orderId).populate('items.product');
      if (!order) throw new Error('Order not found');

      const updates = [];

      for (const item of order.items) {
        const product = item.product;
        if (product) {
          const newStock = Math.max(0, product.stock - item.quantity);
          updates.push({
            updateOne: {
              filter: { _id: product._id },
              update: {
                stock: newStock,
                $inc: { purchaseCount: item.quantity },
                updatedAt: new Date()
              }
            }
          });
        }
      }

      if (updates.length > 0) {
        await Product.bulkWrite(updates);
        logger.info(`Updated inventory for ${updates.length} products from order ${orderId}`);
      }

      return updates.length;
    } catch (error) {
      logger.error('Error updating inventory from order:', error);
      return 0;
    }
  }

  // Get low stock alerts
  async getLowStockAlerts(threshold = 10) {
    try {
      const lowStockProducts = await Product.find({
        stock: { $lte: threshold },
        isActive: true
      })
        .populate('vendor', 'name email')
        .sort({ stock: 1 });

      const alerts = [];

      for (const product of lowStockProducts) {
        const reorderInfo = await this.calculateReorderPoint(product._id);
        alerts.push({
          product: {
            id: product._id,
            name: product.name,
            stock: product.stock,
            unit: product.unit
          },
          vendor: product.vendor,
          reorderPoint: reorderInfo?.reorderPoint || 0,
          recommendedOrder: Math.max(0, (reorderInfo?.reorderPoint || 0) - product.stock)
        });
      }

      return alerts;
    } catch (error) {
      logger.error('Error getting low stock alerts:', error);
      return [];
    }
  }

  // Seasonal inventory optimization
  async optimizeSeasonalInventory() {
    try {
      const currentMonth = new Date().toLocaleString('default', { month: 'long' }).toLowerCase();

      // Define seasonal demand multipliers
      const seasonalMultipliers = {
        paddy: { june: 1.8, july: 2.0, august: 1.9, september: 1.5, october: 1.2 },
        wheat: { november: 1.6, december: 1.8, january: 1.5, february: 1.3, march: 1.1 },
        maize: { june: 1.4, july: 1.6, august: 1.5, september: 1.2 },
        cotton: { april: 1.3, may: 1.5, june: 1.7, july: 1.6, august: 1.4 }
      };

      const updates = [];

      for (const [crop, multipliers] of Object.entries(seasonalMultipliers)) {
        const multiplier = multipliers[currentMonth] || 1.0;

        if (multiplier > 1.0) {
          const products = await Product.find({
            cropType: crop,
            isActive: true
          });

          for (const product of products) {
            const seasonalStock = Math.ceil(product.stock * multiplier);
            updates.push({
              updateOne: {
                filter: { _id: product._id },
                update: {
                  stock: seasonalStock,
                  updatedAt: new Date()
                }
              }
            });
          }
        }
      }

      if (updates.length > 0) {
        await Product.bulkWrite(updates);
        logger.info(`Optimized seasonal inventory for ${updates.length} products`);
      }

      return updates.length;
    } catch (error) {
      logger.error('Error optimizing seasonal inventory:', error);
      return 0;
    }
  }

  // Helper methods
  async getHistoricalSales(productId, startDate = null) {
    try {
      const matchConditions = {
        'items.product': productId,
        status: { $in: ['delivered', 'shipped'] }
      };

      if (startDate) {
        matchConditions.createdAt = { $gte: startDate };
      }

      const sales = await Order.aggregate([
        { $match: matchConditions },
        { $unwind: '$items' },
        { $match: { 'items.product': productId } },
        {
          $group: {
            _id: {
              $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
            },
            quantity: { $sum: '$items.quantity' }
          }
        },
        { $sort: { '_id': 1 } }
      ]);

      return sales.map(sale => ({
        date: sale._id,
        quantity: sale.quantity
      }));
    } catch (error) {
      logger.error('Error getting historical sales:', error);
      return [];
    }
  }

  async calculateAverageDailyDemand(productId) {
    try {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const result = await Order.aggregate([
        {
          $match: {
            'items.product': productId,
            createdAt: { $gte: thirtyDaysAgo },
            status: { $in: ['delivered', 'shipped'] }
          }
        },
        { $unwind: '$items' },
        { $match: { 'items.product': productId } },
        {
          $group: {
            _id: null,
            totalQuantity: { $sum: '$items.quantity' }
          }
        }
      ]);

      return result.length > 0 ? result[0].totalQuantity / 30 : 0;
    } catch (error) {
      logger.error('Error calculating average daily demand:', error);
      return 0;
    }
  }

  async calculateDemandVariability(productId) {
    try {
      const salesData = await this.getHistoricalSales(productId);
      if (salesData.length < 7) return 0;

      const quantities = salesData.map(sale => sale.quantity);
      const mean = quantities.reduce((sum, q) => sum + q, 0) / quantities.length;
      const variance = quantities.reduce((sum, q) => sum + Math.pow(q - mean, 2), 0) / quantities.length;

      return Math.sqrt(variance); // Standard deviation
    } catch (error) {
      logger.error('Error calculating demand variability:', error);
      return 0;
    }
  }

  async getCurrentStock(productId) {
    try {
      const product = await Product.findById(productId);
      return product ? product.stock : 0;
    } catch (error) {
      logger.error('Error getting current stock:', error);
      return 0;
    }
  }

  simpleAverageForecast(salesData, periods) {
    if (salesData.length === 0) return new Array(periods).fill(0);

    const average = salesData.reduce((sum, sale) => sum + sale.quantity, 0) / salesData.length;
    return new Array(periods).fill(average);
  }

  exponentialSmoothingForecast(salesData, periods, alpha = 0.3) {
    if (salesData.length === 0) return new Array(periods).fill(0);

    const forecast = [];
    let smoothedValue = salesData[0].quantity;

    // Calculate smoothed values for historical data
    for (let i = 1; i < salesData.length; i++) {
      smoothedValue = alpha * salesData[i].quantity + (1 - alpha) * smoothedValue;
    }

    // Forecast future periods
    for (let i = 0; i < periods; i++) {
      forecast.push(smoothedValue);
      smoothedValue = alpha * smoothedValue + (1 - alpha) * smoothedValue; // Trend dampening
    }

    return forecast;
  }

  simpleARIMA(salesData, periods) {
    // Simplified ARIMA implementation
    const n = salesData.length;
    if (n < 2) return this.simpleAverageForecast(salesData, periods);

    // Calculate differences (I component)
    const differences = [];
    for (let i = 1; i < n; i++) {
      differences.push(salesData[i].quantity - salesData[i - 1].quantity);
    }

    // Simple AR(1) on differences
    const arCoefficient = this.calculateAR1Coefficient(differences);
    const forecast = [];

    let lastValue = salesData[n - 1].quantity;
    let lastDifference = differences[differences.length - 1];

    for (let i = 0; i < periods; i++) {
      const predictedDifference = arCoefficient * lastDifference;
      const predictedValue = lastValue + predictedDifference;
      forecast.push(Math.max(0, predictedValue));

      lastValue = predictedValue;
      lastDifference = predictedDifference;
    }

    return forecast;
  }

  calculateAR1Coefficient(data) {
    if (data.length < 2) return 0;

    let numerator = 0;
    let denominator = 0;

    for (let i = 1; i < data.length; i++) {
      numerator += data[i] * data[i - 1];
      denominator += data[i - 1] * data[i - 1];
    }

    return denominator > 0 ? numerator / denominator : 0;
  }

  weightedMovingAverageForecast(salesData, periods, weights = [0.5, 0.3, 0.2]) {
    if (salesData.length === 0) return new Array(periods).fill(0);

    const n = salesData.length;
    const forecast = [];

    for (let i = 0; i < periods; i++) {
      let weightedSum = 0;
      let totalWeight = 0;

      for (let j = 0; j < Math.min(weights.length, n); j++) {
        const weight = weights[j];
        const value = salesData[n - 1 - j].quantity;
        weightedSum += value * weight;
        totalWeight += weight;
      }

      forecast.push(totalWeight > 0 ? weightedSum / totalWeight : 0);
    }

    return forecast;
  }
}

module.exports = new InventoryService();