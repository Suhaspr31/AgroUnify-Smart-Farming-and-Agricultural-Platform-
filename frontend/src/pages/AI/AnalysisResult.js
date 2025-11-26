import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { FiArrowLeft, FiCheckCircle, FiAlertTriangle, FiDownload, FiShare2 } from 'react-icons/fi';
import { useApp } from '../../context/AppContext';
import Loader from '../../components/common/Loader';
import './AnalysisResult.css';

const AnalysisResult = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { showNotification } = useApp();
  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState(null);

  const { imageUrl, imageName } = location.state || {};

  useEffect(() => {
    if (!imageUrl) {
      navigate('/ai/upload');
      return;
    }

    // Simulate AI analysis
    analyzeImage();
  }, [imageUrl]);

  const analyzeImage = async () => {
    setLoading(true);
    
    // Simulate API processing time
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Mock AI analysis result
    setResult({
      disease: 'Bacterial Leaf Blight',
      scientificName: 'Xanthomonas oryzae pv. oryzae',
      confidence: 87.5,
      severity: 'Moderate',
      affectedCrop: 'Rice',
      description: 'Bacterial leaf blight is a serious disease of rice caused by Xanthomonas oryzae. It can cause significant yield loss if not managed properly.',
      symptoms: [
        'Water-soaked lesions on leaf tips and margins',
        'Yellow to white lesions along leaf veins',
        'Wilting of leaves in severe cases',
        'Bacterial ooze visible in morning hours'
      ],
      causes: [
        'High humidity and temperature (25-34°C)',
        'Presence of infected seeds or plant debris',
        'Favorable weather conditions during monsoon',
        'Poor water management practices'
      ],
      treatment: [
        {
          title: 'Immediate Actions',
          steps: [
            'Remove and destroy infected plant parts',
            'Avoid overhead irrigation to reduce leaf wetness',
            'Improve field drainage to prevent waterlogging'
          ]
        },
        {
          title: 'Chemical Control',
          steps: [
            'Spray copper-based bactericides (Copper oxychloride @ 2.5g/L)',
            'Apply Streptomycin sulfate + Tetracycline (2:1 ratio)',
            'Repeat application after 10-15 days if needed'
          ]
        },
        {
          title: 'Organic Solutions',
          steps: [
            'Use Pseudomonas fluorescens as bio-control agent',
            'Apply neem oil spray (3-5 ml/L of water)',
            'Utilize Trichoderma-based products'
          ]
        }
      ],
      preventive: [
        'Use resistant or tolerant varieties',
        'Treat seeds with streptomycin or bleaching powder',
        'Maintain balanced fertilization (avoid excess nitrogen)',
        'Practice proper water management',
        'Implement crop rotation with non-host crops',
        'Remove weeds and maintain field hygiene'
      ],
      estimatedLoss: '20-30% yield loss if untreated',
      spreadRisk: 'High during monsoon season',
      recommendations: [
        'Act immediately as the disease is in moderate stage',
        'Monitor neighboring plants for similar symptoms',
        'Consult with local agricultural extension officer',
        'Keep records of treatment applications'
      ]
    });

    setLoading(false);
  };

  const getSeverityColor = (severity) => {
    switch (severity?.toLowerCase()) {
      case 'low':
      case 'mild':
        return '#2ecc71';
      case 'moderate':
        return '#f39c12';
      case 'high':
      case 'severe':
        return '#e74c3c';
      default:
        return '#7f8c8d';
    }
  };

  const handleDownloadReport = () => {
    showNotification('Report download started', 'success');
    // Implement PDF download logic
  };

  const handleShareReport = () => {
    showNotification('Share functionality coming soon', 'info');
    // Implement share logic
  };

  if (loading) {
    return (
      <div className="analysis-result-page loading-state">
        <Loader />
        <p>Analyzing your image...</p>
        <small>This may take a few seconds</small>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="analysis-result-page error-state">
        <p>Failed to analyze image. Please try again.</p>
        <Link to="/ai/upload" className="btn btn-primary">
          Upload New Image
        </Link>
      </div>
    );
  }

  return (
    <div className="analysis-result-page">
      <div className="container">
        <Link to="/ai/upload" className="back-link">
          <FiArrowLeft /> Upload New Image
        </Link>

        <div className="result-header">
          <h1>Analysis Complete</h1>
          <div className="header-actions">
            <button className="btn btn-secondary" onClick={handleDownloadReport}>
              <FiDownload /> Download Report
            </button>
            <button className="btn btn-secondary" onClick={handleShareReport}>
              <FiShare2 /> Share
            </button>
          </div>
        </div>

        <div className="result-content">
          {/* Image and Basic Info */}
          <div className="result-section image-section">
            <div className="analyzed-image">
              <img src={imageUrl} alt="Analyzed crop" />
            </div>
            <div className="diagnosis-card">
              <div className="confidence-badge" style={{ background: getSeverityColor(result.severity) }}>
                {result.confidence}% Confidence
              </div>
              <h2>{result.disease}</h2>
              <p className="scientific-name">{result.scientificName}</p>
              <div className="diagnosis-meta">
                <div className="meta-item">
                  <span className="label">Crop:</span>
                  <span className="value">{result.affectedCrop}</span>
                </div>
                <div className="meta-item">
                  <span className="label">Severity:</span>
                  <span className="value" style={{ color: getSeverityColor(result.severity) }}>
                    {result.severity}
                  </span>
                </div>
                <div className="meta-item">
                  <span className="label">Estimated Loss:</span>
                  <span className="value">{result.estimatedLoss}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="result-section">
            <div className="section-icon">
              <FiAlertTriangle />
            </div>
            <h3>About This Disease</h3>
            <p className="description">{result.description}</p>
          </div>

          {/* Symptoms */}
          <div className="result-section">
            <h3>Symptoms</h3>
            <ul className="symptoms-list">
              {result.symptoms.map((symptom, index) => (
                <li key={index}>{symptom}</li>
              ))}
            </ul>
          </div>

          {/* Causes */}
          <div className="result-section">
            <h3>Causes & Contributing Factors</h3>
            <ul className="causes-list">
              {result.causes.map((cause, index) => (
                <li key={index}>{cause}</li>
              ))}
            </ul>
          </div>

          {/* Treatment */}
          <div className="result-section treatment-section">
            <div className="section-icon success">
              <FiCheckCircle />
            </div>
            <h3>Treatment Recommendations</h3>
            {result.treatment.map((treatment, index) => (
              <div key={index} className="treatment-category">
                <h4>{treatment.title}</h4>
                <ol>
                  {treatment.steps.map((step, stepIndex) => (
                    <li key={stepIndex}>{step}</li>
                  ))}
                </ol>
              </div>
            ))}
          </div>

          {/* Prevention */}
          <div className="result-section">
            <h3>Prevention Measures</h3>
            <ul className="prevention-list">
              {result.preventive.map((measure, index) => (
                <li key={index}>{measure}</li>
              ))}
            </ul>
          </div>

          {/* Recommendations */}
          <div className="result-section recommendations-section">
            <h3>Additional Recommendations</h3>
            <div className="recommendations-grid">
              {result.recommendations.map((rec, index) => (
                <div key={index} className="recommendation-card">
                  <div className="rec-number">{index + 1}</div>
                  <p>{rec}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="action-section">
            <Link to="/marketplace" className="btn btn-primary">
              Buy Treatment Products
            </Link>
            <Link to="/ai/upload" className="btn btn-secondary">
              Analyze Another Image
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalysisResult;
