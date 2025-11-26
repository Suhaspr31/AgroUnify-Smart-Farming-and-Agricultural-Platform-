export const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
export const WEATHER_API_KEY = process.env.REACT_APP_WEATHER_API_KEY;
export const WEATHER_API_URL = process.env.REACT_APP_WEATHER_API_URL;

export const USER_ROLES = {
  FARMER: 'farmer',
  CUSTOMER: 'customer',
  ADMIN: 'admin',
  FPO: 'fpo'
};

export const CROP_TYPES = [
  'Rice', 'Wheat', 'Cotton', 'Sugarcane', 'Maize',
  'Bajra', 'Jowar', 'Barley', 'Pulses', 'Oilseeds',
  'Vegetables', 'Fruits', 'Spices'
];

export const CROP_SEASONS = {
  KHARIF: 'Kharif',
  RABI: 'Rabi',
  ZAID: 'Zaid'
};

export const ORDER_STATUS = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  PROCESSING: 'processing',
  SHIPPED: 'shipped',
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled'
};

export const PAYMENT_STATUS = {
  PENDING: 'pending',
  COMPLETED: 'completed',
  FAILED: 'failed',
  REFUNDED: 'refunded'
};

export const WEATHER_CONDITIONS = {
  CLEAR: 'Clear',
  CLOUDS: 'Clouds',
  RAIN: 'Rain',
  DRIZZLE: 'Drizzle',
  THUNDERSTORM: 'Thunderstorm',
  SNOW: 'Snow',
  MIST: 'Mist'
};

export const STORAGE_KEYS = {
  AUTH_TOKEN: 'authToken',
  USER_DATA: 'userData',
  LANGUAGE: 'language',
  THEME: 'theme',
  CART: 'cart'
};

export const LANGUAGES = {
  EN: 'en',
  HI: 'hi',
  KN: 'kn',
  TE: 'te'
};

export const SOIL_TYPES = [
  'Alluvial', 'Black', 'Red', 'Laterite', 
  'Desert', 'Mountain', 'Forest', 'Saline'
];

export const IRRIGATION_TYPES = [
  'Drip', 'Sprinkler', 'Flood', 'Furrow', 'None'
];
