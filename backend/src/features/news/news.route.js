const express = require('express');
const rateLimit = require('express-rate-limit');
const router = express.Router();
const newsController = require('./news.controller');

// Basic rate limiter to protect NewsAPI quota
const limiter = rateLimit({
	windowMs: 60 * 1000, // 1 minute
	max: 60, // limit each IP to 60 requests per windowMs
	standardHeaders: true,
	legacyHeaders: false
});

router.use(limiter);

// GET /api/v1/news/agriculture
router.get('/agriculture', newsController.getAgricultureNews);

// GET /api/v1/news/top-headlines
router.get('/top-headlines', newsController.getTopHeadlines);

// GET /api/v1/news/search?q=... 
router.get('/search', newsController.searchNews);

// GET /api/v1/news/history?date=YYYY-MM-DD  -> lists dates or returns articles for a date
router.get('/history', newsController.getHistory);

// Server-Sent Events stream for important alerts
router.get('/alerts/stream', newsController.alertsStream);

module.exports = router;
