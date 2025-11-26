import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { FiArrowLeft, FiMapPin, FiCalendar, FiActivity, FiDroplet } from 'react-icons/fi';
import Loader from '../../components/common/Loader';
import './FieldDetail.css';

const FieldDetail = () => {
  const { id } = useParams();
  const [field, setField] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFieldDetails();
  }, [id]);

  const fetchFieldDetails = async () => {
    setLoading(true);
    // Mock data
    setTimeout(() => {
      setField({
        id: id,
        name: 'Field A - North',
        farmName: 'Green Valley Farm',
        area: 4,
        soilType: 'Red Soil',
        soilPH: 6.5,
        currentCrop: 'Rice',
        cropVariety: 'Basmati 1121',
        cropStage: 'Vegetative',
        plantingDate: '2025-06-15',
        expectedHarvest: '2025-10-20',
        health: 'Good',
        irrigationType: 'Drip',
        lastIrrigation: '2025-10-19',
        coordinates: { lat: 12.9716, lng: 77.5946 },
        activities: [
          {
            date: '2025-10-19',
            type: 'Irrigation',
            details: 'Drip irrigation for 2 hours',
            user: 'Farmer'
          },
          {
            date: '2025-10-15',
            type: 'Fertilizer',
            details: 'Applied NPK fertilizer - 50kg',
            user: 'Farmer'
          },
          {
            date: '2025-10-10',
            type: 'Pest Control',
            details: 'Bio pesticide spray applied',
            user: 'Farmer'
          }
        ],
        sensors: {
          soilMoisture: 65,
          temperature: 28,
          humidity: 72,
          rainfall: 15
        },
        predictions: {
          estimatedYield: '6.5 tons',
          harvestQuality: 'Premium',
          diseaseRisk: 'Low'
        }
      });
      setLoading(false);
    }, 1000);
  };

  const getHealthColor = (health) => {
    switch (health?.toLowerCase()) {
      case 'excellent':
        return '#2ecc71';
      case 'good':
        return '#3498db';
      case 'fair':
        return '#f39c12';
      case 'poor':
        return '#e74c3c';
      default:
        return '#7f8c8d';
    }
  };

  if (loading) {
    return <Loader fullPage />;
  }

  if (!field) {
    return (
      <div className="container">
        <p>Field not found</p>
      </div>
    );
  }

  return (
    <div className="field-detail-page">
      <div className="container">
        <Link to="/fields" className="back-link">
          <FiArrowLeft /> Back to Fields
        </Link>

        <div className="field-header">
          <div>
            <h1>{field.name}</h1>
            <p className="farm-name">
              <FiMapPin /> {field.farmName}
            </p>
          </div>
          <div 
            className="health-badge"
            style={{ background: getHealthColor(field.health) }}
          >
            {field.health}
          </div>
        </div>

        <div className="field-content">
          {/* Field Info */}
          <div className="info-section">
            <h2>Field Information</h2>
            <div className="info-grid">
              <div className="info-item">
                <span className="label">Area</span>
                <span className="value">{field.area} acres</span>
              </div>
              <div className="info-item">
                <span className="label">Soil Type</span>
                <span className="value">{field.soilType}</span>
              </div>
              <div className="info-item">
                <span className="label">Soil pH</span>
                <span className="value">{field.soilPH}</span>
              </div>
              <div className="info-item">
                <span className="label">Irrigation</span>
                <span className="value">{field.irrigationType}</span>
              </div>
            </div>
          </div>

          {/* Current Crop */}
          <div className="info-section">
            <h2>Current Crop</h2>
            <div className="info-grid">
              <div className="info-item">
                <span className="label">Crop</span>
                <span className="value">{field.currentCrop}</span>
              </div>
              <div className="info-item">
                <span className="label">Variety</span>
                <span className="value">{field.cropVariety}</span>
              </div>
              <div className="info-item">
                <span className="label">Stage</span>
                <span className="value">{field.cropStage}</span>
              </div>
              <div className="info-item">
                <span className="label">Planting Date</span>
                <span className="value">
                  {new Date(field.plantingDate).toLocaleDateString()}
                </span>
              </div>
              <div className="info-item">
                <span className="label">Expected Harvest</span>
                <span className="value">
                  {new Date(field.expectedHarvest).toLocaleDateString()}
                </span>
              </div>
              <div className="info-item">
                <span className="label">Days to Harvest</span>
                <span className="value">
                  {Math.ceil((new Date(field.expectedHarvest) - new Date()) / (1000 * 60 * 60 * 24))} days
                </span>
              </div>
            </div>
          </div>

          {/* Sensor Data */}
          <div className="info-section">
            <h2>Live Sensor Data</h2>
            <div className="sensors-grid">
              <div className="sensor-card">
                <FiDroplet className="sensor-icon" />
                <div>
                  <span className="sensor-label">Soil Moisture</span>
                  <span className="sensor-value">{field.sensors.soilMoisture}%</span>
                </div>
              </div>
              <div className="sensor-card">
                <FiActivity className="sensor-icon" />
                <div>
                  <span className="sensor-label">Temperature</span>
                  <span className="sensor-value">{field.sensors.temperature}°C</span>
                </div>
              </div>
              <div className="sensor-card">
                <FiDroplet className="sensor-icon" />
                <div>
                  <span className="sensor-label">Humidity</span>
                  <span className="sensor-value">{field.sensors.humidity}%</span>
                </div>
              </div>
              <div className="sensor-card">
                <FiDroplet className="sensor-icon" />
                <div>
                  <span className="sensor-label">Rainfall</span>
                  <span className="sensor-value">{field.sensors.rainfall}mm</span>
                </div>
              </div>
            </div>
          </div>

          {/* Predictions */}
          <div className="info-section predictions">
            <h2>Yield Predictions</h2>
            <div className="predictions-grid">
              <div className="prediction-item">
                <span className="prediction-label">Estimated Yield</span>
                <span className="prediction-value">{field.predictions.estimatedYield}</span>
              </div>
              <div className="prediction-item">
                <span className="prediction-label">Quality</span>
                <span className="prediction-value">{field.predictions.harvestQuality}</span>
              </div>
              <div className="prediction-item">
                <span className="prediction-label">Disease Risk</span>
                <span className="prediction-value risk-low">{field.predictions.diseaseRisk}</span>
              </div>
            </div>
          </div>

          {/* Activities */}
          <div className="info-section">
            <h2>Recent Activities</h2>
            <div className="activities-timeline">
              {field.activities.map((activity, index) => (
                <div key={index} className="activity-item">
                  <div className="activity-marker"></div>
                  <div className="activity-content">
                    <div className="activity-header">
                      <span className="activity-type">{activity.type}</span>
                      <span className="activity-date">
                        {new Date(activity.date).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="activity-details">{activity.details}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FieldDetail;
