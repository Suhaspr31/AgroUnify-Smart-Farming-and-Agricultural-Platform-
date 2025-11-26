import { api } from './apiClient';

const MARKET_ENDPOINTS = {
  PRODUCTS: '/market/products',
  PRODUCT_DETAIL: '/market/products/:id',
  PRICES: '/market/prices',
  TRENDS: '/market/trends',
  ORDERS: '/market/orders',
  ORDER_DETAIL: '/market/orders/:id',
  CART: '/market/cart',
  CHECKOUT: '/market/checkout'
};

export const marketService = {
  getProducts: async (params = {}) => {
    try {
      const response = await api.get(MARKET_ENDPOINTS.PRODUCTS, { params });
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch products'
      };
    }
  },

  getProductById: async (id) => {
    try {
      const url = MARKET_ENDPOINTS.PRODUCT_DETAIL.replace(':id', id);
      const response = await api.get(url);
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch product details'
      };
    }
  },

  getMarketPrices: async (params = {}) => {
    try {
      const response = await api.get(MARKET_ENDPOINTS.PRICES, { params });
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch market prices'
      };
    }
  },

  getMarketTrends: async (cropId, period = '30d') => {
    try {
      const response = await api.get(MARKET_ENDPOINTS.TRENDS, {
        params: { cropId, period }
      });
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch market trends'
      };
    }
  },

  createOrder: async (orderData) => {
    try {
      const response = await api.post(MARKET_ENDPOINTS.ORDERS, orderData);
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to create order'
      };
    }
  },

  getOrders: async (params = {}) => {
    try {
      const response = await api.get(MARKET_ENDPOINTS.ORDERS, { params });
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch orders'
      };
    }
  },

  getOrderById: async (id) => {
    try {
      const url = MARKET_ENDPOINTS.ORDER_DETAIL.replace(':id', id);
      const response = await api.get(url);
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch order details'
      };
    }
  },

  updateOrderStatus: async (id, status) => {
    try {
      const url = MARKET_ENDPOINTS.ORDER_DETAIL.replace(':id', id);
      const response = await api.patch(url, { status });
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to update order status'
      };
    }
  },

  checkout: async (checkoutData) => {
    try {
      const response = await api.post(MARKET_ENDPOINTS.CHECKOUT, checkoutData);
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Checkout failed'
      };
    }
  }
};

export default marketService;
