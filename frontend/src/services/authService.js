import { api } from './apiClient';
import { STORAGE_KEYS } from '../utils/constants';
import { encrypt, decrypt } from '../utils/encryption';

const AUTH_ENDPOINTS = {
  LOGIN: '/v1/auth/login',
  REGISTER: '/v1/auth/register',
  LOGOUT: '/v1/auth/logout',
  REFRESH: '/v1/auth/refresh',
  VERIFY: '/v1/auth/verify',
  FORGOT_PASSWORD: '/v1/auth/forgot-password',
  RESET_PASSWORD: '/v1/auth/reset-password',
  CHANGE_PASSWORD: '/v1/auth/change-password'
};

const USER_ENDPOINTS = {
  PROFILE: '/v1/users/profile',
  AVATAR: '/v1/users/avatar'
};

export const authService = {
  login: async (credentials) => {
    try {
      const response = await api.post(AUTH_ENDPOINTS.LOGIN, credentials);
      const { data } = response.data;  // Extract nested data object
      const { user, accessToken: token } = data;  // Get user and token from nested data

      localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, token);
      localStorage.setItem(STORAGE_KEYS.USER_DATA, encrypt(user));

      return { success: true, user, token };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Login failed'
      };
    }
  },

  register: async (userData) => {
    try {
      const response = await api.post(AUTH_ENDPOINTS.REGISTER, userData);
      const { data } = response.data;  // Extract nested data object
      const { user, accessToken: token } = data;  // Get user and token from nested data

      localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, token);
      localStorage.setItem(STORAGE_KEYS.USER_DATA, encrypt(user));

      return { success: true, user, token };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Registration failed'
      };
    }
  },

  logout: async () => {
    try {
      await api.post(AUTH_ENDPOINTS.LOGOUT);
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
      localStorage.removeItem(STORAGE_KEYS.USER_DATA);
    }
  },

  getCurrentUser: () => {
    try {
      const encryptedData = localStorage.getItem(STORAGE_KEYS.USER_DATA);
      if (!encryptedData) return null;
      return decrypt(encryptedData);
    } catch (error) {
      console.error('Error getting current user:', error);
      return null;
    }
  },

  getToken: () => {
    return localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
  },

  isAuthenticated: () => {
    return !!authService.getToken();
  },

  updateProfile: async (profileData, isMultipart = false) => {
    try {
      const config = isMultipart ? { headers: { 'Content-Type': 'multipart/form-data' } } : {};
      const response = await api.put(USER_ENDPOINTS.PROFILE, profileData, config);
      const { data } = response.data;

      localStorage.setItem(STORAGE_KEYS.USER_DATA, encrypt(data));

      return { success: true, user: data };
    } catch (error) {
      console.error('Profile update error:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Profile update failed'
      };
    }
  },

  uploadAvatar: async (avatarFile) => {
    try {
      const formData = new FormData();
      formData.append('avatar', avatarFile);

      const response = await api.post(USER_ENDPOINTS.AVATAR, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      const data = response.data.data;

      localStorage.setItem(STORAGE_KEYS.USER_DATA, encrypt(data));

      return { success: true, user: data };
    } catch (error) {
      console.error('Avatar upload error:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Avatar upload failed'
      };
    }
  },

  changePassword: async (passwordData) => {
    try {
      await api.post(AUTH_ENDPOINTS.CHANGE_PASSWORD, passwordData);
      return { success: true, message: 'Password changed successfully' };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Password change failed'
      };
    }
  },

  forgotPassword: async (email) => {
    try {
      await api.post(AUTH_ENDPOINTS.FORGOT_PASSWORD, { email });
      return { success: true, message: 'Reset link sent to your email' };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Request failed'
      };
    }
  },

  resetPassword: async (token, newPassword) => {
    try {
      await api.post(AUTH_ENDPOINTS.RESET_PASSWORD, { token, password: newPassword });
      return { success: true, message: 'Password reset successful' };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Password reset failed'
      };
    }
  },

  verifyToken: async () => {
    try {
      const response = await api.get(AUTH_ENDPOINTS.VERIFY);
      return { success: true, user: response.data.user };
    } catch (error) {
      return { success: false };
    }
  }
};

export default authService;

