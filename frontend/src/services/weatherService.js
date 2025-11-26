import axios from 'axios';
import { WEATHER_API_KEY, WEATHER_API_URL } from '../utils/constants';

const weatherClient = axios.create({
  baseURL: WEATHER_API_URL,
  timeout: 10000
});

export const weatherService = {
  getCurrentWeather: async (city) => {
    try {
      console.log('Fetching current weather for:', city);
      console.log('API Key:', WEATHER_API_KEY ? 'Present' : 'Missing');
      console.log('API URL:', WEATHER_API_URL);
      console.log('Full weatherClient baseURL:', weatherClient.defaults.baseURL);

      const response = await weatherClient.get('/weather', {
        params: {
          q: city,
          appid: WEATHER_API_KEY,
          units: 'metric'
        }
      });
      console.log('Weather API response:', response.data);
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Weather API error:', error.response?.data || error.message);
      console.error('Error status:', error.response?.status);
      console.error('Error config:', error.config);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch weather data'
      };
    }
  },

  getWeatherByCoords: async (lat, lon) => {
    try {
      const response = await weatherClient.get('/weather', {
        params: {
          lat,
          lon,
          appid: WEATHER_API_KEY,
          units: 'metric'
        }
      });
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch weather data'
      };
    }
  },

  getForecast: async (city, days = 5) => {
    try {
      const response = await weatherClient.get('/forecast', {
        params: {
          q: city,
          appid: WEATHER_API_KEY,
          units: 'metric',
          cnt: days * 8
        }
      });
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch forecast data'
      };
    }
  },

  getForecastByCoords: async (lat, lon, days = 5) => {
    try {
      const response = await weatherClient.get('/forecast', {
        params: {
          lat,
          lon,
          appid: WEATHER_API_KEY,
          units: 'metric',
          cnt: days * 8
        }
      });
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch forecast data'
      };
    }
  },

  searchCity: async (query) => {
    try {
      const response = await weatherClient.get('/find', {
        params: {
          q: query,
          appid: WEATHER_API_KEY,
          units: 'metric'
        }
      });
      return { success: true, data: response.data.list };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'City search failed'
      };
    }
  },

  getWeatherAlerts: async (lat, lon) => {
    try {
      const response = await weatherClient.get('/onecall', {
        params: {
          lat,
          lon,
          appid: WEATHER_API_KEY,
          exclude: 'minutely,hourly',
          units: 'metric'
        }
      });
      return {
        success: true,
        alerts: response.data.alerts || []
      };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to fetch weather alerts',
        alerts: []
      };
    }
  },

  parseWeatherData: (data) => {
    return {
      temperature: Math.round(data.main.temp),
      feelsLike: Math.round(data.main.feels_like),
      humidity: data.main.humidity,
      pressure: data.main.pressure,
      windSpeed: data.wind.speed,
      windDirection: data.wind.deg,
      description: data.weather[0].description,
      icon: data.weather[0].icon,
      condition: data.weather[0].main,
      visibility: data.visibility / 1000,
      cloudiness: data.clouds.all,
      sunrise: new Date(data.sys.sunrise * 1000),
      sunset: new Date(data.sys.sunset * 1000),
      city: data.name,
      country: data.sys.country
    };
  },

  getWeatherIcon: (iconCode) => {
    return `https://openweathermap.org/img/wn/${iconCode}@2x.png`;
  }
};

export default weatherService;
