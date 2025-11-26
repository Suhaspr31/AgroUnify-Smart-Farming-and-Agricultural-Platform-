const weatherService = require('./weather.service');
const { successResponse, errorResponse } = require('../../utils/response');
const logger = require('../../core/logger');

class WeatherController {
  async getCurrentWeather(req, res) {
    try {
      const { city, lat, lon } = req.query;
      
      if (!city && (!lat || !lon)) {
        return errorResponse(res, 'City or coordinates required', 400);
      }

      const weather = await weatherService.getCurrentWeather({ city, lat, lon });
      return successResponse(res, weather, 'Weather data retrieved successfully');
    } catch (error) {
      logger.error('Get current weather error:', error);
      return errorResponse(res, error.message, 500);
    }
  }

  async getWeatherForecast(req, res) {
    try {
      const { city, lat, lon, days = 5 } = req.query;
      
      if (!city && (!lat || !lon)) {
        return errorResponse(res, 'City or coordinates required', 400);
      }

      const forecast = await weatherService.getWeatherForecast({ 
        city, 
        lat, 
        lon, 
        days: parseInt(days) 
      });
      return successResponse(res, forecast, 'Forecast retrieved successfully');
    } catch (error) {
      logger.error('Get weather forecast error:', error);
      return errorResponse(res, error.message, 500);
    }
  }

  async getWeatherAlerts(req, res) {
    try {
      const { city } = req.query;
      const alerts = await weatherService.getWeatherAlerts(city);
      return successResponse(res, alerts, 'Weather alerts retrieved successfully');
    } catch (error) {
      logger.error('Get weather alerts error:', error);
      return errorResponse(res, error.message, 500);
    }
  }

  async getWeatherHistory(req, res) {
    try {
      const { city, startDate, endDate } = req.query;
      const history = await weatherService.getWeatherHistory({
        city,
        startDate,
        endDate
      });
      return successResponse(res, history, 'Weather history retrieved successfully');
    } catch (error) {
      logger.error('Get weather history error:', error);
      return errorResponse(res, error.message, 500);
    }
  }
}

module.exports = new WeatherController();
