import { api } from './apiClient';

const soilMonitoringService = {
  // Get soil data for specific location
  getSoilData: async (lat, lon, depth = 30) => {
    try {
      const response = await api.get('/soil-monitoring/data', {
        params: { lat, lon, depth },
      });
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch soil data',
      };
    }
  },

  // Get soil moisture data
  getSoilMoisture: async (lat, lon, start, end) => {
    try {
      const response = await api.get('/soil-monitoring/moisture', {
        params: { lat, lon, start, end },
      });
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch soil moisture data',
      };
    }
  },

  // Get soil temperature
  getSoilTemperature: async (lat, lon, depth = 10) => {
    try {
      const response = await api.get('/soil-monitoring/temperature', {
        params: { lat, lon, depth },
      });
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch soil temperature',
      };
    }
  },

  // Get comprehensive soil analysis
  getSoilAnalysis: async (lat, lon) => {
    try {
      const response = await api.get('/soil-monitoring/analysis', {
        params: { lat, lon },
      });
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch soil analysis',
      };
    }
  },

  // Get soil sensors data
  getSoilSensors: async (farmId) => {
    try {
      const response = await api.get(`/soil-monitoring/sensors/${farmId}`);
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch soil sensors data',
      };
    }
  },
};

export default soilMonitoringService;