const express = require('express');
const {
  getSatelliteImagery,
  getCropHealth,
  getVegetationIndices,
  getFieldBoundaries,
  getIrrigationRecommendations,
  getPestDetection,
} = require('./cropMonitoringController');

const router = express.Router();

// Get satellite imagery
router.post('/satellite-imagery', getSatelliteImagery);

// Get crop health analysis
router.get('/crop-health/:fieldId/:date', getCropHealth);

// Get vegetation indices
router.get('/vegetation-indices', getVegetationIndices);

// Get field boundaries
router.get('/field-boundaries/:farmId', getFieldBoundaries);

// Get irrigation recommendations
router.get('/irrigation-recommendations/:fieldId', getIrrigationRecommendations);

// Get pest detection alerts
router.get('/pest-detection', getPestDetection);

module.exports = router;