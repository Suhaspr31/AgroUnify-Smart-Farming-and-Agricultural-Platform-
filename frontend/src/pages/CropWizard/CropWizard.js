import React, { useState } from 'react';
import apiClient from '../../services/apiClient';
import './CropWizard.css';

const CropWizard = () => {
  const [location, setLocation] = useState({ lat: '', lng: '' });
  const [manualSoilData, setManualSoilData] = useState({
    ph: '',
    nitrogen: '',
    phosphorus: '',
    potassium: ''
  });
  const [useManualSoil, setUseManualSoil] = useState(false);
  const [recommendation, setRecommendation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            lat: position.coords.latitude.toString(),
            lng: position.coords.longitude.toString()
          });
        },
        (error) => {
          setError('Unable to get your location. Please enter manually.');
        }
      );
    } else {
      setError('Geolocation is not supported by this browser.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setRecommendation(null);

    try {
      const payload = {
        location: {
          lat: parseFloat(location.lat),
          lng: parseFloat(location.lng)
        }
      };

      if (useManualSoil) {
        payload.manualSoilData = {
          ph: parseFloat(manualSoilData.ph),
          nitrogen: parseFloat(manualSoilData.nitrogen),
          phosphorus: parseFloat(manualSoilData.phosphorus),
          potassium: parseFloat(manualSoilData.potassium)
        };
      }

      const response = await apiClient.post('recommend/crop', payload);
      setRecommendation(response.data.data);
    } catch (err) {
      setError(err.message || 'Failed to get crop recommendation');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="crop-wizard">
      <div className="wizard-header">
        <h1>Crop Planning Wizard</h1>
        <p>Get personalized crop recommendations based on your location and soil conditions</p>
      </div>

      <form onSubmit={handleSubmit} className="wizard-form">
        <div className="form-section">
          <h3>Location Information</h3>
          <div className="location-inputs">
            <div className="input-group">
              <label htmlFor="lat">Latitude</label>
              <input
                type="number"
                id="lat"
                step="any"
                value={location.lat}
                onChange={(e) => setLocation({ ...location, lat: e.target.value })}
                placeholder="e.g., 28.6139"
                required
              />
            </div>
            <div className="input-group">
              <label htmlFor="lng">Longitude</label>
              <input
                type="number"
                id="lng"
                step="any"
                value={location.lng}
                onChange={(e) => setLocation({ ...location, lng: e.target.value })}
                placeholder="e.g., 77.2090"
                required
              />
            </div>
            <button type="button" onClick={getCurrentLocation} className="location-btn">
              Use Current Location
            </button>
          </div>
        </div>

        <div className="form-section">
          <h3>Soil Data</h3>
          <div className="soil-toggle">
            <label>
              <input
                type="checkbox"
                checked={useManualSoil}
                onChange={(e) => setUseManualSoil(e.target.checked)}
              />
              Use manual soil data (optional)
            </label>
          </div>

          {useManualSoil && (
            <div className="soil-inputs">
              <div className="input-group">
                <label htmlFor="ph">pH Level</label>
                <input
                  type="number"
                  id="ph"
                  step="0.1"
                  value={manualSoilData.ph}
                  onChange={(e) => setManualSoilData({ ...manualSoilData, ph: e.target.value })}
                  placeholder="e.g., 6.5"
                />
              </div>
              <div className="input-group">
                <label htmlFor="nitrogen">Nitrogen (N)</label>
                <input
                  type="number"
                  id="nitrogen"
                  value={manualSoilData.nitrogen}
                  onChange={(e) => setManualSoilData({ ...manualSoilData, nitrogen: e.target.value })}
                  placeholder="e.g., 80"
                />
              </div>
              <div className="input-group">
                <label htmlFor="phosphorus">Phosphorus (P)</label>
                <input
                  type="number"
                  id="phosphorus"
                  value={manualSoilData.phosphorus}
                  onChange={(e) => setManualSoilData({ ...manualSoilData, phosphorus: e.target.value })}
                  placeholder="e.g., 40"
                />
              </div>
              <div className="input-group">
                <label htmlFor="potassium">Potassium (K)</label>
                <input
                  type="number"
                  id="potassium"
                  value={manualSoilData.potassium}
                  onChange={(e) => setManualSoilData({ ...manualSoilData, potassium: e.target.value })}
                  placeholder="e.g., 35"
                />
              </div>
            </div>
          )}
        </div>

        <button type="submit" disabled={loading} className="submit-btn">
          {loading ? 'Getting Recommendation...' : 'Get Crop Recommendation'}
        </button>
      </form>

      {error && <div className="error-message">{error}</div>}

      {recommendation && (
        <div className="recommendation-result">
          <h3>Recommendation Result</h3>
          <div className="result-card">
            <p className="recommendation-text">
              Based on your location and soil conditions, we recommend planting:
            </p>
            <div className="recommended-crop">
              {recommendation.recommended_crop}
            </div>
            <div className="input-summary">
              <h4>Input Data Used:</h4>
              <ul>
                <li>Location: {recommendation.location?.lat}, {recommendation.location?.lng}</li>
                <li>Temperature: {recommendation.inputData?.temperature}°C</li>
                <li>Rainfall: {recommendation.inputData?.rainfall}mm</li>
                <li>pH: {recommendation.inputData?.ph}</li>
                <li>Nitrogen: {recommendation.inputData?.nitrogen}</li>
                <li>Phosphorus: {recommendation.inputData?.phosphorus}</li>
                <li>Potassium: {recommendation.inputData?.potassium}</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CropWizard;