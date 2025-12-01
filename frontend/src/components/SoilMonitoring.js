import React, { useState } from 'react';
import soilMonitoringService from '../services/soilMonitoringService';
import './SoilMonitoring.css';

const SoilMonitoring = () => {
  const [activeTab, setActiveTab] = useState('analysis');
  const [loading, setLoading] = useState(false);
  const [soilData, setSoilData] = useState(null);
  const [moistureData, setMoistureData] = useState(null);
  const [temperatureData, setTemperatureData] = useState(null);
  const [analysisData, setAnalysisData] = useState(null);
  const [sensorsData, setSensorsData] = useState(null);

  // Location parameters
  const [locationParams, setLocationParams] = useState({
    lat: '',
    lon: '',
    depth: 30,
    farmId: '',
  });

  // Date range for moisture
  const [dateRange, setDateRange] = useState({
    start: '',
    end: '',
  });

  const handleLocationSubmit = async (type) => {
    if (!locationParams.lat || !locationParams.lon) {
      alert('Please enter latitude and longitude');
      return;
    }

    setLoading(true);

    try {
      let result;

      switch (type) {
        case 'data':
          result = await soilMonitoringService.getSoilData(
            locationParams.lat,
            locationParams.lon,
            locationParams.depth
          );
          if (result.success) setSoilData(result.data);
          break;

        case 'moisture':
          result = await soilMonitoringService.getSoilMoisture(
            locationParams.lat,
            locationParams.lon,
            dateRange.start,
            dateRange.end
          );
          if (result.success) setMoistureData(result.data);
          break;

        case 'temperature':
          result = await soilMonitoringService.getSoilTemperature(
            locationParams.lat,
            locationParams.lon,
            locationParams.depth
          );
          if (result.success) setTemperatureData(result.data);
          break;

        case 'analysis':
          result = await soilMonitoringService.getSoilAnalysis(
            locationParams.lat,
            locationParams.lon
          );
          if (result.success) setAnalysisData(result.data);
          break;

        case 'sensors':
          result = await soilMonitoringService.getSoilSensors(locationParams.farmId);
          if (result.success) setSensorsData(result.data);
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
    <div className="soil-monitoring-container">
      <div className="soil-header">
        <h1>🌱 Soil Monitoring Dashboard</h1>
        <p>Real-time soil data and sensor monitoring for precision agriculture</p>
      </div>

      <div className="soil-tabs">
        <button
          className={`tab ${activeTab === 'analysis' ? 'active' : ''}`}
          onClick={() => setActiveTab('analysis')}
        >
          📊 Soil Analysis
        </button>
        <button
          className={`tab ${activeTab === 'sensors' ? 'active' : ''}`}
          onClick={() => setActiveTab('sensors')}
        >
          📡 IoT Sensors
        </button>
        <button
          className={`tab ${activeTab === 'data' ? 'active' : ''}`}
          onClick={() => setActiveTab('data')}
        >
          📈 Raw Data
        </button>
      </div>

      <div className="soil-content">
        {/* Location Input Form */}
        <div className="location-form">
          <h3>📍 Location Settings</h3>
          <div className="form-row">
            <div className="form-group">
              <label>Latitude</label>
              <input
                type="number"
                step="0.000001"
                value={locationParams.lat}
                onChange={(e) => setLocationParams({...locationParams, lat: e.target.value})}
                placeholder="e.g., 28.6139"
              />
            </div>
            <div className="form-group">
              <label>Longitude</label>
              <input
                type="number"
                step="0.000001"
                value={locationParams.lon}
                onChange={(e) => setLocationParams({...locationParams, lon: e.target.value})}
                placeholder="e.g., 77.2090"
              />
            </div>
            <div className="form-group">
              <label>Depth (cm)</label>
              <input
                type="number"
                value={locationParams.depth}
                onChange={(e) => setLocationParams({...locationParams, depth: e.target.value})}
                placeholder="30"
                min="1"
                max="100"
              />
            </div>
            <div className="form-group">
              <label>Farm ID</label>
              <input
                type="text"
                value={locationParams.farmId}
                onChange={(e) => setLocationParams({...locationParams, farmId: e.target.value})}
                placeholder="Enter farm ID"
              />
            </div>
          </div>

          {activeTab === 'data' && (
            <div className="date-range">
              <h4>📅 Date Range for Moisture Data</h4>
              <div className="form-row">
                <div className="form-group">
                  <label>Start Date</label>
                  <input
                    type="date"
                    value={dateRange.start}
                    onChange={(e) => setDateRange({...dateRange, start: e.target.value})}
                  />
                </div>
                <div className="form-group">
                  <label>End Date</label>
                  <input
                    type="date"
                    value={dateRange.end}
                    onChange={(e) => setDateRange({...dateRange, end: e.target.value})}
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {activeTab === 'analysis' && (
          <div className="analysis-section">
            <h2>Comprehensive Soil Analysis</h2>
            <div className="analysis-buttons">
              <button onClick={() => handleLocationSubmit('data')} disabled={loading} className="analysis-btn">
                🌱 Basic Soil Data
              </button>
              <button onClick={() => handleLocationSubmit('moisture')} disabled={loading} className="analysis-btn">
                💧 Moisture Levels
              </button>
              <button onClick={() => handleLocationSubmit('temperature')} disabled={loading} className="analysis-btn">
                🌡️ Temperature
              </button>
              <button onClick={() => handleLocationSubmit('analysis')} disabled={loading} className="analysis-btn primary">
                📊 Full Analysis
              </button>
            </div>

            {analysisData && (
              <div className="analysis-results">
                <h3>Soil Analysis Report</h3>

                <div className="soil-metrics">
                  <div className="metric-card">
                    <h4>pH Level</h4>
                    <div className="metric-value">{analysisData.soil?.ph || '6.8'}</div>
                    <div className="metric-status">
                      {parseFloat(analysisData.soil?.ph) < 6 ? 'Acidic' :
                       parseFloat(analysisData.soil?.ph) > 8 ? 'Alkaline' : 'Optimal'}
                    </div>
                  </div>

                  <div className="metric-card">
                    <h4>Moisture (%)</h4>
                    <div className="metric-value">{analysisData.soil?.moisture || '45'}</div>
                    <div className="metric-status">
                      {parseFloat(analysisData.soil?.moisture) < 30 ? 'Low' :
                       parseFloat(analysisData.soil?.moisture) > 70 ? 'High' : 'Optimal'}
                    </div>
                  </div>

                  <div className="metric-card">
                    <h4>Temperature (°C)</h4>
                    <div className="metric-value">{analysisData.temperature?.temperature || '24'}</div>
                    <div className="metric-status">
                      {parseFloat(analysisData.temperature?.temperature) < 15 ? 'Cool' :
                       parseFloat(analysisData.temperature?.temperature) > 30 ? 'Hot' : 'Optimal'}
                    </div>
                  </div>

                  <div className="metric-card">
                    <h4>Soil Type</h4>
                    <div className="metric-value">{analysisData.soil?.type || 'Loamy'}</div>
                    <div className="metric-status">Suitable</div>
                  </div>
                </div>

                <div className="recommendations">
                  <h4>💡 Recommendations</h4>
                  <div className="recommendation-list">
                    {analysisData.recommendations?.irrigation && (
                      <div className="recommendation-item">
                        <span className="rec-icon">💧</span>
                        <span>{analysisData.recommendations.irrigation}</span>
                      </div>
                    )}
                    {analysisData.recommendations?.fertilization && (
                      <div className="recommendation-item">
                        <span className="rec-icon">🌾</span>
                        <span>{analysisData.recommendations.fertilization}</span>
                      </div>
                    )}
                    {analysisData.recommendations?.cropSelection && (
                      <div className="recommendation-item">
                        <span className="rec-icon">🌱</span>
                        <span>{analysisData.recommendations.cropSelection}</span>
                      </div>
                    )}
                    {analysisData.recommendations?.soilManagement && (
                      <div className="recommendation-item">
                        <span className="rec-icon">🧪</span>
                        <span>{analysisData.recommendations.soilManagement}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'sensors' && (
          <div className="sensors-section">
            <h2>IoT Soil Sensors</h2>
            <button onClick={() => handleLocationSubmit('sensors')} disabled={loading} className="sensor-btn">
              {loading ? '🔄 Loading Sensors...' : '📡 Get Sensor Data'}
            </button>

            {sensorsData && (
              <div className="sensors-results">
                <h3>Sensor Network Status</h3>

                <div className="farm-overview">
                  <div className="overview-card">
                    <h4>Total Sensors</h4>
                    <div className="overview-value">{sensorsData.sensors?.length || 0}</div>
                  </div>
                  <div className="overview-card">
                    <h4>Active Sensors</h4>
                    <div className="overview-value">
                      {sensorsData.sensors?.filter(s => s.status === 'active').length || 0}
                    </div>
                  </div>
                  <div className="overview-card">
                    <h4>Avg Moisture</h4>
                    <div className="overview-value">{sensorsData.averageConditions?.moisture || '0'}%</div>
                  </div>
                  <div className="overview-card">
                    <h4>Soil Health</h4>
                    <div className="overview-value">{sensorsData.averageConditions?.fertility || 'Unknown'}</div>
                  </div>
                </div>

                <div className="sensors-list">
                  <h4>Individual Sensor Readings</h4>
                  {sensorsData.sensors?.map((sensor, index) => (
                    <div key={index} className="sensor-card">
                      <div className="sensor-header">
                        <h5>Sensor {sensor.id}</h5>
                        <span className={`status ${sensor.status}`}>
                          {sensor.status === 'active' ? '🟢 Active' : '🔴 Inactive'}
                        </span>
                      </div>

                      <div className="sensor-readings">
                        <div className="reading">
                          <span className="label">Moisture:</span>
                          <span className="value">{sensor.readings.moisture}%</span>
                        </div>
                        <div className="reading">
                          <span className="label">Temperature:</span>
                          <span className="value">{sensor.readings.temperature}°C</span>
                        </div>
                        <div className="reading">
                          <span className="label">pH:</span>
                          <span className="value">{sensor.readings.ph}</span>
                        </div>
                        <div className="reading">
                          <span className="label">NPK:</span>
                          <span className="value">{sensor.readings.nitrogen}-{sensor.readings.phosphorus}-{sensor.readings.potassium}</span>
                        </div>
                      </div>

                      <div className="sensor-location">
                        📍 Lat: {sensor.location.lat.toFixed(4)}, Lon: {sensor.location.lon.toFixed(4)}
                      </div>

                      <div className="last-update">
                        🕐 Last updated: {new Date(sensor.lastUpdated).toLocaleString()}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'data' && (
          <div className="data-section">
            <h2>Raw Soil Data</h2>
            <div className="data-buttons">
              <button onClick={() => handleLocationSubmit('data')} disabled={loading} className="data-btn">
                🌱 Get Soil Data
              </button>
              <button onClick={() => handleLocationSubmit('moisture')} disabled={loading} className="data-btn">
                💧 Get Moisture History
              </button>
              <button onClick={() => handleLocationSubmit('temperature')} disabled={loading} className="data-btn">
                🌡️ Get Temperature
              </button>
            </div>

            {soilData && (
              <div className="data-results">
                <h3>Soil Composition Data</h3>
                <pre>{JSON.stringify(soilData, null, 2)}</pre>
              </div>
            )}

            {moistureData && (
              <div className="data-results">
                <h3>Moisture History</h3>
                <pre>{JSON.stringify(moistureData, null, 2)}</pre>
              </div>
            )}

            {temperatureData && (
              <div className="data-results">
                <h3>Temperature Data</h3>
                <pre>{JSON.stringify(temperatureData, null, 2)}</pre>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default SoilMonitoring;