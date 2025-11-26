import { api } from './apiClient';

const NOTIFICATION_ENDPOINTS = {
  LIST: '/notifications',
  MARK_READ: '/notifications/:id/read',
  MARK_ALL_READ: '/notifications/read-all',
  DELETE: '/notifications/:id',
  SETTINGS: '/notifications/settings'
};

export const notificationService = {
  getNotifications: async (params = {}) => {
    try {
      const response = await api.get(NOTIFICATION_ENDPOINTS.LIST, { params });
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch notifications'
      };
    }
  },

  markAsRead: async (id) => {
    try {
      const url = NOTIFICATION_ENDPOINTS.MARK_READ.replace(':id', id);
      await api.patch(url);
      return { success: true };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to mark as read'
      };
    }
  },

  markAllAsRead: async () => {
    try {
      await api.patch(NOTIFICATION_ENDPOINTS.MARK_ALL_READ);
      return { success: true };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to mark all as read'
      };
    }
  },

  deleteNotification: async (id) => {
    try {
      const url = NOTIFICATION_ENDPOINTS.DELETE.replace(':id', id);
      await api.delete(url);
      return { success: true };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to delete notification'
      };
    }
  },

  getSettings: async () => {
    try {
      const response = await api.get(NOTIFICATION_ENDPOINTS.SETTINGS);
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch settings'
      };
    }
  },

  updateSettings: async (settings) => {
    try {
      const response = await api.put(NOTIFICATION_ENDPOINTS.SETTINGS, settings);
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to update settings'
      };
    }
  },

  // Browser notifications
  requestPermission: async () => {
    if (!('Notification' in window)) {
      return { success: false, message: 'Notifications not supported' };
    }

    const permission = await Notification.requestPermission();
    return { success: permission === 'granted', permission };
  },

  showNotification: (title, options = {}) => {
    if (Notification.permission === 'granted') {
      new Notification(title, options);
      return { success: true };
    }
    return { success: false, message: 'Notification permission not granted' };
  }
};

export default notificationService;
