const express = require('express');
const router = express.Router();
const {
  getLatestPrices,
  getPriceTrends,
  getAvailableCommodities,
  getAvailableStates,
  getMarketStats
} = require('./market.controller');

// Get latest market prices
router.get('/prices', getLatestPrices);

// Get price trends for a specific commodity
router.get('/trends', getPriceTrends);

// Get available commodities
router.get('/commodities', getAvailableCommodities);

// Get available states
router.get('/states', getAvailableStates);

// Get market statistics
router.get('/stats', getMarketStats);

// Get products (alias for marketplace products)
router.get('/products', getLatestPrices);

module.exports = router;