import React from 'react';
import { FiCloud, FiDroplet, FiWind } from 'react-icons/fi';
import './Weather.css';

const Weather = ({ data }) => {
  if (!data) {
    return (
      <div className="weather-widget">
        <p>Loading weather data...</p>
      </div>
    );
  }

  return (
    <div className="weather-widget">
      <div className="weather-main">
        <FiCloud className="weather-icon" />
        <div>
          <h3>{data.temperature}°C</h3>
          <p>{data.description}</p>
        </div>
      </div>
      <div className="weather-details">
        <div className="weather-item">
          <FiDroplet />
          <span>{data.humidity}%</span>
        </div>
        <div className="weather-item">
          <FiWind />
          <span>{data.windSpeed} m/s</span>
        </div>
      </div>
    </div>
  );
};

export default Weather;
