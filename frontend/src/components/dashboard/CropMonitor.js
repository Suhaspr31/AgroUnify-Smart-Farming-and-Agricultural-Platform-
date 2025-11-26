import React from 'react';
import { FiDroplet, FiSun, FiThermometer } from 'react-icons/fi';
import './CropMonitor.css';

const CropMonitor = ({ crops }) => {
  const getHealthColor = (health) => {
    switch (health.toLowerCase()) {
      case 'excellent':
        return '#2ecc71';
      case 'good':
        return '#3498db';
      case 'fair':
        return '#f39c12';
      case 'poor':
        return '#e74c3c';
      default:
        return '#7f8c8d';
    }
  };

  return (
    <div className="crop-monitor">
      <h3>Crop Monitoring</h3>
      <div className="crops-grid">
        {crops && crops.map(crop => (
          <div key={crop.id} className="crop-monitor-card">
            <div className="crop-header">
              <h4>{crop.name}</h4>
              <span 
                className="health-indicator"
                style={{ background: getHealthColor(crop.health) }}
              >
                {crop.health}
              </span>
            </div>
            
            <div className="crop-metrics">
              <div className="metric">
                <FiDroplet />
                <span>Moisture: {crop.moisture}%</span>
              </div>
              <div className="metric">
                <FiThermometer />
                <span>Temp: {crop.temperature}°C</span>
              </div>
              <div className="metric">
                <FiSun />
                <span>Sunlight: {crop.sunlight}hrs</span>
              </div>
            </div>
            
            <div className="crop-stage">
              <span>Growth Stage:</span>
              <strong>{crop.stage}</strong>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CropMonitor;
