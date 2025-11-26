const express = require('express');
const { query } = require('express-validator');
const weatherController = require('./weather.controller');
const { authenticate, optionalAuth } = require('../../middleware/auth');
const validate = require('../../middleware/validation');

const router = express.Router();

// Get current weather
router.get(
  '/current',
  optionalAuth,
  [
    query('city').optional().trim(),
    query('lat').optional().isFloat(),
    query('lon').optional().isFloat(),
    validate
  ],
  weatherController.getCurrentWeather
);

// Get weather forecast
router.get(
  '/forecast',
  optionalAuth,
  [
    query('city').optional().trim(),
    query('lat').optional().isFloat(),
    query('lon').optional().isFloat(),
    query('days').optional().isInt({ min: 1, max: 7 }),
    validate
  ],
  weatherController.getWeatherForecast
);

// Get weather alerts
router.get(
  '/alerts',
  authenticate,
  [
    query('city').trim().notEmpty().withMessage('City is required'),
    validate
  ],
  weatherController.getWeatherAlerts
);

// Get weather history
router.get(
  '/history',
  authenticate,
  [
    query('city').trim().notEmpty().withMessage('City is required'),
    query('startDate').optional().isISO8601(),
    query('endDate').optional().isISO8601(),
    validate
  ],
  weatherController.getWeatherHistory
);

module.exports = router;
