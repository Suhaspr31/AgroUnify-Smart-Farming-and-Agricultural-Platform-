import { api } from './apiClient';

const smsService = {
  // Send single SMS
  sendSMS: async (to, message, from) => {
    try {
      const response = await api.post('/sms/send', {
        to,
        message,
        from,
      });
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to send SMS',
      };
    }
  },

  // Send bulk SMS
  sendBulkSMS: async (recipients, message, from) => {
    try {
      const response = await api.post('/sms/send-bulk', {
        recipients,
        message,
        from,
      });
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to send bulk SMS',
      };
    }
  },

  // Send weather alert SMS
  sendWeatherAlert: async (phoneNumber, alertType, location, message) => {
    try {
      const response = await api.post('/sms/weather-alert', {
        phoneNumber,
        alertType,
        location,
        message,
      });
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to send weather alert',
      };
    }
  },

  // Send price alert SMS
  sendPriceAlert: async (phoneNumber, commodity, price, change, location) => {
    try {
      const response = await api.post('/sms/price-alert', {
        phoneNumber,
        commodity,
        price,
        change,
        location,
      });
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to send price alert',
      };
    }
  },
};

export default smsService;