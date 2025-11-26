import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useWeather } from '../../hooks/useWeather';
import { FiCloud, FiDroplet, FiWind, FiThermometer, FiAlertTriangle } from 'react-icons/fi';
import WeatherChart from '../../components/dashboard/WeatherChart';
import Loader from '../../components/common/Loader';
import './WeatherDashboard.css';

const WeatherDashboard = () => {
  const { user } = useAuth();
  const { weather, loading, error } = useWeather(user?.location || 'Bangalore');
  const [alerts, setAlerts] = useState([]);
  const [forecast, setForecast] = useState([]);

  useEffect(() => {
    // Mock alerts
    setAlerts([
      {
        id: 1,
        type: 'warning',
        message: 'Heavy rainfall expected in the next 24 hours',
        severity: 'moderate'
      },
      {
        id: 2,
        type: 'info',
        message: 'Temperature will drop by 5°C tomorrow',
        severity: 'low'
      }
    ]);

    // Mock forecast data
    setForecast([
      { day: 'Mon', temp: 28, rain: 20 },
      { day: 'Tue', temp: 26, rain: 60 },
      { day: 'Wed', temp: 25, rain: 80 },
      { day: 'Thu', temp: 27, rain: 40 },
      { day: 'Fri', temp: 29, rain: 10 },
      { day: 'Sat', temp: 30, rain: 5 },
      { day: 'Sun', temp: 31, rain: 0 }
    ]);
  }, []);

  if (loading) {
    return <Loader fullPage />;
  }

  if (error) {
    return (
      <div className="weather-dashboard">
        <div className="error-state">
          <p>Failed to load weather data: {error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="weather-dashboard">
      <div className="dashboard-header">
        <h1>Weather Dashboard</h1>
        <p>Monitor weather conditions for your farming activities</p>
      </div>

      {/* Current Weather Overview */}
      <div className="current-weather-card">
        <div className="weather-primary">
          <div className="weather-icon-large">
            {weather ? (
              <img 
                src={`https://openweathermap.org/img/wn/${weather.icon}@4x.png`}
                alt={weather.description}
              />
            ) : (
              <FiCloud />
            )}
          </div>
          <div className="weather-temp-info">
            <h2>{weather?.temperature || '--'}°C</h2>
            <p className="weather-location">{weather?.city || user?.location || 'Location'}</p>
            <p className="weather-condition">{weather?.description || 'Loading...'}</p>
          </div>
        </div>

        <div className="weather-stats-grid">
          <div className="weather-stat">
            <FiThermometer className="stat-icon" />
            <div>
              <span className="stat-label">Feels Like</span>
              <span className="stat-value">{weather?.feelsLike || '--'}°C</span>
            </div>
          </div>

          <div className="weather-stat">
            <FiDroplet className="stat-icon" />
            <div>
              <span className="stat-label">Humidity</span>
              <span className="stat-value">{weather?.humidity || '--'}%</span>
            </div>
          </div>

          <div className="weather-stat">
            <FiWind className="stat-icon" />
            <div>
              <span className="stat-label">Wind Speed</span>
              <span className="stat-value">{weather?.windSpeed || '--'} m/s</span>
            </div>
          </div>

          <div className="weather-stat">
            <FiCloud className="stat-icon" />
            <div>
              <span className="stat-label">Cloudiness</span>
              <span className="stat-value">{weather?.cloudiness || '--'}%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Weather Alerts */}
      {alerts.length > 0 && (
        <div className="weather-alerts-section">
          <h2>Weather Alerts</h2>
          <div className="alerts-list">
            {alerts.map(alert => (
              <div key={alert.id} className={`alert-card ${alert.severity}`}>
                <FiAlertTriangle className="alert-icon" />
                <div className="alert-content">
                  <p>{alert.message}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 7-Day Forecast Chart */}
      <div className="forecast-chart-section">
        <h2>7-Day Forecast</h2>
        <WeatherChart data={forecast} />
      </div>

      {/* Farming Recommendations */}
      <div className="recommendations-section">
        <h2>Farming Recommendations</h2>
        <div className="recommendations-grid">
          <div className="recommendation-card">
            <h3>Irrigation</h3>
            <p>Expected rainfall in next 48 hours. Consider postponing irrigation.</p>
          </div>
          <div className="recommendation-card">
            <h3>Pest Control</h3>
            <p>High humidity levels. Monitor for fungal diseases and pests.</p>
          </div>
          <div className="recommendation-card">
            <h3>Harvesting</h3>
            <p>Clear weather expected on Friday. Good day for harvesting activities.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WeatherDashboard;
