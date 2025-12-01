const express = require('express');
const router = express.Router();
const cropRecommendationController = require('./cropRecommendation.controller');

router.post('/crop', cropRecommendationController.recommendCrop);

module.exports = router;