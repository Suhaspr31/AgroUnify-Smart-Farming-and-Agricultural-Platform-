const axios = require('axios');
const MarketPrice = require('./market.model');
const logger = require('../../core/logger');

// Agmarknet API configuration
const AGMARKNET_API_URL = 'https://api.data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070';
const AGMARKNET_API_KEY = process.env.AGMARKNET_API_KEY || 'your_agmarknet_api_key';

// Data.gov.in API configuration for additional market data
const DATA_GOV_API_KEY = process.env.DATA_GOV_API_KEY || '579b464db66ec23bdd000001a31f9042bc0b4eae5c671754a56d33d5';
const DATA_GOV_API_URL = 'https://api.data.gov.in/resource';

// Commodities mapping for better user experience
const COMMODITY_MAPPING = {
  rice: ['Rice', 'Paddy'],
  wheat: ['Wheat'],
  maize: ['Maize', 'Corn'],
  cotton: ['Cotton'],
  sugarcane: ['Sugarcane'],
  soybean: ['Soybean', 'Soya Bean'],
  potato: ['Potato'],
  tomato: ['Tomato'],
  onion: ['Onion'],
  banana: ['Banana']
};