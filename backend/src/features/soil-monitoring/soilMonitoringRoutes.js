const express = require('express');
const {
  getSoilData,
  getSoilMoisture,
  getSoilTemperature,
  getSoilAnalysis,
  getSoilSensors,
} = require('./soilMonitoringController');

const router = express.Router();

// Get soil data for location
router.get('/data', getSoilData);

// Get soil moisture history
router.get('/moisture', getSoilMoisture);

// Get soil temperature
router.get('/temperature', getSoilTemperature);

// Get comprehensive soil analysis
router.get('/analysis', getSoilAnalysis);

// Get soil sensors data
router.get('/sensors/:farmId', getSoilSensors);

module.exports = router;