import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { FiArrowLeft, FiTruck, FiMapPin, FiPhone, FiMail } from 'react-icons/fi';
import marketService from '../../services/marketService';
import Loader from '../../components/common/Loader';
import './OrderDetail.css';

const OrderDetail = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchOrderDetails = useCallback(async () => {
    setLoading(true);
    const result = await marketService.getOrderById(id);
    if (result.success) {
      setOrder(result.data);
    } else {
      // Mock data
      setOrder({
        id: id,
        date: '2025-10-15',
        status: 'delivered',
        deliveryDate: '2025-10-18',
        items: [
          {
            id: 1,
            name: 'Premium Rice Seeds',
            image: '/assets/marketplace/rice-seeds.jpg',
            price: 850,
            quantity: 5,
            unit: 'kg'
          },
          {
            id: 2,
            name: 'Organic Fertilizer NPK',
            image: '/assets/marketplace/fertilizer.jpg',
            price: 1200,
            quantity: 3,
            unit: 'bag'
          }
        ],
        subtotal: 7850,
        shipping: 100,
        tax: 700,
        total: 8650,
        shippingAddress: {
          name: 'Rajesh Kumar',
          phone: '+91 9876543210',
          email: 'rajesh@example.com',
          address: 'Farm No. 45, Green Valley',
          city: 'Bangalore Rural',
          state: 'Karnataka',
          pincode: '562106'
        },
        trackingId: 'TRK123456789',
        timeline: [
          {
            status: 'Order Placed',
            date: '2025-10-15 10:30 AM',
            completed: true
          },
          {
            status: 'Order Confirmed',
            date: '2025-10-15 11:00 AM',
            completed: true
          },
          {
            status: 'Shipped',
            date: '2025-10-16 09:15 AM',
            completed: true
          },
          {
            status: 'Out for Delivery',
            date: '2025-10-18 08:00 AM',
            completed: true
          },
          {
            status: 'Delivered',
            date: '2025-10-18 02:30 PM',
            completed: true
          }
        ]
      });
    }
    setLoading(false);
  }, [id]);

  useEffect(() => {
    fetchOrderDetails();
  }, [fetchOrderDetails]);

  if (loading) {
    return <Loader fullPage />;
  }

  if (!order) {
    return (
      <div className="container">
        <p>Order not found</p>
      </div>
    );
  }

  return (
    <div className="order-detail-page">
      <div className="container">
        <Link to="/orders" className="back-link">
          <FiArrowLeft /> Back to Orders
        </Link>

        <div className="order-detail-header">
          <div>
            <h1>Order #{order.id}</h1>
            <p>Placed on {new Date(order.date).toLocaleDateString()}</p>
          </div>
          <div className={`order-status-badge ${order.status}`}>
            {order.status}
          </div>
        </div>

        <div className="order-content-grid">
          {/* Order Items */}
          <div className="order-section">
            <h2>Order Items</h2>
            <div className="order-items-list">
              {order.items.map(item => (
                <div key={item.id} className="order-item">
                  <img src={item.image} alt={item.name} />
                  <div className="item-details">
                    <h3>{item.name}</h3>
                    <p className="item-quantity">
                      Quantity: {item.quantity} {item.unit}
                    </p>
                  </div>
                  <div className="item-price">
                    ₹{(item.price * item.quantity).toLocaleString()}
                  </div>
                </div>
              ))}
            </div>

            <div className="order-summary">
              <div className="summary-row">
                <span>Subtotal:</span>
                <span>₹{order.subtotal.toLocaleString()}</span>
              </div>
              <div className="summary-row">
                <span>Shipping:</span>
                <span>₹{order.shipping.toLocaleString()}</span>
              </div>
              <div className="summary-row">
                <span>Tax:</span>
                <span>₹{order.tax.toLocaleString()}</span>
              </div>
              <div className="summary-row total">
                <span>Total:</span>
                <span>₹{order.total.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Shipping Address */}
          <div className="order-section">
            <h2>Shipping Address</h2>
            <div className="address-card">
              <div className="address-item">
                <FiMapPin />
                <div>
                  <strong>{order.shippingAddress.name}</strong>
                  <p>{order.shippingAddress.address}</p>
                  <p>{order.shippingAddress.city}, {order.shippingAddress.state}</p>
                  <p>PIN: {order.shippingAddress.pincode}</p>
                </div>
              </div>
              <div className="address-item">
                <FiPhone />
                <div>
                  <p>{order.shippingAddress.phone}</p>
                </div>
              </div>
              <div className="address-item">
                <FiMail />
                <div>
                  <p>{order.shippingAddress.email}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Order Timeline */}
          <div className="order-section full-width">
            <h2>Order Timeline</h2>
            {order.trackingId && (
              <p className="tracking-id">
                <FiTruck /> Tracking ID: <strong>{order.trackingId}</strong>
              </p>
            )}
            <div className="timeline">
              {order.timeline.map((event, index) => (
                <div 
                  key={index} 
                  className={`timeline-item ${event.completed ? 'completed' : ''}`}
                >
                  <div className="timeline-marker">
                    {event.completed ? '✓' : '○'}
                  </div>
                  <div className="timeline-content">
                    <h4>{event.status}</h4>
                    <p>{event.date}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetail;
