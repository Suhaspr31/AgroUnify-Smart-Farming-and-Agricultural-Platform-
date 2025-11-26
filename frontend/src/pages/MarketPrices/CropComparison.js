import React, { useState } from 'react';
import { FiPlus, FiX } from 'react-icons/fi';
import './CropComparison.css';

const CropComparison = () => {
  const [selectedCrops, setSelectedCrops] = useState(['Rice', 'Wheat']);
  const [availableCrops] = useState([
    'Rice', 'Wheat', 'Cotton', 'Sugarcane', 'Maize', 
    'Soybean', 'Pulses', 'Groundnut', 'Sunflower', 'Jowar'
  ]);

  const cropData = {
    'Rice': {
      currentPrice: 2500,
      weekChange: 4.17,
      monthChange: 6.38,
      yearChange: 12.5,
      avgPrice: 2350,
      minPrice: 2200,
      maxPrice: 2600,
      volatility: 'Low',
      demand: 'High',
      supply: 'Moderate'
    },
    'Wheat': {
      currentPrice: 2000,
      weekChange: -2.44,
      monthChange: 1.52,
      yearChange: 8.11,
      avgPrice: 1980,
      minPrice: 1850,
      maxPrice: 2100,
      volatility: 'Moderate',
      demand: 'High',
      supply: 'High'
    },
    'Cotton': {
      currentPrice: 5500,
      weekChange: 0,
      monthChange: 3.77,
      yearChange: 15.79,
      avgPrice: 5300,
      minPrice: 5000,
      maxPrice: 5800,
      volatility: 'High',
      demand: 'Moderate',
      supply: 'Low'
    },
    'Sugarcane': {
      currentPrice: 3500,
      weekChange: 6.06,
      monthChange: 9.38,
      yearChange: 16.67,
      avgPrice: 3300,
      minPrice: 3000,
      maxPrice: 3600,
      volatility: 'Low',
      demand: 'High',
      supply: 'Moderate'
    },
    'Maize': {
      currentPrice: 1800,
      weekChange: -5.26,
      monthChange: -3.23,
      yearChange: 5.88,
      avgPrice: 1850,
      minPrice: 1700,
      maxPrice: 1950,
      volatility: 'High',
      demand: 'Moderate',
      supply: 'High'
    },
    'Soybean': {
      currentPrice: 4200,
      weekChange: 2.44,
      monthChange: 5.00,
      yearChange: 10.53,
      avgPrice: 4000,
      minPrice: 3800,
      maxPrice: 4300,
      volatility: 'Moderate',
      demand: 'High',
      supply: 'Moderate'
    }
  };

  const addCrop = (crop) => {
    if (!selectedCrops.includes(crop) && selectedCrops.length < 4) {
      setSelectedCrops([...selectedCrops, crop]);
    }
  };

  const removeCrop = (crop) => {
    if (selectedCrops.length > 2) {
      setSelectedCrops(selectedCrops.filter(c => c !== crop));
    }
  };

  const getChangeClass = (value) => {
    if (value > 0) return 'positive';
    if (value < 0) return 'negative';
    return 'neutral';
  };

  const getVolatilityColor = (volatility) => {
    switch (volatility) {
      case 'Low': return '#2ecc71';
      case 'Moderate': return '#f39c12';
      case 'High': return '#e74c3c';
      default: return '#7f8c8d';
    }
  };

  return (
    <div className="crop-comparison-page">
      <div className="container">
        <div className="page-header">
          <h1>Compare Crop Prices</h1>
          <p>Compare market prices and trends of different crops side by side</p>
        </div>

        {/* Crop Selector */}
        <div className="crop-selector-section">
          <h3>Select Crops to Compare (Max 4)</h3>
          <div className="selected-crops">
            {selectedCrops.map(crop => (
              <div key={crop} className="selected-crop-tag">
                <span>{crop}</span>
                {selectedCrops.length > 2 && (
                  <button onClick={() => removeCrop(crop)}>
                    <FiX />
                  </button>
                )}
              </div>
            ))}
          </div>

          {selectedCrops.length < 4 && (
            <div className="available-crops">
              {availableCrops
                .filter(crop => !selectedCrops.includes(crop))
                .map(crop => (
                  <button
                    key={crop}
                    className="add-crop-btn"
                    onClick={() => addCrop(crop)}
                  >
                    <FiPlus /> {crop}
                  </button>
                ))}
            </div>
          )}
        </div>

        {/* Comparison Table */}
        <div className="comparison-table-container">
          <table className="comparison-table">
            <thead>
              <tr>
                <th>Metric</th>
                {selectedCrops.map(crop => (
                  <th key={crop}>{crop}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="metric-label">Current Price (₹/quintal)</td>
                {selectedCrops.map(crop => (
                  <td key={crop} className="price-cell">
                    ₹{cropData[crop]?.currentPrice || 'N/A'}
                  </td>
                ))}
              </tr>

              <tr>
                <td className="metric-label">Week Change (%)</td>
                {selectedCrops.map(crop => (
                  <td key={crop} className={getChangeClass(cropData[crop]?.weekChange)}>
                    {cropData[crop]?.weekChange > 0 ? '+' : ''}
                    {cropData[crop]?.weekChange.toFixed(2)}%
                  </td>
                ))}
              </tr>

              <tr>
                <td className="metric-label">Month Change (%)</td>
                {selectedCrops.map(crop => (
                  <td key={crop} className={getChangeClass(cropData[crop]?.monthChange)}>
                    {cropData[crop]?.monthChange > 0 ? '+' : ''}
                    {cropData[crop]?.monthChange.toFixed(2)}%
                  </td>
                ))}
              </tr>

              <tr>
                <td className="metric-label">Year Change (%)</td>
                {selectedCrops.map(crop => (
                  <td key={crop} className={getChangeClass(cropData[crop]?.yearChange)}>
                    {cropData[crop]?.yearChange > 0 ? '+' : ''}
                    {cropData[crop]?.yearChange.toFixed(2)}%
                  </td>
                ))}
              </tr>

              <tr>
                <td className="metric-label">Average Price (₹)</td>
                {selectedCrops.map(crop => (
                  <td key={crop}>₹{cropData[crop]?.avgPrice || 'N/A'}</td>
                ))}
              </tr>

              <tr>
                <td className="metric-label">Min Price (₹)</td>
                {selectedCrops.map(crop => (
                  <td key={crop}>₹{cropData[crop]?.minPrice || 'N/A'}</td>
                ))}
              </tr>

              <tr>
                <td className="metric-label">Max Price (₹)</td>
                {selectedCrops.map(crop => (
                  <td key={crop}>₹{cropData[crop]?.maxPrice || 'N/A'}</td>
                ))}
              </tr>

              <tr>
                <td className="metric-label">Volatility</td>
                {selectedCrops.map(crop => (
                  <td key={crop}>
                    <span 
                      className="volatility-badge"
                      style={{ background: getVolatilityColor(cropData[crop]?.volatility) }}
                    >
                      {cropData[crop]?.volatility || 'N/A'}
                    </span>
                  </td>
                ))}
              </tr>

              <tr>
                <td className="metric-label">Market Demand</td>
                {selectedCrops.map(crop => (
                  <td key={crop}>{cropData[crop]?.demand || 'N/A'}</td>
                ))}
              </tr>

              <tr>
                <td className="metric-label">Market Supply</td>
                {selectedCrops.map(crop => (
                  <td key={crop}>{cropData[crop]?.supply || 'N/A'}</td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>

        {/* Insights */}
        <div className="comparison-insights">
          <h3>Market Insights</h3>
          <div className="insights-grid">
            <div className="insight-card">
              <h4>Best Performer (1 Week)</h4>
              <p className="insight-value">
                {selectedCrops.reduce((best, crop) => 
                  cropData[crop]?.weekChange > cropData[best]?.weekChange ? crop : best
                )}
              </p>
            </div>
            <div className="insight-card">
              <h4>Best Performer (1 Year)</h4>
              <p className="insight-value">
                {selectedCrops.reduce((best, crop) => 
                  cropData[crop]?.yearChange > cropData[best]?.yearChange ? crop : best
                )}
              </p>
            </div>
            <div className="insight-card">
              <h4>Highest Current Price</h4>
              <p className="insight-value">
                {selectedCrops.reduce((highest, crop) => 
                  cropData[crop]?.currentPrice > cropData[highest]?.currentPrice ? crop : highest
                )}
              </p>
            </div>
            <div className="insight-card">
              <h4>Most Stable (Low Volatility)</h4>
              <p className="insight-value">
                {selectedCrops.find(crop => cropData[crop]?.volatility === 'Low') || 'None'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CropComparison;
