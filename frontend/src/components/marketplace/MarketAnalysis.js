import React from 'react';
import { FiTrendingUp, FiTrendingDown, FiActivity } from 'react-icons/fi';
import './MarketAnalysis.css';

const MarketAnalysis = () => {
  const trends = [
    {
      crop: 'Rice',
      trend: 'up',
      change: 4.17,
      volume: 'High',
      forecast: 'Stable'
    },
    {
      crop: 'Wheat',
      trend: 'down',
      change: -2.44,
      volume: 'Moderate',
      forecast: 'Increasing'
    },
    {
      crop: 'Cotton',
      trend: 'neutral',
      change: 0,
      volume: 'Low',
      forecast: 'Volatile'
    }
  ];

  const getTrendIcon = (trend) => {
    switch (trend) {
      case 'up':
        return <FiTrendingUp className="trend-icon up" />;
      case 'down':
        return <FiTrendingDown className="trend-icon down" />;
      default:
        return <FiActivity className="trend-icon neutral" />;
    }
  };

  return (
    <div className="market-analysis">
      <h3>Market Analysis</h3>
      <div className="analysis-list">
        {trends.map((item, index) => (
          <div key={index} className="analysis-item">
            <div className="analysis-header">
              <h4>{item.crop}</h4>
              {getTrendIcon(item.trend)}
            </div>
            <div className="analysis-details">
              <div className="detail-row">
                <span>Change:</span>
                <span className={`change ${item.trend}`}>
                  {item.change > 0 ? '+' : ''}{item.change}%
                </span>
              </div>
              <div className="detail-row">
                <span>Volume:</span>
                <span>{item.volume}</span>
              </div>
              <div className="detail-row">
                <span>Forecast:</span>
                <span>{item.forecast}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MarketAnalysis;
