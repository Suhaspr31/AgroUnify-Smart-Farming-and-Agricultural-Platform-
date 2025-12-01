const express = require('express');
const {
  sendSMS,
  sendBulkSMS,
  sendWeatherAlert,
  sendPriceAlert,
} = require('./smsController');

const router = express.Router();

// Send single SMS
router.post('/send', sendSMS);

// Send bulk SMS
router.post('/send-bulk', sendBulkSMS);

// Send weather alert SMS
router.post('/weather-alert', sendWeatherAlert);

// Send price alert SMS
router.post('/price-alert', sendPriceAlert);

module.exports = router;