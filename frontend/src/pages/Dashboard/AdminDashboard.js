import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiUsers, FiShoppingBag, FiTrendingUp, FiPackage, FiDatabase } from 'react-icons/fi';
import './Dashboard.css';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    farmers: 0,
    customers: 0,
    totalOrders: 0,
    totalProducts: 0,
    totalRevenue: 0
  });

  useEffect(() => {
    // Simulate API call for admin stats
    setStats({
      farmers: 3254,
      customers: 4187,
      totalOrders: 8532,
      totalProducts: 596,
      totalRevenue: 148200000
    });
  }, []);

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <div>
          <h1>Admin Dashboard</h1>
          <p>Platform analytics and management stats</p>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#2ecc71' }}>
            <FiUsers />
          </div>
          <div className="stat-content">
            <h3>{stats.farmers}</h3>
            <p>Farmers Registered</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#3498db' }}>
            <FiUsers />
          </div>
          <div className="stat-content">
            <h3>{stats.customers}</h3>
            <p>Customers Registered</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#9b59b6' }}>
            <FiPackage />
          </div>
          <div className="stat-content">
            <h3>{stats.totalOrders}</h3>
            <p>Total Orders</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#f39c12' }}>
            <FiShoppingBag />
          </div>
          <div className="stat-content">
            <h3>{stats.totalProducts}</h3>
            <p>Total Products</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#e74c3c' }}>
            <FiTrendingUp />
          </div>
          <div className="stat-content">
            <h3>₹{stats.totalRevenue.toLocaleString()}</h3>
            <p>Total Revenue</p>
          </div>
        </div>
      </div>

      <div className="dashboard-section">
        <h2>Platform Management</h2>
        <div className="quick-actions">
          <Link to="/dashboard/users" className="action-card">
            <div className="action-icon" style={{ background: '#2ecc71' }}>
              <FiUsers />
            </div>
            <div className="action-content">
              <h3>User Management</h3>
              <p>View, edit, or block users</p>
            </div>
          </Link>
          <Link to="/dashboard/products" className="action-card">
            <div className="action-icon" style={{ background: '#f39c12' }}>
              <FiShoppingBag />
            </div>
            <div className="action-content">
              <h3>Products</h3>
              <p>Manage product catalog</p>
            </div>
          </Link>
          <Link to="/dashboard/orders" className="action-card">
            <div className="action-icon" style={{ background: '#9b59b6' }}>
              <FiPackage />
            </div>
            <div className="action-content">
              <h3>Orders</h3>
              <p>Track all platform orders</p>
            </div>
          </Link>
          <Link to="/dashboard/data" className="action-card">
            <div className="action-icon" style={{ background: '#34495e' }}>
              <FiDatabase />
            </div>
            <div className="action-content">
              <h3>Site Data</h3>
              <p>Analytics, reports, and backups</p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
