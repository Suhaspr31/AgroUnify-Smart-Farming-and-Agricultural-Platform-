const axios = require('axios');
const Weather = require('./weather.model');
const WeatherLog = require('./weather.log.model');
const logger = require('../../core/logger');

const WEATHER_API_KEY = process.env.WEATHER_API_KEY;
const WEATHER_API_URL = process.env.WEATHER_API_URL || 'https://api.openweathermap.org/data/2.5';

class WeatherService {
  async getCurrentWeather({ city, lat, lon }) {
    try {
      // Check if API key is configured
      if (!WEATHER_API_KEY || WEATHER_API_KEY === 'your_openweathermap_api_key' || WEATHER_API_KEY === 'demo_key_for_testing') {
        logger.warn('Weather API key not configured. Returning mock data.');
        return this.getMockWeatherData(city || 'Unknown');
      }

      let url = `${WEATHER_API_URL}/weather?appid=${WEATHER_API_KEY}&units=metric`;

      if (city) {
        url += `&q=${city}`;
      } else {
        url += `&lat=${lat}&lon=${lon}`;
      }

      const response = await axios.get(url);
      const data = response.data;

      const weatherData = {
        location: {
          city: data.name,
          country: data.sys.country,
          coordinates: {
            latitude: data.coord.lat,
            longitude: data.coord.lon
          }
        },
        current: {
          temperature: data.main.temp,
          feelsLike: data.main.feels_like,
          humidity: data.main.humidity,
          pressure: data.main.pressure,
          windSpeed: data.wind.speed,
          windDirection: this.getWindDirection(data.wind.deg),
          cloudCover: data.clouds.all,
          visibility: data.visibility,
          description: data.weather[0].description,
          icon: data.weather[0].icon
        },
        lastUpdated: new Date()
      };

      // Save to database
      await Weather.findOneAndUpdate(
        { 'location.city': data.name },
        weatherData,
        { upsert: true, new: true }
      );

      // Log weather data
      await WeatherLog.create({
        location: weatherData.location,
        temperature: weatherData.current.temperature,
        humidity: weatherData.current.humidity,
        windSpeed: weatherData.current.windSpeed,
        pressure: weatherData.current.pressure
      });

      return weatherData;
    } catch (error) {
      logger.error('Weather API error:', error);
      throw new Error('Failed to fetch weather data');
    }
  }

  async getWeatherForecast({ city, lat, lon, days = 5 }) {
    try {
      let url = `${WEATHER_API_URL}/forecast?appid=${WEATHER_API_KEY}&units=metric&cnt=${days * 8}`;

      if (city) {
        url += `&q=${city}`;
      } else {
        url += `&lat=${lat}&lon=${lon}`;
      }

      const response = await axios.get(url);
      const data = response.data;

      // Process forecast data
      const forecastByDay = {};
      
      data.list.forEach(item => {
        const date = new Date(item.dt * 1000).toDateString();
        
        if (!forecastByDay[date]) {
          forecastByDay[date] = {
            date: new Date(item.dt * 1000),
            temps: [],
            humidity: [],
            precipitation: 0,
            windSpeed: [],
            descriptions: [],
            icons: []
          };
        }

        forecastByDay[date].temps.push(item.main.temp);
        forecastByDay[date].humidity.push(item.main.humidity);
        forecastByDay[date].windSpeed.push(item.wind.speed);
        forecastByDay[date].descriptions.push(item.weather[0].description);
        forecastByDay[date].icons.push(item.weather[0].icon);
        
        if (item.rain) {
          forecastByDay[date].precipitation += item.rain['3h'] || 0;
        }
      });

      // Convert to array and calculate averages
      const forecast = Object.values(forecastByDay).map(day => ({
        date: day.date,
        tempMin: Math.min(...day.temps),
        tempMax: Math.max(...day.temps),
        humidity: Math.round(day.humidity.reduce((a, b) => a + b, 0) / day.humidity.length),
        precipitation: day.precipitation,
        windSpeed: Math.round(day.windSpeed.reduce((a, b) => a + b, 0) / day.windSpeed.length),
        description: day.descriptions[0],
        icon: day.icons[0]
      }));

      return {
        location: {
          city: data.city.name,
          country: data.city.country,
          coordinates: {
            latitude: data.city.coord.lat,
            longitude: data.city.coord.lon
          }
        },
        forecast
      };
    } catch (error) {
      logger.error('Weather forecast API error:', error);
      throw new Error('Failed to fetch weather forecast');
    }
  }

  async getWeatherAlerts(city) {
    // Check stored weather data for alerts
    const weather = await Weather.findOne({ 'location.city': city });

    if (!weather || !weather.alerts || weather.alerts.length === 0) {
      return {
        city,
        alerts: [],
        message: 'No weather alerts at this time'
      };
    }

    return {
      city,
      alerts: weather.alerts
    };
  }

  async getWeatherHistory({ city, startDate, endDate }) {
    const query = { 'location.city': city };

    if (startDate || endDate) {
      query.timestamp = {};
      if (startDate) query.timestamp.$gte = new Date(startDate);
      if (endDate) query.timestamp.$lte = new Date(endDate);
    }

    const logs = await WeatherLog.find(query)
      .sort({ timestamp: -1 })
      .limit(100);

    return {
      city,
      count: logs.length,
      data: logs
    };
  }

  getWindDirection(degrees) {
    const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
    const index = Math.round(degrees / 45) % 8;
    return directions[index];
  }

  getMockWeatherData(city) {
    return {
      location: {
        city: city,
        country: 'IN',
        coordinates: {
          latitude: 28.6139,
          longitude: 77.2090
        }
      },
      current: {
        temperature: 25.5,
        feelsLike: 26.2,
        humidity: 65,
        pressure: 1013,
        windSpeed: 3.5,
        windDirection: 'NE',
        cloudCover: 20,
        visibility: 10000,
        description: 'clear sky',
        icon: '01d'
      },
      lastUpdated: new Date(),
      note: 'This is mock data. Configure WEATHER_API_KEY for real weather data.'
    };
  }
}

module.exports = new WeatherService();
