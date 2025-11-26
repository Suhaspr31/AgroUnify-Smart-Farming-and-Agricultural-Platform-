import { STORAGE_KEYS } from '../utils/constants';
import { encrypt, decrypt } from '../utils/encryption';

export const storageService = {
  set: (key, value, encrypted = false) => {
    try {
      const data = encrypted ? encrypt(value) : JSON.stringify(value);
      localStorage.setItem(key, data);
      return true;
    } catch (error) {
      console.error('Storage set error:', error);
      return false;
    }
  },

  get: (key, encrypted = false) => {
    try {
      const data = localStorage.getItem(key);
      if (!data) return null;
      return encrypted ? decrypt(data) : JSON.parse(data);
    } catch (error) {
      console.error('Storage get error:', error);
      return null;
    }
  },

  remove: (key) => {
    try {
      localStorage.removeItem(key);
      return true;
    } catch (error) {
      console.error('Storage remove error:', error);
      return false;
    }
  },

  clear: () => {
    try {
      localStorage.clear();
      return true;
    } catch (error) {
      console.error('Storage clear error:', error);
      return false;
    }
  },

  has: (key) => {
    return localStorage.getItem(key) !== null;
  },

  // Session storage methods
  setSession: (key, value) => {
    try {
      sessionStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (error) {
      console.error('Session storage set error:', error);
      return false;
    }
  },

  getSession: (key) => {
    try {
      const data = sessionStorage.getItem(key);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Session storage get error:', error);
      return null;
    }
  },

  removeSession: (key) => {
    try {
      sessionStorage.removeItem(key);
      return true;
    } catch (error) {
      console.error('Session storage remove error:', error);
      return false;
    }
  },

  // Cart specific methods
  getCart: () => {
    return storageService.get(STORAGE_KEYS.CART) || [];
  },

  setCart: (cart) => {
    return storageService.set(STORAGE_KEYS.CART, cart);
  },

  addToCart: (item) => {
    const cart = storageService.getCart();
    const existingIndex = cart.findIndex(i => i.id === item.id);
    
    if (existingIndex > -1) {
      cart[existingIndex].quantity += item.quantity || 1;
    } else {
      cart.push({ ...item, quantity: item.quantity || 1 });
    }
    
    return storageService.setCart(cart);
  },

  removeFromCart: (itemId) => {
    const cart = storageService.getCart();
    const filtered = cart.filter(item => item.id !== itemId);
    return storageService.setCart(filtered);
  },

  clearCart: () => {
    return storageService.set(STORAGE_KEYS.CART, []);
  },

  // Language preference
  getLanguage: () => {
    return storageService.get(STORAGE_KEYS.LANGUAGE) || 'en';
  },

  setLanguage: (lang) => {
    return storageService.set(STORAGE_KEYS.LANGUAGE, lang);
  },

  // Theme preference
  getTheme: () => {
    return storageService.get(STORAGE_KEYS.THEME) || 'light';
  },

  setTheme: (theme) => {
    return storageService.set(STORAGE_KEYS.THEME, theme);
  }
};

export default storageService;
