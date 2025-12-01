import React, { useState } from 'react';
import cropMonitoringService from '../services/cropMonitoringService';
import './CropMonitoring.css';

const CropMonitoring = () => {
  const [activeTab, setActiveTab] = useState('satellite');
  const [loading, setLoading] = useState(false);
  const [satelliteData, setSatelliteData] = useState(null);
  const [fieldData, setFieldData] = useState(null);
  const [healthData, setHealthData] = useState(null);

  // Satellite imagery parameters
  const [satelliteParams, setSatelliteParams] = useState({
    polygon: '',
    startDate: '',
    endDate: '',
    layer: 'NDVI',
  });

  // Field parameters
  const [fieldParams, setFieldParams] = useState({
    fieldId: '',
    farmId: '',
    date: '',
  });

  const handleSatelliteSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const polygon = JSON.parse(satelliteParams.polygon);
      const result = await cropMonitoringService.getSatelliteImagery(
        polygon,
        satelliteParams.startDate,
        satelliteParams.endDate,
        satelliteParams.layer
      );

      if (result.success) {
        setSatelliteData(result.data);
      } else {
        alert('Failed to fetch satellite imagery: ' + result.message);
      }
    } catch (error) {
      alert('Invalid polygon format. Please enter valid JSON coordinates.');
    }

    setLoading(false);
  };

  const handleFieldAnalysis = async (type) => {
    setLoading(true);

    try {
      let result;

      switch (type) {
        case 'health':
          result = await cropMonitoringService.getCropHealth(
            fieldParams.fieldId,
            fieldParams.date
          );
          if (result.success) setHealthData(result.data);
          break;

        case 'boundaries':
          result = await cropMonitoringService.getFieldBoundaries(fieldParams.farmId);
          if (result.success) setFieldData(result.data);
          break;

        case 'irrigation':
          result = await cropMonitoringService.getIrrigationRecommendations(fieldParams.fieldId);
          if (result.success) setFieldData(result.data);
          break;

        case 'pest':
          result = await cropMonitoringService.getPestDetection(
            fieldParams.fieldId,
            fieldParams.date
          );
          if (result.success) setFieldData(result.data);
          break;

        default:
          break;
      }

      if (!result.success) {
        alert(`Failed to fetch ${type} data: ` + result.message);
      }
    } catch (error) {
      alert('Error fetching data. Please try again.');
    }

    setLoading(false);
  };

  return (
    <div className="crop-monitoring-container">
      <div className="monitoring-header">
        <h1>🌾 Crop Monitoring Dashboard</h1>
        <p>Satellite imagery and field analysis for precision farming</p>
      </div>

      <div className="monitoring-tabs">
        <button
          className={`tab ${activeTab === 'satellite' ? 'active' : ''}`}
          onClick={() => setActiveTab('satellite')}
        >
          🛰️ Satellite Imagery
        </button>
        <button
          className={`tab ${activeTab === 'analysis' ? 'active' : ''}`}
          onClick={() => setActiveTab('analysis')}
        >
          📊 Field Analysis
        </button>
        <button
          className={`tab ${activeTab === 'health' ? 'active' : ''}`}
          onClick={() => setActiveTab('health')}
        >
          🌱 Crop Health
        </button>
      </div>

      <div className="monitoring-content">
        {activeTab === 'satellite' && (
          <div className="satellite-section">
            <h2>Satellite Imagery Analysis</h2>
            <form onSubmit={handleSatelliteSubmit} className="satellite-form">
              <div className="form-row">
                <div className="form-group">
                  <label>Field Polygon (GeoJSON)</label>
                  <textarea
                    value={satelliteParams.polygon}
                    onChange={(e) => setSatelliteParams({...satelliteParams, polygon: e.target.value})}
                    placeholder='[{"lat": 28.6139, "lng": 77.2090}, {"lat": 28.6140, "lng": 77.2091}, ...]'
                    rows="4"
                    required
                  />
                  <small>Enter field boundary coordinates as GeoJSON polygon</small>
                </div>
                <div className="form-group">
                  <label>Analysis Layer</label>
                  <select
                    value={satelliteParams.layer}
                    onChange={(e) => setSatelliteParams({...satelliteParams, layer: e.target.value})}
                  >
                    <option value="NDVI">NDVI (Vegetation Index)</option>
                    <option value="EVI">EVI (Enhanced Vegetation Index)</option>
                    <option value="SAVI">SAVI (Soil Adjusted Vegetation Index)</option>
                    <option value="RGB">RGB (Natural Color)</option>
                  </select>
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Start Date</label>
                  <input
                    type="date"
                    value={satelliteParams.startDate}
                    onChange={(e) => setSatelliteParams({...satelliteParams, startDate: e.target.value})}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>End Date</label>
                  <input
                    type="date"
                    value={satelliteParams.endDate}
                    onChange={(e) => setSatelliteParams({...satelliteParams, endDate: e.target.value})}
                    required
                  />
                </div>
              </div>
              <button type="submit" disabled={loading} className="analyze-btn">
                {loading ? '🔍 Analyzing...' : '🛰️ Get Satellite Imagery'}
              </button>
            </form>

            {satelliteData && (
              <div className="satellite-results">
                <h3>Analysis Results</h3>
                <div className="imagery-display">
                  <div className="imagery-info">
                    <p><strong>Layer:</strong> {satelliteData.layer}</p>
                    <p><strong>Date Range:</strong> {satelliteData.dateRange.startDate} to {satelliteData.dateRange.endDate}</p>
                    <p><strong>Status:</strong> Analysis Complete</p>
                  </div>
                  <div className="imagery-placeholder">
                    <div className="satellite-icon">🛰️</div>
                    <p>Satellite imagery would be displayed here</p>
                    <small>Integration with mapping service required</small>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'analysis' && (
          <div className="analysis-section">
            <h2>Field Analysis Tools</h2>
            <div className="analysis-form">
              <div className="form-row">
                <div className="form-group">
                  <label>Farm ID</label>
                  <input
                    type="text"
                    value={fieldParams.farmId}
                    onChange={(e) => setFieldParams({...fieldParams, farmId: e.target.value})}
                    placeholder="Enter farm ID"
                  />
                </div>
                <div className="form-group">
                  <label>Field ID</label>
                  <input
                    type="text"
                    value={fieldParams.fieldId}
                    onChange={(e) => setFieldParams({...fieldParams, fieldId: e.target.value})}
                    placeholder="Enter field ID"
                  />
                </div>
                <div className="form-group">
                  <label>Analysis Date</label>
                  <input
                    type="date"
                    value={fieldParams.date}
                    onChange={(e) => setFieldParams({...fieldParams, date: e.target.value})}
                  />
                </div>
              </div>

              <div className="analysis-buttons">
                <button onClick={() => handleFieldAnalysis('boundaries')} disabled={loading} className="analysis-btn">
                  🗺️ Field Boundaries
                </button>
                <button onClick={() => handleFieldAnalysis('irrigation')} disabled={loading} className="analysis-btn">
                  💧 Irrigation Needs
                </button>
                <button onClick={() => handleFieldAnalysis('pest')} disabled={loading} className="analysis-btn">
                  🐛 Pest Detection
                </button>
              </div>
            </div>

            {fieldData && (
              <div className="analysis-results">
                <h3>Analysis Results</h3>
                <div className="results-display">
                  <pre>{JSON.stringify(fieldData, null, 2)}</pre>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'health' && (
          <div className="health-section">
            <h2>Crop Health Monitoring</h2>
            <div className="health-form">
              <div className="form-row">
                <div className="form-group">
                  <label>Field ID</label>
                  <input
                    type="text"
                    value={fieldParams.fieldId}
                    onChange={(e) => setFieldParams({...fieldParams, fieldId: e.target.value})}
                    placeholder="Enter field ID for health analysis"
                  />
                </div>
                <div className="form-group">
                  <label>Analysis Date</label>
                  <input
                    type="date"
                    value={fieldParams.date}
                    onChange={(e) => setFieldParams({...fieldParams, date: e.target.value})}
                  />
                </div>
              </div>
              <button onClick={() => handleFieldAnalysis('health')} disabled={loading} className="health-btn">
                {loading ? '🔍 Analyzing...' : '🌱 Check Crop Health'}
              </button>
            </div>

            {healthData && (
              <div className="health-results">
                <h3>Crop Health Report</h3>
                <div className="health-metrics">
                  <div className="metric-card">
                    <h4>Overall Health</h4>
                    <div className="health-score">
                      {healthData.healthScore || '85%' }
                    </div>
                  </div>
                  <div className="metric-card">
                    <h4>Vegetation Index</h4>
                    <div className="vi-score">
                      {healthData.vegetationIndex || '0.72'}
                    </div>
                  </div>
                  <div className="metric-card">
                    <h4>Stress Level</h4>
                    <div className="stress-level">
                      {healthData.stressLevel || 'Low'}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default CropMonitoring;