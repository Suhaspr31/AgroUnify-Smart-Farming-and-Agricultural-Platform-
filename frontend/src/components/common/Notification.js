import React, { useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { FiCheckCircle, FiAlertCircle, FiInfo, FiX } from 'react-icons/fi';
import './Notification.css';

const Notification = () => {
  const { notification, hideNotification } = useApp();

  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => {
        hideNotification();
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [notification, hideNotification]);

  if (!notification) return null;

  const getIcon = () => {
    switch (notification.type) {
      case 'success':
        return <FiCheckCircle />;
      case 'error':
        return <FiAlertCircle />;
      default:
        return <FiInfo />;
    }
  };

  return (
    <div className={`notification notification-${notification.type}`}>
      <div className="notification-icon">{getIcon()}</div>
      <div className="notification-message">{notification.message}</div>
      <button className="notification-close" onClick={hideNotification}>
        <FiX />
      </button>
    </div>
  );
};

export default Notification;
