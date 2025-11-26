import React, { useState } from 'react';
import { FiUpload } from 'react-icons/fi';
import { useApp } from '../../context/AppContext';
import './CropDiseaseDetector.css';

const CropDiseaseDetector = () => {
  const { showNotification } = useApp();
  const [selectedImage, setSelectedImage] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState(null);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result);
        setResult(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const analyzeImage = async () => {
    if (!selectedImage) {
      showNotification('Please upload an image first', 'error');
      return;
    }

    setAnalyzing(true);
    
    // Simulate AI analysis
    setTimeout(() => {
      setResult({
        disease: 'Bacterial Leaf Blight',
        confidence: 87,
        severity: 'Moderate',
        description: 'Bacterial leaf blight is a serious disease of rice caused by Xanthomonas oryzae. It can cause significant yield loss if not managed properly.',
        symptoms: [
          'Water-soaked lesions on leaf tips',
          'Yellow to white lesions along leaf veins',
          'Wilting of leaves in severe cases',
          'Bacterial ooze visible in morning'
        ],
        treatment: [
          'Use resistant varieties',
          'Apply copper-based bactericides',
          'Maintain proper water management',
          'Remove and destroy infected plants',
          'Use certified disease-free seeds'
        ],
        preventive: [
          'Avoid excessive nitrogen fertilization',
          'Maintain proper plant spacing',
          'Avoid overhead irrigation',
          'Crop rotation with non-host crops'
        ]
      });
      setAnalyzing(false);
      showNotification('Analysis complete!', 'success');
    }, 2000);
  };

  const getSeverityColor = (severity) => {
    switch (severity.toLowerCase()) {
      case 'low':
        return '#2ecc71';
      case 'moderate':
        return '#f39c12';
      case 'high':
        return '#e74c3c';
      default:
        return '#7f8c8d';
    }
  };

  return (
    <div className="disease-detector-page">
      <div className="container">
        <div className="page-header">
          <h1>Crop Disease Detector</h1>
          <p>Upload a photo of your crop to detect diseases using AI</p>
        </div>

        <div className="detector-container">
          <div className="upload-section">
            <div className="upload-area">
              {selectedImage ? (
                <div className="image-preview">
                  <img src={selectedImage} alt="Selected crop" />
                  <button 
                    className="change-image"
                    onClick={() => {
                      setSelectedImage(null);
                      setResult(null);
                    }}
                  >
                    Change Image
                  </button>
                </div>
              ) : (
                <label className="upload-label">
                  <FiUpload />
                  <span>Click to upload or drag and drop</span>
                  <small>Supported formats: JPG, PNG (Max 5MB)</small>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    hidden
                  />
                </label>
              )}
            </div>

            {selectedImage && (
              <button
                className="btn btn-primary btn-large"
                onClick={analyzeImage}
                disabled={analyzing}
              >
                {analyzing ? 'Analyzing...' : 'Analyze Image'}
              </button>
            )}
          </div>

          {result && (
            <div className="result-section">
              <div className="result-header">
                <h2>Detection Result</h2>
                <div className="confidence-badge">
                  Confidence: {result.confidence}%
                </div>
              </div>

              <div className="disease-info">
                <h3>{result.disease}</h3>
                <span 
                  className="severity-badge"
                  style={{ background: getSeverityColor(result.severity) }}
                >
                  Severity: {result.severity}
                </span>
                <p className="disease-description">{result.description}</p>
              </div>

              <div className="info-section">
                <h4>Symptoms</h4>
                <ul>
                  {result.symptoms.map((symptom, index) => (
                    <li key={index}>{symptom}</li>
                  ))}
                </ul>
              </div>

              <div className="info-section">
                <h4>Treatment Recommendations</h4>
                <ol>
                  {result.treatment.map((step, index) => (
                    <li key={index}>{step}</li>
                  ))}
                </ol>
              </div>

              <div className="info-section">
                <h4>Preventive Measures</h4>
                <ul>
                  {result.preventive.map((measure, index) => (
                    <li key={index}>{measure}</li>
                  ))}
                </ul>
              </div>

              <div className="action-buttons">
                <button className="btn btn-secondary">Save Report</button>
                <button className="btn btn-secondary">Contact Expert</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CropDiseaseDetector;
