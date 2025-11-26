import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useWeather } from '../../hooks/useWeather';
import { FiPlus, FiTrendingUp, FiCloud, FiDollarSign, FiPackage } from 'react-icons/fi';
import YieldPrediction from '../../components/dashboard/YieldPrediction';
import './Dashboard.css';

const FarmerDashboard = () => {
  const { user } = useAuth();
  const { weather, loading: weatherLoading } = useWeather(user?.location);
  const [stats, setStats] = useState({
    totalFarms: 0,
    activeCrops: 0,
    monthlyRevenue: 0,
    pendingOrders: 0
  });

  useEffect(() => {
    // Fetch farmer statistics
    fetchStats();
  }, []);

  const fetchStats = async () => {
    // Simulated API call
    setStats({
      totalFarms: 3,
      activeCrops: 8,
      monthlyRevenue: 45000,
      pendingOrders: 5
    });
  };

  const quickActions = [
    {
      title: 'Add New Farm',
      description: 'Register a new farm location',
      icon: <FiPlus />,
      link: '/farms/add',
      color: '#2ecc71'
    },
    {
      title: 'Monitor Crops',
      description: 'Check crop health and growth',
      icon: <FiPackage />,
      link: '/my-crops',
      color: '#3498db'
    },
    {
      title: 'Market Prices',
      description: 'View current market rates',
      icon: <FiTrendingUp />,
      link: '/prices',
      color: '#f39c12'
    },
    {
      title: 'Weather Forecast',
      description: 'Check weather conditions',
      icon: <FiCloud />,
      link: '/weather/dashboard',
      color: '#9b59b6'
    }
  ];

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <div>
          <h1>Welcome back, {user?.name}!</h1>
          <p>Here's what's happening with your farms today.</p>
        </div>
        <div className="dashboard-actions">
          <Link to="/farms/add" className="btn btn-primary">
            <FiPlus /> Add Farm
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#2ecc71' }}>
            <FiPackage />
          </div>
          <div className="stat-content">
            <h3>{stats.totalFarms}</h3>
            <p>Total Farms</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#3498db' }}>
            <FiTrendingUp />
          </div>
          <div className="stat-content">
            <h3>{stats.activeCrops}</h3>
            <p>Active Crops</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#f39c12' }}>
            <FiDollarSign />
          </div>
          <div className="stat-content">
            <h3>₹{stats.monthlyRevenue.toLocaleString()}</h3>
            <p>Monthly Revenue</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#e74c3c' }}>
            <FiPackage />
          </div>
          <div className="stat-content">
            <h3>{stats.pendingOrders}</h3>
            <p>Pending Orders</p>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="dashboard-section">
        <h2>Quick Actions</h2>
        <div className="quick-actions">
          {quickActions.map((action, index) => (
            <Link key={index} to={action.link} className="action-card">
              <div className="action-icon" style={{ background: action.color }}>
                {action.icon}
              </div>
              <div className="action-content">
                <h3>{action.title}</h3>
                <p>{action.description}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Weather and Analytics */}
      <div className="dashboard-row">
        <div className="dashboard-col">
          <div className="card">
            <div className="card-header">
              <h3>Weather Overview</h3>
              <Link to="/weather/dashboard">View Details</Link>
            </div>
            <div className="card-content">
              {weatherLoading ? (
                <p>Loading weather data...</p>
              ) : weather ? (
                <div className="weather-summary">
                  <div className="weather-main">
                    <img 
                      src={`https://openweathermap.org/img/wn/${weather.icon}@2x.png`}
                      alt={weather.description}
                    />
                    <div>
                      <h2>{weather.temperature}°C</h2>
                      <p>{weather.description}</p>
                    </div>
                  </div>
                  <div className="weather-details">
                    <div className="weather-item">
                      <span>Humidity</span>
                      <span>{weather.humidity}%</span>
                    </div>
                    <div className="weather-item">
                      <span>Wind Speed</span>
                      <span>{weather.windSpeed} m/s</span>
                    </div>
                  </div>
                </div>
              ) : (
                <p>Weather data unavailable</p>
              )}
            </div>
          </div>
        </div>

        <div className="dashboard-col">
          <YieldPrediction />
        </div>
      </div>

      {/* Recent Activity */}
      <div className="dashboard-section">
        <div className="card">
          <div className="card-header">
            <h3>Recent Activity</h3>
            <Link to="/activity">View All</Link>
          </div>
          <div className="card-content">
            <div className="activity-list">
              <div className="activity-item">
                <div className="activity-icon">
                  <FiPackage />
                </div>
                <div className="activity-content">
                  <p><strong>Crop Update:</strong> Wheat field irrigation completed</p>
                  <span className="activity-time">2 hours ago</span>
                </div>
              </div>
              <div className="activity-item">
                <div className="activity-icon">
                  <FiTrendingUp />
                </div>
                <div className="activity-content">
                  <p><strong>Market Alert:</strong> Rice prices increased by 5%</p>
                  <span className="activity-time">5 hours ago</span>
                </div>
              </div>
              <div className="activity-item">
                <div className="activity-icon">
                  <FiCloud />
                </div>
                <div className="activity-content">
                  <p><strong>Weather Alert:</strong> Rain expected tomorrow</p>
                  <span className="activity-time">1 day ago</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FarmerDashboard;
