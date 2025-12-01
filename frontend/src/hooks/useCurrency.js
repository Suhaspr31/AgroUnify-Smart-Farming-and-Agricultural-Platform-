import { useState, useEffect } from 'react';
import currencyService from '../services/currencyService';

export const useCurrency = () => {
  const [rates, setRates] = useState({});
  const [currencies, setCurrencies] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Load currencies on mount
  useEffect(() => {
    loadCurrencies();
  }, []);

  const loadCurrencies = async () => {
    try {
      const result = await currencyService.getCurrencies();
      if (result.success) {
        setCurrencies(result.data);
      }
    } catch (err) {
      console.error('Failed to load currencies:', err);
    }
  };

  const getLatestRates = async (baseCurrency = 'USD') => {
    try {
      setLoading(true);
      setError(null);
      const result = await currencyService.getLatestRates(baseCurrency);
      if (result.success) {
        setRates(result.data.data);
        return result;
      } else {
        setError(result.message);
        return result;
      }
    } catch (err) {
      setError('Failed to fetch exchange rates');
      return { success: false, message: 'Failed to fetch exchange rates' };
    } finally {
      setLoading(false);
    }
  };

  const convertCurrency = async (fromCurrency, toCurrency, amount = 1) => {
    try {
      setLoading(true);
      setError(null);
      const result = await currencyService.convertCurrency(fromCurrency, toCurrency, amount);
      return result;
    } catch (err) {
      setError('Currency conversion failed');
      return { success: false, message: 'Currency conversion failed' };
    } finally {
      setLoading(false);
    }
  };

  const convertCommodityPrice = async (price, fromCurrency, toCurrency) => {
    try {
      setLoading(true);
      setError(null);
      const result = await currencyService.convertCommodityPrice(price, fromCurrency, toCurrency);
      return result;
    } catch (err) {
      setError('Commodity price conversion failed');
      return { success: false, message: 'Commodity price conversion failed' };
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount, currencyCode) => {
    const currency = currencies[currencyCode];
    if (currency) {
      return `${currency.symbol}${amount.toFixed(2)}`;
    }
    return `${currencyCode} ${amount.toFixed(2)}`;
  };

  const getExchangeRate = (fromCurrency, toCurrency) => {
    if (rates && rates[toCurrency]) {
      return rates[toCurrency];
    }
    return null;
  };

  return {
    rates,
    currencies,
    loading,
    error,
    getLatestRates,
    convertCurrency,
    convertCommodityPrice,
    formatCurrency,
    getExchangeRate,
    loadCurrencies
  };
};

export default useCurrency;