// frontend/src/services/cropAnalysisService.js
import axios from 'axios';

const API_BASE_URL = 'http://localhost:5005';
const API_VERSION = 'v1';

class CropAnalysisService {
  /**
   * Analyze crop image
   * @param {File} imageFile - The image file to analyze
   * @param {string} language - Analysis language (English, Hindi, Kannada, Telugu)
   * @param {string} format - Response format (pdf or json)
   * @returns {Promise} - Analysis result
   */
  async analyzeCrop(imageFile, language = 'English', format = 'pdf') {
    try {
      const formData = new FormData();
      formData.append('image', imageFile);
      formData.append('language', language);

      const response = await axios.post(
        `${API_BASE_URL}/api/${API_VERSION}/crop-analysis/analyze?format=${format}`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
          responseType: format === 'pdf' ? 'blob' : 'json',
          timeout: 60000, // 60 seconds
          onUploadProgress: (progressEvent) => {
            const percentCompleted = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            console.log(`Upload progress: ${percentCompleted}%`);
          },
        }
      );

      return response.data;
    } catch (error) {
      console.error('Crop analysis error:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Check service health
   */
  async checkHealth() {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/api/${API_VERSION}/crop-analysis/health`,
        { timeout: 5000 }
      );
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get supported languages
   */
  async getLanguages() {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/api/${API_VERSION}/crop-analysis/languages`
      );
      return response.data.languages;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Handle errors
   */
  handleError(error) {
    if (error.response) {
      // Server responded with error
      return {
        message: error.response.data?.error || 'Analysis failed',
        details: error.response.data?.details,
        status: error.response.status,
      };
    } else if (error.request) {
      // Request made but no response
      return {
        message: 'Cannot connect to server. Please check your connection.',
        details: 'Network error',
        status: 0,
      };
    } else {
      // Something else happened
      return {
        message: error.message || 'Unknown error occurred',
        details: 'Client error',
        status: -1,
      };
    }
  }
}

const cropAnalysisService = new CropAnalysisService();
export default cropAnalysisService;