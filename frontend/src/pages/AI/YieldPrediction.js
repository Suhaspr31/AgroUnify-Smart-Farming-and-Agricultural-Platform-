import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { FiTrendingUp, FiTarget, FiCalendar, FiBarChart2, FiDownload } from 'react-icons/fi';
import './YieldPrediction.css';

const YieldPrediction = () => {
  const { user } = useAuth();
  const [predictions, setPredictions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCrop, setSelectedCrop] = useState('');
  const [selectedField, setSelectedField] = useState('');
  const [predictionData, setPredictionData] = useState(null);

  // Mock data for demonstration
  const mockPredictions = [
    {
      id: 1,
      crop: 'Rice',
      field: 'Paddy Field 1',
      area: 2.5,
      currentYield: 6.8,
      predictedYield: 7.2,
      confidence: 92,
      harvestDate: '2025-10-30',
      factors: {
        soil_quality: 85,
        irrigation: 90,
        weather: 88,
        pest_management: 95,
        nutrient_levels: 82
      },
      recommendations: [
        'Increase nitrogen application by 10%',
        'Monitor for pest activity in next 2 weeks',
        'Consider harvesting 3 days early for optimal quality'
      ]
    },
    {
      id: 2,
      crop: 'Wheat',
      field: 'Field A',
      area: 3.0,
      currentYield: 5.2,
      predictedYield: 5.8,
      confidence: 88,
      harvestDate: '2026-03-15',
      factors: {
        soil_quality: 78,
        irrigation: 85,
        weather: 92,
        pest_management: 88,
        nutrient_levels: 75
      },
      recommendations: [
        'Improve soil drainage to prevent waterlogging',
        'Apply zinc micronutrients',
        'Monitor wheat rust disease'
      ]
    },
    {
      id: 3,
      crop: 'Cotton',
      field: 'Cotton Plot 1',
      area: 1.8,
      currentYield: 4.2,
      predictedYield: 4.8,
      confidence: 85,
      harvestDate: '2025-12-20',
      factors: {
        soil_quality: 82,
        irrigation: 88,
        weather: 85,
        pest_management: 90,
        nutrient_levels: 80
      },
      recommendations: [
        'Implement integrated pest management',
        'Optimize irrigation scheduling',
        'Test soil pH and adjust accordingly'
      ]
    }
  ];

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setPredictions(mockPredictions);
      setLoading(false);
    }, 1500);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handlePredict = async () => {
    if (!selectedCrop || !selectedField) return;

    setLoading(true);

    // Simulate AI prediction API call
    setTimeout(() => {
      const mockResult = {
        crop: selectedCrop,
        field: selectedField,
        predictedYield: Math.round((Math.random() * 3 + 5) * 100) / 100,
        confidence: Math.round(Math.random() * 20 + 80),
        factors: {
          soil_quality: Math.round(Math.random() * 20 + 75),
          irrigation: Math.round(Math.random() * 20 + 75),
          weather: Math.round(Math.random() * 20 + 75),
          pest_management: Math.round(Math.random() * 20 + 75),
          nutrient_levels: Math.round(Math.random() * 20 + 75)
        },
        recommendations: [
          'Optimize irrigation scheduling',
          'Monitor soil moisture levels',
          'Apply balanced fertilizers',
          'Implement pest monitoring program'
        ]
      };

      setPredictionData(mockResult);
      setLoading(false);
    }, 2000);
  };

  const exportReport = () => {
    const reportData = {
      farmer: user?.name,
      predictions: predictions,
      generatedAt: new Date().toISOString(),
      aiModel: 'AgroYield Predictor v2.1'
    };

    const blob = new Blob([JSON.stringify(reportData, null, 2)], {
      type: 'application/json'
    });

    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `yield-prediction-report-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (loading && predictions.length === 0) {
    return (
      <div className="yield-prediction-page">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading yield predictions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="yield-prediction-page">
      <div className="page-header">
        <div className="header-content">
          <h1><FiTrendingUp /> Yield Prediction</h1>
          <p>AI-powered crop yield forecasting and optimization recommendations</p>
        </div>
        <div className="header-actions">
          <button onClick={exportReport} className="btn btn-secondary">
            <FiDownload /> Export Report
          </button>
        </div>
      </div>

      {/* Prediction Form */}
      <div className="prediction-form-card">
        <h2>Get New Prediction</h2>
        <div className="form-grid">
          <div className="form-group">
            <label>Select Crop</label>
            <select
              value={selectedCrop}
              onChange={(e) => setSelectedCrop(e.target.value)}
              className="form-control"
            >
              <option value="">Choose a crop...</option>
              <option value="Rice">Rice</option>
              <option value="Wheat">Wheat</option>
              <option value="Cotton">Cotton</option>
              <option value="Maize">Maize</option>
              <option value="Sugarcane">Sugarcane</option>
              <option value="Soybean">Soybean</option>
            </select>
          </div>

          <div className="form-group">
            <label>Select Field</label>
            <select
              value={selectedField}
              onChange={(e) => setSelectedField(e.target.value)}
              className="form-control"
            >
              <option value="">Choose a field...</option>
              <option value="Paddy Field 1">Paddy Field 1</option>
              <option value="Field A">Field A</option>
              <option value="Cotton Plot 1">Cotton Plot 1</option>
              <option value="Main Field">Main Field</option>
            </select>
          </div>

          <div className="form-group">
            <button
              onClick={handlePredict}
              disabled={!selectedCrop || !selectedField || loading}
              className="btn btn-primary predict-btn"
            >
              {loading ? 'Analyzing...' : 'Predict Yield'}
            </button>
          </div>
        </div>
      </div>

      {/* New Prediction Result */}
      {predictionData && (
        <div className="prediction-result-card">
          <h2>Prediction Results</h2>
          <div className="result-header">
            <div className="result-main">
              <h3>{predictionData.crop} - {predictionData.field}</h3>
              <div className="yield-display">
                <div className="predicted-yield">
                  <FiTarget />
                  <span className="yield-value">{predictionData.predictedYield}</span>
                  <span className="yield-unit">tons/acre</span>
                </div>
                <div className="confidence-badge">
                  {predictionData.confidence}% confidence
                </div>
              </div>
            </div>
          </div>

          <div className="factors-grid">
            <h4>Contributing Factors</h4>
            {Object.entries(predictionData.factors).map(([factor, score]) => (
              <div key={factor} className="factor-item">
                <span className="factor-name">
                  {factor.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </span>
                <div className="factor-bar">
                  <div
                    className="factor-fill"
                    style={{ width: `${score}%` }}
                  ></div>
                </div>
                <span className="factor-score">{score}%</span>
              </div>
            ))}
          </div>

          <div className="recommendations-section">
            <h4>AI Recommendations</h4>
            <ul className="recommendations-list">
              {predictionData.recommendations.map((rec, index) => (
                <li key={index}>{rec}</li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Existing Predictions */}
      <div className="predictions-grid">
        <h2>Your Yield Predictions</h2>
        {predictions.map((pred) => (
          <div key={pred.id} className="prediction-card">
            <div className="prediction-header">
              <div className="crop-info">
                <h3>{pred.crop}</h3>
                <p>{pred.field} • {pred.area} acres</p>
              </div>
              <div className="yield-info">
                <div className="current-yield">
                  <span className="label">Current</span>
                  <span className="value">{pred.currentYield} t/acre</span>
                </div>
                <div className="predicted-yield">
                  <span className="label">Predicted</span>
                  <span className="value">{pred.predictedYield} t/acre</span>
                </div>
                <div className="confidence">
                  <FiBarChart2 />
                  <span>{pred.confidence}%</span>
                </div>
              </div>
            </div>

            <div className="prediction-details">
              <div className="factors-preview">
                {Object.entries(pred.factors).slice(0, 3).map(([factor, score]) => (
                  <div key={factor} className="factor-preview">
                    <span className="factor-label">
                      {factor.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </span>
                    <div className="factor-bar-small">
                      <div
                        className="factor-fill-small"
                        style={{ width: `${score}%` }}
                      ></div>
                    </div>
                    <span className="factor-score-small">{score}%</span>
                  </div>
                ))}
              </div>

              <div className="harvest-info">
                <FiCalendar />
                <span>Harvest: {new Date(pred.harvestDate).toLocaleDateString()}</span>
              </div>
            </div>

            <div className="recommendations-preview">
              <h4>Key Recommendations</h4>
              <ul>
                {pred.recommendations.slice(0, 2).map((rec, index) => (
                  <li key={index}>{rec}</li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default YieldPrediction;