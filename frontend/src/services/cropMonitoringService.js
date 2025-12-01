import { api } from './apiClient';

const cropMonitoringService = {
  // Get satellite imagery
  getSatelliteImagery: async (polygon, startDate, endDate, layer = 'NDVI') => {
    try {
      const response = await api.post('/crop-monitoring/satellite-imagery', {
        polygon,
        startDate,
        endDate,
        layer,
      });
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch satellite imagery',
      };
    }
  },

  // Get crop health analysis
  getCropHealth: async (fieldId, date) => {
    try {
      const response = await api.get(`/crop-monitoring/crop-health/${fieldId}/${date}`);
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch crop health data',
      };
    }
  },

  // Get vegetation indices
  getVegetationIndices: async (fieldId, startDate, endDate) => {
    try {
      const response = await api.get('/crop-monitoring/vegetation-indices', {
        params: { fieldId, startDate, endDate },
      });
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch vegetation indices',
      };
    }
  },

  // Get field boundaries
  getFieldBoundaries: async (farmId) => {
    try {
      const response = await api.get(`/crop-monitoring/field-boundaries/${farmId}`);
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch field boundaries',
      };
    }
  },

  // Get irrigation recommendations
  getIrrigationRecommendations: async (fieldId) => {
    try {
      const response = await api.get(`/crop-monitoring/irrigation-recommendations/${fieldId}`);
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch irrigation recommendations',
      };
    }
  },

  // Get pest detection alerts
  getPestDetection: async (fieldId, date) => {
    try {
      const response = await api.get('/crop-monitoring/pest-detection', {
        params: { fieldId, date },
      });
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch pest detection data',
      };
    }
  },
};

export default cropMonitoringService;