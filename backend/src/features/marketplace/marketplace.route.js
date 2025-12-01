const express = require('express');
const marketplaceController = require('./marketplace.controller');
const { authenticate, authorize } = require('../../middleware/auth');

const router = express.Router();

// Public routes
router.get('/suppliers/rankings', marketplaceController.getSupplierRankings);
router.get('/insights', marketplaceController.getMarketInsights);

// Protected routes
router.use(authenticate);

// Supplier matching and demand prediction
router.post('/suppliers/match-demand', marketplaceController.matchSuppliersToDemand);
router.get('/suppliers/:supplierId/dashboard', marketplaceController.getSupplierDashboard);
router.get('/suppliers/:supplierId/demand-prediction', marketplaceController.predictSupplierDemand);

module.exports = router;