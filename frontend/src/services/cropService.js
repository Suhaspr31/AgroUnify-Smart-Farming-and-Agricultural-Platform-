import { api } from './apiClient';

const CROP_ENDPOINTS = {
  LIST: '/crops',
  DETAIL: '/crops/:id',
  CREATE: '/crops',
  UPDATE: '/crops/:id',
  DELETE: '/crops/:id',
  SEARCH: '/crops/search',
  CATEGORIES: '/crops/categories',
  DISEASES: '/crops/:id/diseases',
  RECOMMENDATIONS: '/crops/recommendations',
  PRICE_HISTORY: '/crops/:id/prices'
};

export const cropService = {
  getAllCrops: async (params = {}) => {
    try {
      const response = await api.get(CROP_ENDPOINTS.LIST, { params });
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch crops'
      };
    }
  },

  getCropById: async (id) => {
    try {
      const url = CROP_ENDPOINTS.DETAIL.replace(':id', id);
      const response = await api.get(url);
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch crop details'
      };
    }
  },

  createCrop: async (cropData) => {
    try {
      const response = await api.post(CROP_ENDPOINTS.CREATE, cropData);
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to create crop'
      };
    }
  },

  updateCrop: async (id, cropData) => {
    try {
      const url = CROP_ENDPOINTS.UPDATE.replace(':id', id);
      const response = await api.put(url, cropData);
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to update crop'
      };
    }
  },

  deleteCrop: async (id) => {
    try {
      const url = CROP_ENDPOINTS.DELETE.replace(':id', id);
      await api.delete(url);
      return { success: true };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to delete crop'
      };
    }
  },

  searchCrops: async (query) => {
    try {
      const response = await api.get(CROP_ENDPOINTS.SEARCH, {
        params: { q: query }
      });
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Search failed'
      };
    }
  },

  getCropCategories: async () => {
    try {
      const response = await api.get(CROP_ENDPOINTS.CATEGORIES);
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch categories'
      };
    }
  },

  getCropDiseases: async (cropId) => {
    try {
      const url = CROP_ENDPOINTS.DISEASES.replace(':id', cropId);
      const response = await api.get(url);
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch diseases'
      };
    }
  },

  getCropRecommendations: async (filters) => {
    try {
      const response = await api.post(CROP_ENDPOINTS.RECOMMENDATIONS, filters);
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to get recommendations'
      };
    }
  },

  getCropPriceHistory: async (cropId, period = '30d') => {
    try {
      const url = CROP_ENDPOINTS.PRICE_HISTORY.replace(':id', cropId);
      const response = await api.get(url, { params: { period } });
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch price history'
      };
    }
  }
};

export default cropService;
