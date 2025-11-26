import React, { useState } from 'react';
import { FiSearch, FiMapPin, FiWind, FiDroplet, FiEye, FiSunrise, FiSunset } from 'react-icons/fi';
import weatherService from '../../services/weatherService';
import Loader from '../../components/common/Loader';
import './Weather.css';

const Weather = () => {
  const [city, setCity] = useState('');
  const [weather, setWeather] = useState(null);
  const [forecast, setForecast] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!city.trim()) {
      setError('Please enter a city name');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const weatherResult = await weatherService.getCurrentWeather(city);
      if (weatherResult.success) {
        const parsedWeather = weatherService.parseWeatherData(weatherResult.data);
        setWeather(parsedWeather);

        const forecastResult = await weatherService.getForecast(city, 5);
        if (forecastResult.success) {
          setForecast(forecastResult.data.list.filter((_, index) => index % 8 === 0));
        }
      } else {
        setError(weatherResult.message);
        setWeather(null);
        setForecast([]);
      }
    } catch (err) {
      setError('Failed to fetch weather data');
      setWeather(null);
      setForecast([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="weather-page">
      <div className="container">
        <div className="weather-header">
          <h1>Weather Information</h1>
          <p>Get real-time weather updates for your location</p>
        </div>

        <form onSubmit={handleSearch} className="weather-search">
          <div className="search-input-group">
            <FiMapPin className="input-icon" />
            <input
              type="text"
              placeholder="Enter city name (e.g., Bangalore)"
              value={city}
              onChange={(e) => setCity(e.target.value)}
            />
            <button type="submit" className="btn btn-primary">
              <FiSearch /> Search
            </button>
          </div>
          {error && <p className="error-message">{error}</p>}
        </form>

        {loading && <Loader />}

        {weather && !loading && (
          <div className="weather-content">
            {/* Current Weather */}
            <div className="current-weather">
              <div className="weather-main">
                <img 
                  src={weatherService.getWeatherIcon(weather.icon)}
                  alt={weather.description}
                />
                <div className="temperature">
                  <h2>{weather.temperature}°C</h2>
                  <p>Feels like {weather.feelsLike}°C</p>
                </div>
              </div>
              <div className="weather-location">
                <h3>{weather.city}, {weather.country}</h3>
                <p className="weather-description">{weather.description}</p>
              </div>
            </div>

            {/* Weather Details Grid */}
            <div className="weather-details-grid">
              <div className="weather-detail-card">
                <FiWind className="detail-icon" />
                <div>
                  <span className="detail-label">Wind Speed</span>
                  <span className="detail-value">{weather.windSpeed} m/s</span>
                </div>
              </div>

              <div className="weather-detail-card">
                <FiDroplet className="detail-icon" />
                <div>
                  <span className="detail-label">Humidity</span>
                  <span className="detail-value">{weather.humidity}%</span>
                </div>
              </div>

              <div className="weather-detail-card">
                <FiEye className="detail-icon" />
                <div>
                  <span className="detail-label">Visibility</span>
                  <span className="detail-value">{weather.visibility} km</span>
                </div>
              </div>

              <div className="weather-detail-card">
                <FiDroplet className="detail-icon" />
                <div>
                  <span className="detail-label">Pressure</span>
                  <span className="detail-value">{weather.pressure} hPa</span>
                </div>
              </div>

              <div className="weather-detail-card">
                <FiSunrise className="detail-icon" />
                <div>
                  <span className="detail-label">Sunrise</span>
                  <span className="detail-value">
                    {weather.sunrise.toLocaleTimeString('en-US', { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </span>
                </div>
              </div>

              <div className="weather-detail-card">
                <FiSunset className="detail-icon" />
                <div>
                  <span className="detail-label">Sunset</span>
                  <span className="detail-value">
                    {weather.sunset.toLocaleTimeString('en-US', { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </span>
                </div>
              </div>
            </div>

            {/* 5-Day Forecast */}
            {forecast.length > 0 && (
              <div className="forecast-section">
                <h3>5-Day Forecast</h3>
                <div className="forecast-grid">
                  {forecast.map((day, index) => (
                    <div key={index} className="forecast-card">
                      <p className="forecast-date">
                        {new Date(day.dt * 1000).toLocaleDateString('en-US', { 
                          weekday: 'short',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </p>
                      <img 
                        src={weatherService.getWeatherIcon(day.weather[0].icon)}
                        alt={day.weather[0].description}
                      />
                      <p className="forecast-temp">{Math.round(day.main.temp)}°C</p>
                      <p className="forecast-desc">{day.weather[0].description}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Weather;
