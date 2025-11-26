import React, { useState, useEffect } from 'react';
import { FiCloud, FiWind, FiDroplet, FiSun } from 'react-icons/fi';
import './WeatherAlerts.css';

const WeatherAlerts = () => {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchWeatherAlerts();
  }, []);

  const fetchWeatherAlerts = async () => {
    setLoading(true);
    // Mock data for weather alerts
    setAlerts([
      {
        id: 1,
        type: 'Heavy Rainfall',
        icon: <FiCloud />,
        severity: 'high',
        title: 'Heavy Rainfall Alert',
        description: 'Heavy to very heavy rainfall expected in next 24-48 hours. Rainfall amount: 100-150mm.',
        date: '2025-10-21',
        time: '10:00 AM',
        validUntil: '2025-10-23',
        affectedAreas: ['Bangalore Rural', 'Mysore', 'Mandya'],
        recommendations: [
          'Avoid waterlogging in fields',
          'Ensure proper drainage systems',
          'Postpone irrigation activities',
          'Protect stored produce from moisture'
        ]
      },
      {
        id: 2,
        type: 'Strong Winds',
        icon: <FiWind />,
        severity: 'moderate',
        title: 'Strong Wind Warning',
        description: 'Wind speeds of 40-50 km/h expected. May cause damage to standing crops.',
        date: '2025-10-22',
        time: '02:00 PM',
        validUntil: '2025-10-22',
        affectedAreas: ['Hassan', 'Tumkur', 'Chitradurga'],
        recommendations: [
          'Secure loose equipment and materials',
          'Stake tall crops if necessary',
          'Avoid spraying pesticides',
          'Check greenhouse structures'
        ]
      },
      {
        id: 3,
        type: 'High Temperature',
        icon: <FiSun />,
        severity: 'moderate',
        title: 'Heat Wave Advisory',
        description: 'Temperature expected to reach 38-40°C. High heat stress for crops and livestock.',
        date: '2025-10-25',
        time: '11:00 AM',
        validUntil: '2025-10-27',
        affectedAreas: ['Kolar', 'Ramanagara', 'Chikkaballapur'],
        recommendations: [
          'Increase irrigation frequency',
          'Provide shade for livestock',
          'Avoid working during peak heat hours',
          'Monitor crops for heat stress'
        ]
      },
      {
        id: 4,
        type: 'High Humidity',
        icon: <FiDroplet />,
        severity: 'low',
        title: 'High Humidity Alert',
        description: 'Humidity levels above 85%. Increased risk of fungal diseases.',
        date: '2025-10-23',
        time: '08:00 AM',
        validUntil: '2025-10-24',
        affectedAreas: ['Shimoga', 'Chickmagalur', 'Hassan'],
        recommendations: [
          'Monitor crops for fungal infections',
          'Apply preventive fungicides if needed',
          'Ensure good air circulation',
          'Avoid overhead irrigation'
        ]
      }
    ]);
    setLoading(false);
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'high':
        return '#e74c3c';
      case 'moderate':
        return '#f39c12';
      case 'low':
        return '#3498db';
      default:
        return '#7f8c8d';
    }
  };

  const getSeverityBadge = (severity) => {
    switch (severity) {
      case 'high':
        return 'High Priority';
      case 'moderate':
        return 'Moderate';
      case 'low':
        return 'Low Priority';
      default:
        return severity;
    }
  };

  if (loading) {
    return <div className="weather-alerts-page">Loading alerts...</div>;
  }

  return (
    <div className="weather-alerts-page">
      <div className="alerts-header">
        <div>
          <h1>Weather Alerts</h1>
          <p>Stay informed about weather conditions that may affect your farming</p>
        </div>
        <div className="alert-summary">
          <span className="alert-count high">{alerts.filter(a => a.severity === 'high').length} High</span>
          <span className="alert-count moderate">{alerts.filter(a => a.severity === 'moderate').length} Moderate</span>
          <span className="alert-count low">{alerts.filter(a => a.severity === 'low').length} Low</span>
        </div>
      </div>

      <div className="alerts-list">
        {alerts.map(alert => (
          <div key={alert.id} className="alert-detail-card">
            <div className="alert-header-section">
              <div className="alert-type-badge" style={{ background: getSeverityColor(alert.severity) }}>
                {alert.icon}
                <span>{alert.type}</span>
              </div>
              <span className="alert-severity" style={{ color: getSeverityColor(alert.severity) }}>
                {getSeverityBadge(alert.severity)}
              </span>
            </div>

            <div className="alert-content-section">
              <h2>{alert.title}</h2>
              <p className="alert-description">{alert.description}</p>

              <div className="alert-meta">
                <div className="meta-item">
                  <strong>Issued:</strong> {new Date(alert.date).toLocaleDateString()} at {alert.time}
                </div>
                <div className="meta-item">
                  <strong>Valid Until:</strong> {new Date(alert.validUntil).toLocaleDateString()}
                </div>
              </div>

              <div className="affected-areas">
                <strong>Affected Areas:</strong>
                <div className="area-tags">
                  {alert.affectedAreas.map((area, index) => (
                    <span key={index} className="area-tag">{area}</span>
                  ))}
                </div>
              </div>

              <div className="alert-recommendations">
                <strong>Recommendations:</strong>
                <ul>
                  {alert.recommendations.map((rec, index) => (
                    <li key={index}>{rec}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default WeatherAlerts;
