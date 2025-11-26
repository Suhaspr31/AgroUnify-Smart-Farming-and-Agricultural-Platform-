import React, { useState, useEffect } from 'react';
import { FiTrendingUp, FiTrendingDown, FiMinus } from 'react-icons/fi';
import CropPriceChart from '../../components/marketplace/CropPriceChart';
import Loader from '../../components/common/Loader';
import './PriceTrends.css';

const PriceTrends = () => {
  const [crops, setCrops] = useState([]);
  const [selectedCrop, setSelectedCrop] = useState(null);
  const [priceHistory, setPriceHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('30d');

  useEffect(() => {
    fetchCrops();
  }, []);

  useEffect(() => {
    if (selectedCrop) {
      fetchPriceHistory(selectedCrop.id, period);
    }
  }, [selectedCrop, period]);

  const fetchCrops = async () => {
    setLoading(true);
    // Mock data
    const mockCrops = [
      {
        id: 1,
        name: 'Rice',
        currentPrice: 2500,
        previousPrice: 2400,
        change: 4.17,
        unit: 'quintal'
      },
      {
        id: 2,
        name: 'Wheat',
        currentPrice: 2000,
        previousPrice: 2050,
        change: -2.44,
        unit: 'quintal'
      },
      {
        id: 3,
        name: 'Cotton',
        currentPrice: 5500,
        previousPrice: 5500,
        change: 0,
        unit: 'quintal'
      },
      {
        id: 4,
        name: 'Sugarcane',
        currentPrice: 3500,
        previousPrice: 3300,
        change: 6.06,
        unit: 'ton'
      },
      {
        id: 5,
        name: 'Maize',
        currentPrice: 1800,
        previousPrice: 1900,
        change: -5.26,
        unit: 'quintal'
      },
      {
        id: 6,
        name: 'Soybean',
        currentPrice: 4200,
        previousPrice: 4100,
        change: 2.44,
        unit: 'quintal'
      }
    ];
    setCrops(mockCrops);
    setSelectedCrop(mockCrops[0]);
    setLoading(false);
  };

  const fetchPriceHistory = async (cropId, period) => {
    // Mock price history data
    const mockHistory = [
      { date: '2025-09-21', price: 2300 },
      { date: '2025-09-24', price: 2320 },
      { date: '2025-09-27', price: 2350 },
      { date: '2025-09-30', price: 2380 },
      { date: '2025-10-03', price: 2400 },
      { date: '2025-10-06', price: 2420 },
      { date: '2025-10-09', price: 2450 },
      { date: '2025-10-12', price: 2470 },
      { date: '2025-10-15', price: 2490 },
      { date: '2025-10-18', price: 2500 },
      { date: '2025-10-21', price: 2500 }
    ];
    setPriceHistory(mockHistory);
  };

  const getTrendIcon = (change) => {
    if (change > 0) return <FiTrendingUp className="trend-up" />;
    if (change < 0) return <FiTrendingDown className="trend-down" />;
    return <FiMinus className="trend-neutral" />;
  };

  const getTrendClass = (change) => {
    if (change > 0) return 'positive';
    if (change < 0) return 'negative';
    return 'neutral';
  };

  if (loading) {
    return <Loader fullPage />;
  }

  return (
    <div className="price-trends-page">
      <div className="container">
        <div className="page-header">
          <h1>Market Price Trends</h1>
          <p>Track real-time crop prices and market trends</p>
        </div>

        <div className="price-content-grid">
          {/* Crops List */}
          <div className="crops-price-list">
            <h2>Crop Prices</h2>
            <div className="price-cards">
              {crops.map(crop => (
                <div
                  key={crop.id}
                  className={`price-card ${selectedCrop?.id === crop.id ? 'active' : ''}`}
                  onClick={() => setSelectedCrop(crop)}
                >
                  <div className="price-card-header">
                    <h3>{crop.name}</h3>
                    {getTrendIcon(crop.change)}
                  </div>
                  <div className="price-card-body">
                    <span className="current-price">₹{crop.currentPrice}</span>
                    <span className="price-unit">per {crop.unit}</span>
                  </div>
                  <div className={`price-change ${getTrendClass(crop.change)}`}>
                    {crop.change > 0 ? '+' : ''}{crop.change.toFixed(2)}%
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Price Chart */}
          <div className="price-chart-section">
            <div className="chart-header">
              <h2>{selectedCrop?.name} Price History</h2>
              <div className="period-selector">
                <button
                  className={period === '7d' ? 'active' : ''}
                  onClick={() => setPeriod('7d')}
                >
                  7 Days
                </button>
                <button
                  className={period === '30d' ? 'active' : ''}
                  onClick={() => setPeriod('30d')}
                >
                  30 Days
                </button>
                <button
                  className={period === '90d' ? 'active' : ''}
                  onClick={() => setPeriod('90d')}
                >
                  90 Days
                </button>
                <button
                  className={period === '1y' ? 'active' : ''}
                  onClick={() => setPeriod('1y')}
                >
                  1 Year
                </button>
              </div>
            </div>

            {priceHistory.length > 0 && (
              <CropPriceChart data={priceHistory} cropName={selectedCrop?.name} />
            )}

            <div className="price-stats">
              <div className="stat-item">
                <span className="stat-label">Current Price</span>
                <span className="stat-value">₹{selectedCrop?.currentPrice}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Previous Price</span>
                <span className="stat-value">₹{selectedCrop?.previousPrice}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Change</span>
                <span className={`stat-value ${getTrendClass(selectedCrop?.change)}`}>
                  {selectedCrop?.change > 0 ? '+' : ''}{selectedCrop?.change.toFixed(2)}%
                </span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Unit</span>
                <span className="stat-value">{selectedCrop?.unit}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PriceTrends;
