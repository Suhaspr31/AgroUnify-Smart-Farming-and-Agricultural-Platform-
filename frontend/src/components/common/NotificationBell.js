import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiBell, FiX, FiChevronRight } from 'react-icons/fi';
import './NotificationBell.css';

const NotificationBell = () => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Only fetch if user is authenticated (has token)
    const token = localStorage.getItem('authToken');
    if (token) {
      fetchNotifications();
    } else {
      // Use fallback for non-authenticated users
      setNotifications([
        {
          _id: 1,
          title: 'Welcome to AgriUnify',
          message: 'Please log in to receive personalized weather notifications.',
          severity: 'low',
          isRead: false,
          createdAt: new Date().toISOString()
        }
      ]);
      setUnreadCount(1);
    }
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:5000/api/v1/weather/notifications', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setNotifications(data.data.notifications);
          setUnreadCount(data.data.unreadCount);
        }
      } else {
        console.warn('Notifications API returned error, using fallback data');
        // Use fallback notifications
        setNotifications([
          {
            _id: 1,
            title: 'Welcome to AgriUnify',
            message: 'Stay updated with weather alerts and farming tips.',
            severity: 'low',
            isRead: false,
            createdAt: new Date().toISOString()
          },
          {
            _id: 2,
            title: 'Weather Monitoring Active',
            message: 'Your weather dashboard is now monitoring conditions.',
            severity: 'low',
            isRead: false,
            createdAt: new Date().toISOString()
          }
        ]);
        setUnreadCount(2);
      }
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
      // Use fallback notifications on error
      setNotifications([
        {
          _id: 1,
          title: 'Welcome to AgriUnify',
          message: 'Stay updated with weather alerts and farming tips.',
          severity: 'low',
          isRead: false,
          createdAt: new Date().toISOString()
        },
        {
          _id: 2,
          title: 'Weather Monitoring Active',
          message: 'Your weather dashboard is now monitoring conditions.',
          severity: 'low',
          isRead: false,
          createdAt: new Date().toISOString()
        }
      ]);
      setUnreadCount(2);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      const token = localStorage.getItem('authToken');
      if (token) {
        // For authenticated users, make API call
        const response = await fetch(`http://localhost:5000/api/v1/weather/notifications/${notificationId}/read`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (!response.ok) {
          throw new Error('Failed to mark as read');
        }
      }
      // Update local state
      setNotifications(prev =>
        prev.map(notif =>
          notif._id === notificationId ? { ...notif, isRead: true } : notif
        )
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'critical': return '#dc3545';
      case 'high': return '#fd7e14';
      case 'moderate': return '#ffc107';
      case 'low': return '#28a745';
      default: return '#6c757d';
    }
  };

  return (
    <div className="notification-bell">
      <button
        className={`bell-button ${unreadCount > 0 ? 'has-notifications' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
        title="Notifications"
      >
        <FiBell />
        {unreadCount > 0 && (
          <span className="notification-badge">{unreadCount}</span>
        )}
      </button>

      {isOpen && (
        <div className="notification-dropdown">
          <div className="notification-header">
            <h3>Notifications</h3>
            <div className="header-actions">
              <Link
                to="/notifications"
                className="view-all-link"
                onClick={() => setIsOpen(false)}
              >
                View All <FiChevronRight />
              </Link>
              <button
                className="close-button"
                onClick={() => setIsOpen(false)}
              >
                <FiX />
              </button>
            </div>
          </div>

          <div className="notification-list">
            {loading ? (
              <div className="notification-loading">Loading...</div>
            ) : notifications.length === 0 ? (
              <div className="notification-empty">No notifications</div>
            ) : (
              notifications.map(notification => (
                <div
                  key={notification._id}
                  className={`notification-item ${!notification.isRead ? 'unread' : ''}`}
                  onClick={() => markAsRead(notification._id)}
                >
                  <div
                    className="notification-indicator"
                    style={{ backgroundColor: getSeverityColor(notification.severity) }}
                  />
                  <div className="notification-content">
                    <div className="notification-title">{notification.title}</div>
                    <div className="notification-message">{notification.message}</div>
                    <div className="notification-time">
                      {new Date(notification.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;