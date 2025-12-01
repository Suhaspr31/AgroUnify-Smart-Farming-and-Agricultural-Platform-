const axios = require('axios');
const logger = require('../../core/logger');

// Get satellite imagery for crop monitoring
const getSatelliteImagery = async (req, res) => {
  try {
    const { polygon, startDate, endDate, layer = 'NDVI' } = req.body;

    if (!polygon || !startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: 'Polygon coordinates, start date, and end date are required',
      });
    }

    // Call Farmonaut API for satellite imagery
    const response = await axios.get(`${process.env.FARMONAUT_BASE_URL}/satellite/imagery`, {
      params: {
        polygon: JSON.stringify(polygon),
        start_date: startDate,
        end_date: endDate,
        layer,
        api_key: process.env.FARMONAUT_API_KEY,
      },
    });

    logger.info('Satellite imagery fetched successfully', { service: 'crop-monitoring' });

    res.status(200).json({
      success: true,
      data: response.data,
      layer,
      dateRange: { startDate, endDate },
    });
  } catch (error) {
    logger.error('Error fetching satellite imagery:', error, { service: 'crop-monitoring' });
    res.status(500).json({
      success: false,
      message: 'Failed to fetch satellite imagery',
      error: error.message,
    });
  }
};

// Get crop health analysis
const getCropHealth = async (req, res) => {
  try {
    const { fieldId, date } = req.params;

    const response = await axios.get(`${process.env.FARMONAUT_BASE_URL}/crop/health/${fieldId}`, {
      params: {
        date,
        api_key: process.env.FARMONAUT_API_KEY,
      },
    });

    res.status(200).json({
      success: true,
      data: response.data,
      fieldId,
      analysisDate: date,
    });
  } catch (error) {
    logger.error('Error fetching crop health data:', error, { service: 'crop-monitoring' });
    res.status(500).json({
      success: false,
      message: 'Failed to fetch crop health data',
      error: error.message,
    });
  }
};

// Get vegetation indices
const getVegetationIndices = async (req, res) => {
  try {
    const { fieldId, startDate, endDate } = req.query;

    const response = await axios.get(`${process.env.FARMONAUT_BASE_URL}/vegetation/indices`, {
      params: {
        field_id: fieldId,
        start_date: startDate,
        end_date: endDate,
        api_key: process.env.FARMONAUT_API_KEY,
      },
    });

    res.status(200).json({
      success: true,
      data: response.data,
      fieldId,
      dateRange: { startDate, endDate },
    });
  } catch (error) {
    logger.error('Error fetching vegetation indices:', error, { service: 'crop-monitoring' });
    res.status(500).json({
      success: false,
      message: 'Failed to fetch vegetation indices',
      error: error.message,
    });
  }
};

// Get field boundaries and zones
const getFieldBoundaries = async (req, res) => {
  try {
    const { farmId } = req.params;

    const response = await axios.get(`${process.env.FARMONAUT_BASE_URL}/fields/${farmId}/boundaries`, {
      params: {
        api_key: process.env.FARMONAUT_API_KEY,
      },
    });

    res.status(200).json({
      success: true,
      data: response.data,
      farmId,
    });
  } catch (error) {
    logger.error('Error fetching field boundaries:', error, { service: 'crop-monitoring' });
    res.status(500).json({
      success: false,
      message: 'Failed to fetch field boundaries',
      error: error.message,
    });
  }
};

// Get irrigation recommendations
const getIrrigationRecommendations = async (req, res) => {
  try {
    const { fieldId } = req.params;

    const response = await axios.get(`${process.env.FARMONAUT_BASE_URL}/irrigation/recommendations/${fieldId}`, {
      params: {
        api_key: process.env.FARMONAUT_API_KEY,
      },
    });

    res.status(200).json({
      success: true,
      data: response.data,
      fieldId,
    });
  } catch (error) {
    logger.error('Error fetching irrigation recommendations:', error, { service: 'crop-monitoring' });
    res.status(500).json({
      success: false,
      message: 'Failed to fetch irrigation recommendations',
      error: error.message,
    });
  }
};

// Get pest detection alerts
const getPestDetection = async (req, res) => {
  try {
    const { fieldId, date } = req.query;

    const response = await axios.get(`${process.env.FARMONAUT_BASE_URL}/pest/detection`, {
      params: {
        field_id: fieldId,
        date,
        api_key: process.env.FARMONAUT_API_KEY,
      },
    });

    res.status(200).json({
      success: true,
      data: response.data,
      fieldId,
      detectionDate: date,
    });
  } catch (error) {
    logger.error('Error fetching pest detection data:', error, { service: 'crop-monitoring' });
    res.status(500).json({
      success: false,
      message: 'Failed to fetch pest detection data',
      error: error.message,
    });
  }
};

module.exports = {
  getSatelliteImagery,
  getCropHealth,
  getVegetationIndices,
  getFieldBoundaries,
  getIrrigationRecommendations,
  getPestDetection,
};