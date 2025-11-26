import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiEye, FiPackage, FiTruck, FiCheckCircle, FiXCircle } from 'react-icons/fi';
import marketService from '../../services/marketService';
import Loader from '../../components/common/Loader';
import './OrderList.css';

const OrderList = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    const result = await marketService.getOrders();
    if (result.success) {
      setOrders(result.data);
    } else {
      // Mock data
      setOrders([
        {
          id: 'ORD-2025-001',
          date: '2025-10-15',
          items: 3,
          total: 5650,
          status: 'delivered',
          deliveryDate: '2025-10-18'
        },
        {
          id: 'ORD-2025-002',
          date: '2025-10-18',
          items: 2,
          total: 2050,
          status: 'shipped',
          deliveryDate: '2025-10-22'
        },
        {
          id: 'ORD-2025-003',
          date: '2025-10-20',
          items: 5,
          total: 12400,
          status: 'processing',
          deliveryDate: '2025-10-25'
        },
        {
          id: 'ORD-2025-004',
          date: '2025-10-19',
          items: 1,
          total: 850,
          status: 'pending',
          deliveryDate: '2025-10-24'
        },
        {
          id: 'ORD-2025-005',
          date: '2025-09-28',
          items: 2,
          total: 1650,
          status: 'cancelled',
          deliveryDate: null
        }
      ]);
    }
    setLoading(false);
  };

  const getStatusIcon = (status) => {
    switch (status.toLowerCase()) {
      case 'delivered':
        return <FiCheckCircle />;
      case 'shipped':
        return <FiTruck />;
      case 'processing':
        return <FiPackage />;
      case 'cancelled':
        return <FiXCircle />;
      default:
        return <FiPackage />;
    }
  };

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'delivered':
        return '#2ecc71';
      case 'shipped':
        return '#3498db';
      case 'processing':
        return '#f39c12';
      case 'pending':
        return '#95a5a6';
      case 'cancelled':
        return '#e74c3c';
      default:
        return '#7f8c8d';
    }
  };

  const filteredOrders = filter === 'all' 
    ? orders 
    : orders.filter(order => order.status.toLowerCase() === filter);

  if (loading) {
    return <Loader fullPage />;
  }

  return (
    <div className="order-list-page">
      <div className="page-header">
        <div>
          <h1>My Orders</h1>
          <p>Track and manage your orders</p>
        </div>
      </div>

      <div className="order-filters">
        <button 
          className={filter === 'all' ? 'active' : ''} 
          onClick={() => setFilter('all')}
        >
          All Orders
        </button>
        <button 
          className={filter === 'pending' ? 'active' : ''} 
          onClick={() => setFilter('pending')}
        >
          Pending
        </button>
        <button 
          className={filter === 'processing' ? 'active' : ''} 
          onClick={() => setFilter('processing')}
        >
          Processing
        </button>
        <button 
          className={filter === 'shipped' ? 'active' : ''} 
          onClick={() => setFilter('shipped')}
        >
          Shipped
        </button>
        <button 
          className={filter === 'delivered' ? 'active' : ''} 
          onClick={() => setFilter('delivered')}
        >
          Delivered
        </button>
        <button 
          className={filter === 'cancelled' ? 'active' : ''} 
          onClick={() => setFilter('cancelled')}
        >
          Cancelled
        </button>
      </div>

      {filteredOrders.length > 0 ? (
        <div className="orders-list">
          {filteredOrders.map(order => (
            <div key={order.id} className="order-card">
              <div className="order-header">
                <div className="order-id">
                  <strong>Order #{order.id}</strong>
                  <span className="order-date">
                    Placed on {new Date(order.date).toLocaleDateString()}
                  </span>
                </div>
                <div 
                  className="order-status"
                  style={{ 
                    background: getStatusColor(order.status),
                    color: 'white'
                  }}
                >
                  {getStatusIcon(order.status)}
                  <span>{order.status}</span>
                </div>
              </div>

              <div className="order-details">
                <div className="order-info">
                  <div className="info-item">
                    <span className="label">Items:</span>
                    <span className="value">{order.items}</span>
                  </div>
                  <div className="info-item">
                    <span className="label">Total Amount:</span>
                    <span className="value">₹{order.total.toLocaleString()}</span>
                  </div>
                  {order.deliveryDate && (
                    <div className="info-item">
                      <span className="label">
                        {order.status === 'delivered' ? 'Delivered on:' : 'Expected Delivery:'}
                      </span>
                      <span className="value">
                        {new Date(order.deliveryDate).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                </div>

                <div className="order-actions">
                  <Link to={`/orders/${order.id}`} className="btn btn-secondary">
                    <FiEye /> View Details
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <FiPackage className="empty-icon" />
          <p>No orders found</p>
          <Link to="/marketplace" className="btn btn-primary">
            Start Shopping
          </Link>
        </div>
      )}
    </div>
  );
};

export default OrderList;
