import { api } from './apiClient';

const SCHEME_ENDPOINTS = {
  LIST: '/schemes',
  DETAIL: '/schemes/:id',
  ELIGIBLE: '/schemes/eligible',
  APPLY: '/schemes/:id/apply',
  APPLICATIONS: '/schemes/applications',
  APPLICATION_DETAIL: '/schemes/applications/:id'
};

export const schemeService = {
  getAllSchemes: async (params = {}) => {
    try {
      const response = await api.get(SCHEME_ENDPOINTS.LIST, { params });
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch schemes'
      };
    }
  },

  getSchemeById: async (id) => {
    try {
      const url = SCHEME_ENDPOINTS.DETAIL.replace(':id', id);
      const response = await api.get(url);
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch scheme details'
      };
    }
  },

  getEligibleSchemes: async () => {
    try {
      const response = await api.get(SCHEME_ENDPOINTS.ELIGIBLE);
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch eligible schemes'
      };
    }
  },

  applyForScheme: async (schemeId, applicationData) => {
    try {
      const url = SCHEME_ENDPOINTS.APPLY.replace(':id', schemeId);
      const response = await api.post(url, applicationData);
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Application failed'
      };
    }
  },

  getApplications: async (params = {}) => {
    try {
      const response = await api.get(SCHEME_ENDPOINTS.APPLICATIONS, { params });
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch applications'
      };
    }
  },

  getApplicationById: async (id) => {
    try {
      const url = SCHEME_ENDPOINTS.APPLICATION_DETAIL.replace(':id', id);
      const response = await api.get(url);
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch application details'
      };
    }
  }
};

export default schemeService;
