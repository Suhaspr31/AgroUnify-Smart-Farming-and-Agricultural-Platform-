const axios = require('axios');
const cropRecommendationService = require('./cropRecommendation.service');

const recommendCrop = async (req, res) => {
  try {
    const { location } = req.body;

    if (!location || !location.lat || !location.lng) {
      return res.status(400).json({
        success: false,
        message: 'Location with latitude and longitude is required'
      });
    }

    const recommendation = await cropRecommendationService.getCropRecommendation(location);

    res.json({
      success: true,
      data: recommendation
    });
  } catch (error) {
    console.error('Crop recommendation error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get crop recommendation',
      error: error.message
    });
  }
};

module.exports = {
  recommendCrop
};