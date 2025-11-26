import React from 'react';
import './YieldPrediction.css';

const YieldPrediction = () => {
  const predictions = [
    {
      crop: 'Rice',
      field: 'Paddy Field 1',
      expectedYield: '7.2 tons/acre',
      confidence: 92,
      harvestDate: '2025-10-30'
    },
    {
      crop: 'Wheat',
      field: 'Field A',
      expectedYield: '5.8 tons/acre',
      confidence: 88,
      harvestDate: '2026-03-15'
    }
  ];

  return (
    <div className="yield-prediction-card">
      <div className="card-header">
        <h3>Yield Predictions</h3>
      </div>
      <div className="predictions-list">
        {predictions.map((pred, index) => (
          <div key={index} className="prediction-item">
            <div className="prediction-header">
              <h4>{pred.crop}</h4>
              <span className="confidence-badge">{pred.confidence}% confident</span>
            </div>
            <p className="field-name">{pred.field}</p>
            <div className="prediction-details">
              <div className="detail">
                <span className="label">Expected Yield:</span>
                <span className="value">{pred.expectedYield}</span>
              </div>
              <div className="detail">
                <span className="label">Harvest Date:</span>
                <span className="value">{new Date(pred.harvestDate).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default YieldPrediction;
