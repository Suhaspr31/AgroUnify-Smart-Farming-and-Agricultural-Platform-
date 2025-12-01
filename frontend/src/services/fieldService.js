import { api } from './apiClient';

const FIELD_ENDPOINTS = {
  LIST: '/fields',
  DETAIL: '/fields/:id',
  CREATE: '/fields',
  UPDATE: '/fields/:id',
  DELETE: '/fields/:id'
};

export const fieldService = {
  getAllFields: async (params = {}) => {
    try {
      console.log('fieldService.getAllFields called with params:', params);
      console.log('Making API request to:', FIELD_ENDPOINTS.LIST);
      const response = await api.get(FIELD_ENDPOINTS.LIST, { params });
      console.log('API response received:', response.status, response.data);
      return { success: true, data: response.data };
    } catch (error) {
      console.error('fieldService.getAllFields error:', error.message);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch fields'
      };
    }
  },

  getFieldById: async (id) => {
    try {
      const url = FIELD_ENDPOINTS.DETAIL.replace(':id', id);
      const response = await api.get(url);
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch field details'
      };
    }
  },

  createField: async (fieldData) => {
    try {
      const response = await api.post(FIELD_ENDPOINTS.CREATE, fieldData);
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to create field'
      };
    }
  },

  updateField: async (id, fieldData) => {
    try {
      const url = FIELD_ENDPOINTS.UPDATE.replace(':id', id);
      const response = await api.put(url, fieldData);
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to update field'
      };
    }
  },

  deleteField: async (id) => {
    try {
      const url = FIELD_ENDPOINTS.DELETE.replace(':id', id);
      await api.delete(url);
      return { success: true };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to delete field'
      };
    }
  }
};

export default fieldService;