import axios from 'axios';

const NEWS_API_KEY = process.env.REACT_APP_NEWS_API_KEY;
const NEWS_API_URL = 'https://newsapi.org/v2';
const API_BASE = process.env.REACT_APP_API_BASE_URL || '';

// If a backend API base URL is configured, prefer the backend proxy routes which
// keep the NewsAPI key on the server. Otherwise, call NewsAPI directly (existing behavior).
const newsClient = axios.create({
  baseURL: API_BASE ? API_BASE : NEWS_API_URL,
  timeout: 10000
});

const useBackend = Boolean(API_BASE);

export const newsService = {
  getTopHeadlines: async (params = {}) => {
    try {
      if (useBackend) {
        // Backend proxies to NewsAPI
        const resp = await newsClient.get('/news/top-headlines', { params });
        return { success: true, data: resp.data.data };
      }

      // Direct client-side call to NewsAPI
      const response = await newsClient.get('/top-headlines', {
        params: {
          apiKey: NEWS_API_KEY,
          country: 'in',
          category: 'business',
          ...params
        }
      });
      return { success: true, data: response.data.articles };
    } catch (error) {
      console.error('News API error:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch news'
      };
    }
  },

  getAgricultureNews: async (params = {}) => {
    try {
      if (useBackend) {
        const resp = await newsClient.get('/news/agriculture', { params });
        return { success: true, data: resp.data.data };
      }

      const response = await newsClient.get('/everything', {
        params: {
          apiKey: NEWS_API_KEY,
          q: 'agriculture OR farming OR crops OR farmers OR "agri business"',
          language: 'en',
          sortBy: 'publishedAt',
          ...params
        }
      });
      return { success: true, data: response.data.articles };
    } catch (error) {
      console.error('Agriculture news API error:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch agriculture news'
      };
    }
  },

  searchNews: async (query, params = {}) => {
    try {
      if (useBackend) {
        const resp = await newsClient.get('/news/search', { params: { q: query, ...params } });
        return { success: true, data: resp.data.data };
      }

      const response = await newsClient.get('/everything', {
        params: {
          apiKey: NEWS_API_KEY,
          q: query,
          language: 'en',
          sortBy: 'publishedAt',
          ...params
        }
      });
      return { success: true, data: response.data.articles };
    } catch (error) {
      console.error('News search API error:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to search news'
      };
    }
  },

  // history: without date -> list available dates; with date -> articles for that date (backend only)
  getHistory: async (date) => {
    if (!useBackend) return { success: false, message: 'History requires backend proxy' };
    try {
      const resp = await newsClient.get('/news/history', { params: date ? { date } : {} });
      return { success: true, data: resp.data };
    } catch (error) {
      console.error('News history API error:', error);
      return { success: false, message: error.response?.data?.message || 'Failed to fetch history' };
    }
  }
};

export default newsService;

          