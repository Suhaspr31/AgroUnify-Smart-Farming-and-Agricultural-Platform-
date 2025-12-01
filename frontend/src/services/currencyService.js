import axios from 'axios';

const FREECURRENCY_API_KEY = process.env.REACT_APP_FREECURRENCY_API_KEY;
const FREECURRENCY_URL = 'https://api.freecurrencyapi.com/v1';

const currencyClient = axios.create({
  baseURL: FREECURRENCY_URL,
  timeout: 10000
});

export const currencyService = {
  // Get latest exchange rates
  getLatestRates: async (baseCurrency = 'USD') => {
    try {
      const response = await currencyClient.get('/latest', {
        params: {
          apikey: FREECURRENCY_API_KEY,
          base_currency: baseCurrency
        }
      });
      return { success: true, data: response.data };
    } catch (error) {
      console.error('FreeCurrencyAPI latest rates error:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch exchange rates'
      };
    }
  },

  // Get historical exchange rates
  getHistoricalRates: async (date, baseCurrency = 'USD') => {
    try {
      const response = await currencyClient.get('/historical', {
        params: {
          apikey: FREECURRENCY_API_KEY,
          base_currency: baseCurrency,
          date: date // Format: YYYY-MM-DD
        }
      });
      return { success: true, data: response.data };
    } catch (error) {
      console.error('FreeCurrencyAPI historical rates error:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch historical rates'
      };
    }
  },

  // Convert currency
  convertCurrency: async (fromCurrency, toCurrency, amount = 1) => {
    try {
      const response = await currencyClient.get('/latest', {
        params: {
          apikey: FREECURRENCY_API_KEY,
          base_currency: fromCurrency,
          currencies: toCurrency
        }
      });

      if (response.data.data && response.data.data[toCurrency]) {
        const rate = response.data.data[toCurrency];
        const convertedAmount = amount * rate;
        return {
          success: true,
          data: {
            from: fromCurrency,
            to: toCurrency,
            amount: amount,
            rate: rate,
            convertedAmount: convertedAmount
          }
        };
      } else {
        return { success: false, message: 'Currency conversion failed' };
      }
    } catch (error) {
      console.error('FreeCurrencyAPI conversion error:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Currency conversion failed'
      };
    }
  },

  // Get supported currencies
  getCurrencies: async () => {
    try {
      const response = await currencyClient.get('/currencies', {
        params: {
          apikey: FREECURRENCY_API_KEY
        }
      });
      return { success: true, data: response.data };
    } catch (error) {
      console.error('FreeCurrencyAPI currencies error:', error);
      // Return common currencies as fallback
      return {
        success: true,
        data: {
          USD: { name: 'US Dollar', symbol: '$' },
          EUR: { name: 'Euro', symbol: '€' },
          GBP: { name: 'British Pound', symbol: '£' },
          INR: { name: 'Indian Rupee', symbol: '₹' },
          JPY: { name: 'Japanese Yen', symbol: '¥' },
          AUD: { name: 'Australian Dollar', symbol: 'A$' },
          CAD: { name: 'Canadian Dollar', symbol: 'C$' },
          CHF: { name: 'Swiss Franc', symbol: 'CHF' },
          CNY: { name: 'Chinese Yuan', symbol: '¥' },
          BRL: { name: 'Brazilian Real', symbol: 'R$' }
        }
      };
    }
  },

  // Convert agricultural commodity prices
  convertCommodityPrice: async (price, fromCurrency, toCurrency) => {
    try {
      const conversion = await currencyService.convertCurrency(fromCurrency, toCurrency, price);
      if (conversion.success) {
        return conversion;
      } else {
        // Fallback conversion rates for common currencies
        const fallbackRates = {
          'USD_INR': 83.5,
          'EUR_INR': 89.2,
          'GBP_INR': 104.8,
          'INR_USD': 0.012,
          'INR_EUR': 0.0112,
          'INR_GBP': 0.0095
        };

        const rateKey = `${fromCurrency}_${toCurrency}`;
        const fallbackRate = fallbackRates[rateKey];

        if (fallbackRate) {
          return {
            success: true,
            data: {
              from: fromCurrency,
              to: toCurrency,
              amount: price,
              rate: fallbackRate,
              convertedAmount: price * fallbackRate,
              fallback: true
            }
          };
        }

        return { success: false, message: 'Currency conversion not available' };
      }
    } catch (error) {
      console.error('Commodity price conversion error:', error);
      return { success: false, message: 'Price conversion failed' };
    }
  }
};

export default currencyService;