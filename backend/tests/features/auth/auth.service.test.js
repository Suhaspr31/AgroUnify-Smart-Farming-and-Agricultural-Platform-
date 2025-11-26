const aiService = require('../../../src/services/aiService');
const axios = require('axios');

// Mock axios
jest.mock('axios');
const mockedAxios = axios;

describe('AI Service Unit Tests', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('analyzeCropDisease', () => {
    it('should return disease analysis when API succeeds', async () => {
      const mockResponse = {
        data: {
          disease: 'Leaf Spot',
          confidence: 0.85,
          severity: 'medium',
          recommendations: ['Apply fungicide', 'Improve drainage'],
          health_score: 75
        }
      };

      mockedAxios.post.mockResolvedValue(mockResponse);

      // Mock fs.existsSync
      const fs = require('fs');
      jest.spyOn(fs, 'existsSync').mockReturnValue(true);
      jest.spyOn(fs, 'createReadStream').mockReturnValue({});

      const result = await aiService.analyzeCropDisease('/path/to/image.jpg', 'wheat');

      expect(result.disease_name).toBe('Leaf Spot');
      expect(result.confidence).toBe(0.85);
      expect(result.severity).toBe('medium');
      expect(result.treatment_recommendations).toContain('Apply fungicide');
      expect(result.health_score).toBe(75);
    });

    it('should return mock analysis when API fails', async () => {
      mockedAxios.post.mockRejectedValue(new Error('API Error'));

      const fs = require('fs');
      jest.spyOn(fs, 'existsSync').mockReturnValue(true);
      jest.spyOn(fs, 'createReadStream').mockReturnValue({});

      const result = await aiService.analyzeCropDisease('/path/to/image.jpg', 'wheat');

      expect(result.disease_name).toBeDefined();
      expect(result.confidence).toBeGreaterThan(0);
      expect(result.treatment_recommendations).toBeInstanceOf(Array);
      expect(result.health_score).toBeGreaterThan(0);
    });

    it('should return mock analysis when image file not found', async () => {
      const fs = require('fs');
      jest.spyOn(fs, 'existsSync').mockReturnValue(false);

      const result = await aiService.analyzeCropDisease('/nonexistent/image.jpg', 'wheat');

      expect(result.disease_name).toBeDefined();
      expect(result.confidence).toBeGreaterThan(0);
    });
  });

  describe('predictYield', () => {
    it('should return yield prediction when API succeeds', async () => {
      const mockResponse = {
        data: {
          yield: 45.5,
          confidence: 0.78,
          factors: {
            weather: 0.8,
            soil: 0.7
          },
          recommendations: ['Maintain irrigation', 'Monitor pests']
        }
      };

      mockedAxios.post.mockResolvedValue(mockResponse);

      const cropData = {
        crop_type: 'wheat',
        area: 2.5,
        soil_type: 'loamy'
      };

      const result = await aiService.predictYield(cropData);

      expect(result.predicted_yield).toBe(45.5);
      expect(result.confidence).toBe(0.78);
      expect(result.factors_analysis.weather).toBe(0.8);
      expect(result.recommendations).toContain('Maintain irrigation');
    });

    it('should return mock prediction when API fails', async () => {
      mockedAxios.post.mockRejectedValue(new Error('API Error'));

      const cropData = {
        crop_type: 'wheat',
        area: 2.5
      };

      const result = await aiService.predictYield(cropData);

      expect(result.predicted_yield).toBeGreaterThan(0);
      expect(result.confidence).toBeGreaterThan(0);
      expect(result.factors_analysis).toBeDefined();
      expect(result.recommendations).toBeInstanceOf(Array);
    });
  });

  describe('checkHealth', () => {
    it('should return online status when API is reachable', async () => {
      const mockResponse = {
        data: {
          version: '1.0.0'
        }
      };

      mockedAxios.get.mockResolvedValue(mockResponse);

      const result = await aiService.checkHealth();

      expect(result.status).toBe('online');
      expect(result.version).toBe('1.0.0');
      expect(result.timestamp).toBeDefined();
    });

    it('should return offline status when API is unreachable', async () => {
      mockedAxios.get.mockRejectedValue(new Error('Connection refused'));

      const result = await aiService.checkHealth();

      expect(result.status).toBe('offline');
      expect(result.error).toBe('Connection refused');
      expect(result.timestamp).toBeDefined();
    });
  });
});