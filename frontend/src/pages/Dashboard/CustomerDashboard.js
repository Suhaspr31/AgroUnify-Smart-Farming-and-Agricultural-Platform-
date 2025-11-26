import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiShoppingBag, FiTrendingUp, FiCloud, FiPackage } from 'react-icons/fi';
import './Dashboard.css';

const CustomerDashboard = () => {
  const [stats, setStats] = useState({
    totalOrders: 0,
    pendingOrders: 0,
    deliveredOrders: 0,
    totalSpent: 0
  });

  useEffect(() => {
    // Simulated API call for stats
    setStats({
      totalOrders: 24,
      pendingOrders: 2,
      deliveredOrders: 21,
      totalSpent: 58200
    });
  }, []);

  const quickActions = [
    {
      title: 'Browse Marketplace',
      description: 'Find quality products and crops',
      icon: <FiShoppingBag />,
      link: '/marketplace',
      color: '#2ecc71'
    },
    {
      title: 'Track Orders',
      description: 'View and track your orders',
      icon: <FiPackage />,
      link: '/orders',
      color: '#f39c12'
    },
    {
      title: 'Market Prices',
      description: 'Compare price trends of crops',
      icon: <FiTrendingUp />,
      link: '/prices',
      color: '#3498db'
    },
    {
      title: 'Weather Updates',
      description: 'Get weather info for delivery',
      icon: <FiCloud />,
      link: '/weather',
      color: '#9b59b6'
    }
  ];

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <div>
          <h1>Welcome, Customer!</h1>
          <p>Your buying dashboard overview.</p>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#2ecc71' }}>
            <FiShoppingBag />
          </div>
          <div className="stat-content">
            <h3>{stats.totalOrders}</h3>
            <p>Total Orders</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#f39c12' }}>
            <FiPackage />
          </div>
          <div className="stat-content">
            <h3>{stats.pendingOrders}</h3>
            <p>Pending Orders</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#3498db' }}>
            <FiPackage />
          </div>
          <div className="stat-content">
            <h3>{stats.deliveredOrders}</h3>
            <p>Delivered Orders</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#e74c3c' }}>
            <FiTrendingUp />
          </div>
          <div className="stat-content">
            <h3>₹{stats.totalSpent.toLocaleString()}</h3>
            <p>Total Spent</p>
          </div>
        </div>
      </div>

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
    </div>
  );
};

export default CustomerDashboard;
