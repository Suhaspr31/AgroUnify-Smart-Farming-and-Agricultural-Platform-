const express = require('express');
const deliveryController = require('./delivery.controller');
const { authenticate, authorize } = require('../../middleware/auth');

const router = express.Router();

// Public routes for cost calculation
router.post('/calculate-cost', deliveryController.calculateDeliveryCost);

// Protected routes (admin/vendor)
router.use(authenticate);
router.use(authorize('admin', 'vendor'));

// Route optimization
router.post('/optimize-route', deliveryController.optimizeRoute);
router.post('/optimize-vehicle-routes', deliveryController.optimizeVehicleRoutes);
router.post('/optimize-warehouse-allocation', deliveryController.optimizeWarehouseAllocation);
router.post('/optimize-delivery-zones', deliveryController.optimizeDeliveryZones);

module.exports = router;