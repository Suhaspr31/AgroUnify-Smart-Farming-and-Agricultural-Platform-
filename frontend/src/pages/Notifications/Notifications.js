import React, { useState, useEffect } from 'react';
import { FiBell, FiCheck, FiTrash2, FiSettings } from 'react-icons/fi';
import './Notifications.css';

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, unread, read

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('authToken');
      if (!token) {
        // Use fallback for non-authenticated users
        setNotifications([
          {
            _id: 1,
            title: 'Welcome to AgriUnify',
            message: 'Please log in to receive personalized weather notifications and updates.',
            severity: 'low',
            isRead: false,
            createdAt: new Date().toISOString(),
            type: 'General'
          }
        ]);
        setLoading(false);
        return;
      }

      const response = await fetch('http://localhost:5000/api/v1/weather/notifications', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setNotifications(data.data.notifications);
        } else {
          // Use fallback if API returns unsuccessful
          setNotifications([
            {
              _id: 1,
              title: 'Welcome to AgriUnify',
              message: 'Stay updated with weather alerts and farming tips.',
              severity: 'low',
              isRead: false,
              createdAt: new Date().toISOString(),
              type: 'General'
            },
            {
              _id: 2,
              title: 'Weather Monitoring Active',
              message: 'Your weather dashboard is now monitoring conditions.',
              severity: 'low',
              isRead: false,
              createdAt: new Date().toISOString(),
              type: 'General'
            }
          ]);
        }
      } else {
        // Use fallback on API error
        setNotifications([
          {
            _id: 1,
            title: 'Welcome to AgriUnify',
            message: 'Stay updated with weather alerts and farming tips.',
            severity: 'low',
            isRead: false,
            createdAt: new Date().toISOString(),
            type: 'General'
          },
          {
            _id: 2,
            title: 'Weather Monitoring Active',
            message: 'Your weather dashboard is now monitoring conditions.',
            severity: 'low',
            isRead: false,
            createdAt: new Date().toISOString(),
            type: 'General'
          }
        ]);
      }
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
      // Use fallback on network error
      setNotifications([
        {
          _id: 1,
          title: 'Welcome to AgriUnify',
          message: 'Stay updated with weather alerts and farming tips.',
          severity: 'low',
          isRead: false,
          createdAt: new Date().toISOString(),
          type: 'General'
        },
        {
          _id: 2,
          title: 'Weather Monitoring Active',
          message: 'Your weather dashboard is now monitoring conditions.',
          severity: 'low',
          isRead: false,
          createdAt: new Date().toISOString(),
          type: 'General'
        }
      ]);
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
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const token = localStorage.getItem('authToken');
      if (token) {
        // For authenticated users, make API call
        const response = await fetch('http://localhost:5000/api/v1/weather/notifications/read-all', {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (!response.ok) {
          throw new Error('Failed to mark all as read');
        }
      }
      // Update local state
      setNotifications(prev =>
        prev.map(notif => ({ ...notif, isRead: true }))
      );
    } catch (error) {
      console.error('Failed to mark all as read:', error);
    }
  };

  const deleteNotification = async (notificationId) => {
    try {
      const token = localStorage.getItem('authToken');
      if (token) {
        // For authenticated users, make API call
        const response = await fetch(`http://localhost:5000/api/v1/weather/notifications/${notificationId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (!response.ok) {
          throw new Error('Failed to delete notification');
        }
      }
      // Update local state
      setNotifications(prev => prev.filter(notif => notif._id !== notificationId));
    } catch (error) {
      console.error('Failed to delete notification:', error);
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

  const filteredNotifications = notifications.filter(notification => {
    if (filter === 'unread') return !notification.isRead;
    if (filter === 'read') return notification.isRead;
    return true;
  });

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <div className="notifications-page">
      <div className="notifications-header">
        <div className="header-content">
          <h1><FiBell /> Notifications</h1>
          <p>Stay updated with important alerts and updates</p>
        </div>
        <div className="header-actions">
          {unreadCount > 0 && (
            <button className="mark-all-read-btn" onClick={markAllAsRead}>
              <FiCheck /> Mark All as Read
            </button>
          )}
          <button className="settings-btn">
            <FiSettings />
          </button>
        </div>
      </div>

      <div className="notifications-filters">
        <button
          className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
          onClick={() => setFilter('all')}
        >
          All ({notifications.length})
        </button>
        <button
          className={`filter-btn ${filter === 'unread' ? 'active' : ''}`}
          onClick={() => setFilter('unread')}
        >
          Unread ({unreadCount})
        </button>
        <button
          className={`filter-btn ${filter === 'read' ? 'active' : ''}`}
          onClick={() => setFilter('read')}
        >
          Read ({notifications.length - unreadCount})
        </button>
      </div>

      <div className="notifications-content">
        {loading ? (
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Loading notifications...</p>
          </div>
        ) : filteredNotifications.length === 0 ? (
          <div className="empty-state">
            <FiBell size={48} />
            <h3>No notifications</h3>
            <p>
              {filter === 'unread'
                ? "You're all caught up! No unread notifications."
                : filter === 'read'
                ? "No read notifications yet."
                : "You don't have any notifications yet."
              }
            </p>
          </div>
        ) : (
          <div className="notifications-list">
            {filteredNotifications.map(notification => (
              <div
                key={notification._id}
                className={`notification-card ${!notification.isRead ? 'unread' : ''}`}
              >
                <div className="notification-indicator">
                  <div
                    className="severity-dot"
                    style={{ backgroundColor: getSeverityColor(notification.severity) }}
                  />
                </div>

                <div className="notification-content">
                  <div className="notification-header">
                    <h4 className="notification-title">{notification.title}</h4>
                    <div className="notification-actions">
                      {!notification.isRead && (
                        <button
                          className="action-btn mark-read"
                          onClick={() => markAsRead(notification._id)}
                          title="Mark as read"
                        >
                          <FiCheck />
                        </button>
                      )}
                      <button
                        className="action-btn delete"
                        onClick={() => deleteNotification(notification._id)}
                        title="Delete notification"
                      >
                        <FiTrash2 />
                      </button>
                    </div>
                  </div>

                  <p className="notification-message">{notification.message}</p>

                  <div className="notification-meta">
                    <span className="notification-time">
                      {new Date(notification.createdAt).toLocaleString()}
                    </span>
                    <span className="notification-type">
                      {notification.type || 'General'}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Notifications;