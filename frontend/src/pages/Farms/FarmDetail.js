import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { FiArrowLeft, FiMapPin, FiCalendar, FiTrendingUp } from 'react-icons/fi';
import farmService from '../../services/farmService';
import Loader from '../../components/common/Loader';
import './FarmDetail.css';

const FarmDetail = () => {
  const { id } = useParams();
  const [farm, setFarm] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchFarmDetails = useCallback(async () => {
    setLoading(true);
    const result = await farmService.getFarmById(id);
    if (result.success) {
      setFarm(result.data);
    } else {
      // Mock data
      setFarm({
        id: id,
        name: 'Green Valley Farm',
        location: 'Bangalore Rural, Karnataka',
        coordinates: { lat: 12.9716, lng: 77.5946 },
        area: '10 acres',
        soilType: 'Red Soil',
        irrigationType: 'Drip',
        registrationDate: '2023-01-15',
        ownerName: 'Rajesh Kumar',
        contactNumber: '+91 9876543210',
        image: '/assets/images/farm1.jpg',
        fields: [
          {
            id: 1,
            name: 'Field A',
            area: '4 acres',
            currentCrop: 'Rice',
            plantingDate: '2025-06-15',
            status: 'Growing'
          },
          {
            id: 2,
            name: 'Field B',
            area: '3 acres',
            currentCrop: 'Wheat',
            plantingDate: '2025-11-01',
            status: 'Planted'
          },
          {
            id: 3,
            name: 'Field C',
            area: '3 acres',
            currentCrop: 'Cotton',
            plantingDate: '2025-05-20',
            status: 'Growing'
          }
        ],
        analytics: {
          totalYield: '45 tons',
          avgYieldPerAcre: '4.5 tons',
          totalRevenue: '₹12,50,000',
          activeSeasons: 3
        },
        activities: [
          {
            date: '2025-10-15',
            activity: 'Fertilizer Application',
            field: 'Field A',
            details: 'NPK fertilizer applied'
          },
          {
            date: '2025-10-10',
            activity: 'Pest Control',
            field: 'Field C',
            details: 'Organic pesticide sprayed'
          },
          {
            date: '2025-10-05',
            activity: 'Irrigation',
            field: 'Field B',
            details: 'Drip irrigation system maintained'
          }
        ]
      });
    }
    setLoading(false);
  }, [id]);

  useEffect(() => {
    fetchFarmDetails();
  }, [fetchFarmDetails]);

  if (loading) {
    return <Loader fullPage />;
  }

  if (!farm) {
    return (
      <div className="container">
        <p>Farm not found</p>
      </div>
    );
  }

  return (
    <div className="farm-detail-page">
      <div className="container">
        <Link to="/my-farms" className="back-link">
          <FiArrowLeft /> Back to Farms
        </Link>

        <div className="farm-header">
          <div className="farm-header-image">
            <img src={farm.image} alt={farm.name} />
          </div>
          <div className="farm-header-info">
            <h1>{farm.name}</h1>
            <div className="farm-meta">
              <div className="meta-item">
                <FiMapPin />
                <span>{farm.location}</span>
              </div>
              <div className="meta-item">
                <FiCalendar />
                <span>Registered: {new Date(farm.registrationDate).toLocaleDateString()}</span>
              </div>
            </div>
            <div className="farm-quick-stats">
              <div className="quick-stat">
                <span className="stat-label">Total Area</span>
                <span className="stat-value">{farm.area}</span>
              </div>
              <div className="quick-stat">
                <span className="stat-label">Soil Type</span>
                <span className="stat-value">{farm.soilType}</span>
              </div>
              <div className="quick-stat">
                <span className="stat-label">Irrigation</span>
                <span className="stat-value">{farm.irrigationType}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Analytics Section */}
        <div className="analytics-section">
          <h2>Farm Analytics</h2>
          <div className="analytics-grid">
            <div className="analytics-card">
              <FiTrendingUp className="analytics-icon" />
              <div>
                <span className="analytics-label">Total Yield</span>
                <span className="analytics-value">{farm.analytics.totalYield}</span>
              </div>
            </div>
            <div className="analytics-card">
              <FiTrendingUp className="analytics-icon" />
              <div>
                <span className="analytics-label">Avg Yield/Acre</span>
                <span className="analytics-value">{farm.analytics.avgYieldPerAcre}</span>
              </div>
            </div>
            <div className="analytics-card">
              <FiTrendingUp className="analytics-icon" />
              <div>
                <span className="analytics-label">Total Revenue</span>
                <span className="analytics-value">{farm.analytics.totalRevenue}</span>
              </div>
            </div>
            <div className="analytics-card">
              <FiTrendingUp className="analytics-icon" />
              <div>
                <span className="analytics-label">Active Seasons</span>
                <span className="analytics-value">{farm.analytics.activeSeasons}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Fields Section */}
        <div className="fields-section">
          <div className="section-header">
            <h2>Fields</h2>
            <Link to="/fields/add" className="btn btn-secondary">Add Field</Link>
          </div>
          <div className="fields-grid">
            {farm.fields.map(field => (
              <div key={field.id} className="field-card">
                <div className="field-header">
                  <h3>{field.name}</h3>
                  <span className={`status-badge ${field.status.toLowerCase()}`}>
                    {field.status}
                  </span>
                </div>
                <div className="field-details">
                  <div className="field-detail-item">
                    <span className="label">Area:</span>
                    <span className="value">{field.area}</span>
                  </div>
                  <div className="field-detail-item">
                    <span className="label">Current Crop:</span>
                    <span className="value">{field.currentCrop}</span>
                  </div>
                  <div className="field-detail-item">
                    <span className="label">Planting Date:</span>
                    <span className="value">{new Date(field.plantingDate).toLocaleDateString()}</span>
                  </div>
                </div>
                <button className="btn btn-secondary btn-small">View Details</button>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activities */}
        <div className="activities-section">
          <h2>Recent Activities</h2>
          <div className="activities-list">
            {farm.activities.map((activity, index) => (
              <div key={index} className="activity-item">
                <div className="activity-date">
                  <FiCalendar />
                  <span>{new Date(activity.date).toLocaleDateString()}</span>
                </div>
                <div className="activity-content">
                  <h4>{activity.activity}</h4>
                  <p className="activity-field">{activity.field}</p>
                  <p className="activity-details">{activity.details}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FarmDetail;
