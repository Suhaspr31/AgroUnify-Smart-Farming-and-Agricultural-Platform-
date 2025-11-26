import { api } from './apiClient';

const FARM_ENDPOINTS = {
  LIST: '/v1/farms',
  DETAIL: '/v1/farms/:id',
  CREATE: '/v1/farms',
  UPDATE: '/v1/farms/:id',
  DELETE: '/v1/farms/:id',
  FIELDS: '/v1/farms/:id/fields',
  ANALYTICS: '/v1/farms/:id/analytics',
  ACTIVITIES: '/v1/farms/:id/activities'
};

export const farmService = {
  getAllFarms: async (params = {}) => {
    try {
      const response = await api.get(FARM_ENDPOINTS.LIST, { params });
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch farms'
      };
    }
  },

  getFarmById: async (id) => {
    try {
      const url = FARM_ENDPOINTS.DETAIL.replace(':id', id);
      const response = await api.get(url);
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch farm details'
      };
    }
  },

  createFarm: async (farmData) => {
    try {
      const response = await api.post(FARM_ENDPOINTS.CREATE, farmData);
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to create farm'
      };
    }
  },

  updateFarm: async (id, farmData) => {
    try {
      const url = FARM_ENDPOINTS.UPDATE.replace(':id', id);
      const response = await api.put(url, farmData);
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to update farm'
      };
    }
  },

  deleteFarm: async (id) => {
    try {
      const url = FARM_ENDPOINTS.DELETE.replace(':id', id);
      await api.delete(url);
      return { success: true };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to delete farm'
      };
    }
  },

  getFarmFields: async (farmId) => {
    try {
      const url = FARM_ENDPOINTS.FIELDS.replace(':id', farmId);
      const response = await api.get(url);
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch fields'
      };
    }
  },

  getFarmAnalytics: async (farmId, period = '30d') => {
    try {
      const url = FARM_ENDPOINTS.ANALYTICS.replace(':id', farmId);
      const response = await api.get(url, { params: { period } });
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch analytics'
      };
    }
  },

  getFarmActivities: async (farmId, params = {}) => {
    try {
      const url = FARM_ENDPOINTS.ACTIVITIES.replace(':id', farmId);
      const response = await api.get(url, { params });
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch activities'
      };
    }
  }
};

export default farmService;
