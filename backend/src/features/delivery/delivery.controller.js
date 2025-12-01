const deliveryService = require('./delivery.service');
const { successResponse, errorResponse } = require('../../utils/response');
const logger = require('../../core/logger');

class DeliveryController {
  async optimizeRoute(req, res) {
    try {
      const { deliveryPoints, startPoint, method = 'tsp' } = req.body;

      if (!deliveryPoints || !Array.isArray(deliveryPoints)) {
        return errorResponse(res, 'Delivery points array is required', 400);
      }

      let result;
      switch (method) {
        case 'genetic':
          result = await deliveryService.geneticAlgorithmOptimization(deliveryPoints);
          break;
        case 'annealing':
          result = await deliveryService.simulatedAnnealingOptimization(deliveryPoints);
          break;
        case 'tsp':
        default:
          result = await deliveryService.calculateTSPRoute(deliveryPoints, startPoint);
          break;
      }

      return successResponse(res, result, 'Route optimized successfully');
    } catch (error) {
      logger.error('Optimize route error:', error);
      return errorResponse(res, error.message, 500);
    }
  }

  async optimizeVehicleRoutes(req, res) {
    try {
      const { orders, warehouseLocation, vehicleCapacity } = req.body;

      if (!orders || !Array.isArray(orders)) {
        return errorResponse(res, 'Orders array is required', 400);
      }

      if (!warehouseLocation) {
        return errorResponse(res, 'Warehouse location is required', 400);
      }

      const result = await deliveryService.optimizeVehicleRoutes(orders, warehouseLocation, vehicleCapacity);
      return successResponse(res, result, 'Vehicle routes optimized successfully');
    } catch (error) {
      logger.error('Optimize vehicle routes error:', error);
      return errorResponse(res, error.message, 500);
    }
  }

  async optimizeWarehouseAllocation(req, res) {
    try {
      const { deliveryPoints, warehouseCandidates, numberOfWarehouses = 3 } = req.body;

      if (!deliveryPoints || !Array.isArray(deliveryPoints)) {
        return errorResponse(res, 'Delivery points array is required', 400);
      }

      if (!warehouseCandidates || !Array.isArray(warehouseCandidates)) {
        return errorResponse(res, 'Warehouse candidates array is required', 400);
      }

      const result = await deliveryService.optimizeWarehouseAllocation(deliveryPoints, warehouseCandidates, numberOfWarehouses);
      return successResponse(res, result, 'Warehouse allocation optimized successfully');
    } catch (error) {
      logger.error('Optimize warehouse allocation error:', error);
      return errorResponse(res, error.message, 500);
    }
  }

  async optimizeDeliveryZones(req, res) {
    try {
      const { deliveryPoints, numberOfZones = 5 } = req.body;

      if (!deliveryPoints || !Array.isArray(deliveryPoints)) {
        return errorResponse(res, 'Delivery points array is required', 400);
      }

      const result = await deliveryService.optimizeDeliveryZones(deliveryPoints, numberOfZones);
      return successResponse(res, result, 'Delivery zones optimized successfully');
    } catch (error) {
      logger.error('Optimize delivery zones error:', error);
      return errorResponse(res, error.message, 500);
    }
  }

  async calculateDeliveryCost(req, res) {
    try {
      const { distance, stops } = req.body;

      if (typeof distance !== 'number' || distance < 0) {
        return errorResponse(res, 'Valid distance is required', 400);
      }

      if (typeof stops !== 'number' || stops < 0) {
        return errorResponse(res, 'Valid number of stops is required', 400);
      }

      // Use the delivery service's cost calculation method
      const cost = deliveryService.calculateDeliveryCost(distance, stops);
      return successResponse(res, { cost }, 'Delivery cost calculated successfully');
    } catch (error) {
      logger.error('Calculate delivery cost error:', error);
      return errorResponse(res, error.message, 500);
    }
  }
}

module.exports = new DeliveryController();