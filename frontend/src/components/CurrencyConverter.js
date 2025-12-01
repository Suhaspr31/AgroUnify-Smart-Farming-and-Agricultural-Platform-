import React, { useState, useEffect } from 'react';
import { FiRefreshCw, FiTrendingUp } from 'react-icons/fi';
import { useCurrency } from '../hooks/useCurrency';
import './CurrencyConverter.css';

const CurrencyConverter = () => {
  const {
    loading,
    error,
    convertCurrency,
    formatCurrency,
    getLatestRates,
    currencies
  } = useCurrency();

  const [fromCurrency, setFromCurrency] = useState('USD');
  const [toCurrency, setToCurrency] = useState('INR');
  const [amount, setAmount] = useState(1);
  const [convertedAmount, setConvertedAmount] = useState(0);
  const [conversionRate, setConversionRate] = useState(0);

  useEffect(() => {
    handleConvert();
  }, [fromCurrency, toCurrency, amount]);

  const handleConvert = async () => {
    if (amount <= 0) return;

    const result = await convertCurrency(fromCurrency, toCurrency, amount);
    if (result.success) {
      setConvertedAmount(result.data.convertedAmount);
      setConversionRate(result.data.rate);
    }
  };

  const swapCurrencies = () => {
    setFromCurrency(toCurrency);
    setToCurrency(fromCurrency);
  };

  const refreshRates = async () => {
    await getLatestRates(fromCurrency);
    handleConvert();
  };

  const currencyOptions = Object.keys(currencies).map(code => (
    <option key={code} value={code}>
      {currencies[code].symbol} {currencies[code].name} ({code})
    </option>
  ));

  return (
    <div className="currency-converter">
      <div className="converter-header">
        <h3>💱 Currency Converter</h3>
        <p>Convert agricultural commodity prices between currencies</p>
      </div>

      <div className="converter-form">
        <div className="input-group">
          <label>From Currency</label>
          <select
            value={fromCurrency}
            onChange={(e) => setFromCurrency(e.target.value)}
          >
            {currencyOptions}
          </select>
        </div>

        <button
          type="button"
          className="swap-button"
          onClick={swapCurrencies}
          title="Swap currencies"
        >
          ⇄
        </button>

        <div className="input-group">
          <label>To Currency</label>
          <select
            value={toCurrency}
            onChange={(e) => setToCurrency(e.target.value)}
          >
            {currencyOptions}
          </select>
        </div>
      </div>

      <div className="amount-input">
        <label>Amount</label>
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
          min="0"
          step="0.01"
          placeholder="Enter amount"
        />
      </div>

      <div className="conversion-result">
        <div className="result-display">
          <div className="original-amount">
            {formatCurrency(amount, fromCurrency)}
          </div>
          <div className="equals">=</div>
          <div className="converted-amount">
            {formatCurrency(convertedAmount, toCurrency)}
          </div>
        </div>

        {conversionRate > 0 && (
          <div className="rate-info">
            <FiTrendingUp />
            <span>1 {fromCurrency} = {conversionRate.toFixed(4)} {toCurrency}</span>
            <button
              className="refresh-btn"
              onClick={refreshRates}
              disabled={loading}
              title="Refresh rates"
            >
              <FiRefreshCw className={loading ? 'spinning' : ''} />
            </button>
          </div>
        )}
      </div>

      {error && (
        <div className="error-message">
          ⚠️ {error}
        </div>
      )}

      <div className="converter-tips">
        <h4>💡 Usage Tips</h4>
        <ul>
          <li>Use this converter to compare agricultural commodity prices from different countries</li>
          <li>Rates are updated regularly for accuracy</li>
          <li>Common conversions: USD to INR for international trade</li>
          <li>Useful for farmers dealing with export/import</li>
        </ul>
      </div>
    </div>
  );
};

export default CurrencyConverter;