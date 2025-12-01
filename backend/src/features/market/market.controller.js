const marketService = require('./market.service');
const logger = require('../../core/logger');

// Get latest market prices
const getLatestPrices = async (req, res) => {
  try {
    const { commodities, state, limit } = req.query;

    const params = {
      commodities: commodities ? commodities.split(',') : [],
      state: state || '',
      limit: parseInt(limit) || 50
    };

    const result = await marketService.getLatestPrices(params);

    res.json({
      success: result.success,
      data: result.data,
      source: result.source,
      totalRecords: result.totalRecords,
      lastUpdated: result.lastUpdated,
      message: result.message
    });
  } catch (error) {
    logger.error('Error in getLatestPrices:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch market prices',
      error: error.message
    });
  }
};

// Get price trends for a specific commodity
const getPriceTrends = async (req, res) => {
  try {
    const { commodity, state, days } = req.query;

    if (!commodity) {
      return res.status(400).json({
        success: false,
        message: 'Commodity parameter is required'
      });
    }

    const params = {
      commodity: commodity,
      state: state || '',
      days: parseInt(days) || 30
    };

    const result = await marketService.getPriceTrends(params);

    res.json({
      success: result.success,
      data: result.data,
      source: result.source,
      message: result.message
    });
  } catch (error) {
    logger.error('Error in getPriceTrends:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch price trends',
      error: error.message
    });
  }
};

// Get available commodities
const getAvailableCommodities = async (req, res) => {
  try {
    const commodities = marketService.getAvailableCommodities();

    res.json({
      success: true,
      data: commodities
    });
  } catch (error) {
    logger.error('Error in getAvailableCommodities:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch available commodities',
      error: error.message
    });
  }
};

// Get available states
const getAvailableStates = async (req, res) => {
  try {
    const states = await marketService.getAvailableStates();

    res.json({
      success: true,
      data: states
    });
  } catch (error) {
    logger.error('Error in getAvailableStates:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch available states',
      error: error.message
    });
  }
};

// Get market statistics
const getMarketStats = async (req, res) => {
  try {
    const { commodity, state } = req.query;

    // Get latest prices for stats calculation
    const latestResult = await marketService.getLatestPrices({
      commodities: commodity ? [commodity] : [],
      state: state || '',
      limit: 100
    });

    if (!latestResult.success || !latestResult.data.length) {
      return res.json({
        success: true,
        data: {
          totalCommodities: 0,
          averagePrice: 0,
          priceRange: { min: 0, max: 0 },
          topCommodities: [],
          lastUpdated: new Date()
        }
      });
    }

    const data = latestResult.data;
    const prices = data.map(item => item.price).filter(p => p > 0);

    const stats = {
      totalCommodities: data.length,
      averagePrice: prices.length > 0 ? Math.round(prices.reduce((a, b) => a + b, 0) / prices.length) : 0,
      priceRange: {
        min: prices.length > 0 ? Math.min(...prices) : 0,
        max: prices.length > 0 ? Math.max(...prices) : 0
      },
      topCommodities: data
        .sort((a, b) => b.price - a.price)
        .slice(0, 5)
        .map(item => ({
          commodity: item.commodity,
          price: item.price,
          state: item.state
        })),
      lastUpdated: latestResult.lastUpdated
    };

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    logger.error('Error in getMarketStats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch market statistics',
      error: error.message
    });
  }
};

module.exports = {
  getLatestPrices,
  getPriceTrends,
  getAvailableCommodities,
  getAvailableStates,
  getMarketStats
};