import { api } from './apiClient';

const paymentService = {
  // Create payment order
  createOrder: async (amount, currency = 'INR', receipt, notes) => {
    try {
      const response = await api.post('/payment/create-order', {
        amount,
        currency,
        receipt,
        notes,
      });
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to create payment order',
      };
    }
  },

  // Verify payment
  verifyPayment: async (paymentData) => {
    try {
      const response = await api.post('/payment/verify', paymentData);
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Payment verification failed',
      };
    }
  },

  // Get payment details
  getPayment: async (paymentId) => {
    try {
      const response = await api.get(`/payment/${paymentId}`);
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch payment details',
      };
    }
  },

  // Refund payment
  refundPayment: async (paymentId, amount, notes) => {
    try {
      const response = await api.post(`/payment/${paymentId}/refund`, {
        amount,
        notes,
      });
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Refund failed',
      };
    }
  },
};

export default paymentService;