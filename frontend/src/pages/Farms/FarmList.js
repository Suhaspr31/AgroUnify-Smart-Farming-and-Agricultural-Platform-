import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FiPlus, FiMapPin, FiEdit, FiTrash2 } from 'react-icons/fi';
import { useApp } from '../../context/AppContext';
import farmService from '../../services/farmService';
import Loader from '../../components/common/Loader';
import './FarmList.css';

const FarmList = () => {
  const { showNotification } = useApp();
  const location = useLocation();
  const [farms, setFarms] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFarms();
  }, []);

  // Check if we need to refresh from navigation state
  useEffect(() => {
    if (location.state?.refresh) {
      fetchFarms();
    }
  }, [location.state]);

  const fetchFarms = async () => {
    setLoading(true);
    const result = await farmService.getAllFarms();
    if (result.success && result.data) {
      // Handle paginated response from backend
      const farmsData = result.data.data || result.data.farms || result.data;
      if (Array.isArray(farmsData)) {
        // Transform backend data to match frontend expectations
        const transformedFarms = farmsData.map(farm => ({
          id: farm._id,
          name: farm.name,
          location: farm.location?.address || farm.location || 'Unknown location',
          area: `${farm.totalArea || farm.area || 0} ${farm.areaUnit || 'acres'}`,
          soilType: farm.soilType ? farm.soilType.charAt(0).toUpperCase() + farm.soilType.slice(1) : 'Unknown',
          irrigationType: farm.irrigationType ? farm.irrigationType.charAt(0).toUpperCase() + farm.irrigationType.slice(1) : 'Unknown',
          activeCrops: 0, // Will be calculated from fields later
          image: farm.images && farm.images.length > 0 ? farm.images[0] : '/assets/images/default-farm.jpg'
        }));
        setFarms(transformedFarms);
      } else {
        // If not an array, fall back to mock data
        setFarms([]);
      }
    } else {
      // Mock data as fallback
      setFarms([
        {
          id: 1,
          name: 'Green Valley Farm',
          location: 'Bangalore Rural, Karnataka',
          area: '10 acres',
          soilType: 'Red Soil',
          irrigationType: 'Drip',
          activeCrops: 3,
          image: '/assets/images/farm1.jpg'
        },
        {
          id: 2,
          name: 'Sunrise Farmland',
          location: 'Mandya, Karnataka',
          area: '15 acres',
          soilType: 'Black Soil',
          irrigationType: 'Sprinkler',
          activeCrops: 5,
          image: '/assets/images/farm2.jpg'
        },
        {
          id: 3,
          name: 'River View Farm',
          location: 'Mysore, Karnataka',
          area: '8 acres',
          soilType: 'Alluvial Soil',
          irrigationType: 'Flood',
          activeCrops: 2,
          image: '/assets/images/farm3.jpg'
        }
      ]);
    }
    setLoading(false);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this farm?')) {
      const result = await farmService.deleteFarm(id);
      if (result.success) {
        setFarms(farms.filter(farm => farm.id !== id));
        showNotification('Farm deleted successfully', 'success');
      } else {
        showNotification(result.message, 'error');
      }
    }
  };

  const refreshFarms = () => {
    fetchFarms();
  };

  if (loading) {
    return <Loader fullPage />;
  }

  return (
    <div className="farm-list-page">
      <div className="page-header">
        <div>
          <h1>My Farms</h1>
          <p>Manage your registered farms and fields</p>
        </div>
        <Link to="/farms/add" className="btn btn-primary">
          <FiPlus /> Add New Farm
        </Link>
      </div>

      {farms.length > 0 ? (
        <div className="farms-grid">
          {farms.map(farm => (
            <div key={farm.id} className="farm-card">
              <div className="farm-image">
                <img src={farm.image} alt={farm.name} />
                <div className="farm-actions">
                  <Link to={`/my-farms/${farm.id}`} className="action-btn">
                    View Details
                  </Link>
                  <button className="action-btn secondary">
                    <FiEdit /> Edit
                  </button>
                  <button 
                    className="action-btn danger"
                    onClick={() => handleDelete(farm.id)}
                  >
                    <FiTrash2 /> Delete
                  </button>
                </div>
              </div>
              
              <div className="farm-content">
                <h3>{farm.name}</h3>
                <div className="farm-location">
                  <FiMapPin />
                  <span>{farm.location}</span>
                </div>

                <div className="farm-details">
                  <div className="detail-item">
                    <span className="label">Area:</span>
                    <span className="value">{farm.area}</span>
                  </div>
                  <div className="detail-item">
                    <span className="label">Soil Type:</span>
                    <span className="value">{farm.soilType}</span>
                  </div>
                  <div className="detail-item">
                    <span className="label">Irrigation:</span>
                    <span className="value">{farm.irrigationType}</span>
                  </div>
                  <div className="detail-item">
                    <span className="label">Active Crops:</span>
                    <span className="value">{farm.activeCrops}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <p>You haven't added any farms yet. Get started by adding your first farm.</p>
          <Link to="/farms/add" className="btn btn-primary">
            <FiPlus /> Add Your First Farm
          </Link>
        </div>
      )}
    </div>
  );
};

export default FarmList;
