import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiPlus, FiEdit, FiTrash2, FiEye, FiMapPin, FiActivity, FiTrendingUp } from 'react-icons/fi';
import { useAuth } from '../../hooks/useAuth';
import { useApp } from '../../context/AppContext';
import farmService from '../../services/farmService';
import Loader from '../common/Loader';
import './FarmManagement.css';

const FarmManagement = () => {
  const { user } = useAuth();
  const { showNotification } = useApp();
  const navigate = useNavigate();

  const [farms, setFarms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortBy, setSortBy] = useState('name');

  useEffect(() => {
    fetchFarms();
  }, []);

  const fetchFarms = async () => {
    setLoading(true);
    try {
      const result = await farmService.getAllFarms();
      if (result.success) {
        setFarms(result.data);
      } else {
        // Mock data for demonstration
        setFarms([
          {
            id: 1,
            name: 'Green Valley Farm',
            location: 'Bangalore Rural, Karnataka',
            area: 10,
            soilType: 'Red Soil',
            irrigationType: 'Drip',
            activeCrops: 3,
            totalYield: 45,
            revenue: 450000,
            status: 'active',
            image: '/assets/images/farm1.jpg',
            lastActivity: '2025-10-20'
          },
          {
            id: 2,
            name: 'Sunrise Farmland',
            location: 'Mandya, Karnataka',
            area: 15,
            soilType: 'Black Soil',
            irrigationType: 'Sprinkler',
            activeCrops: 5,
            totalYield: 68,
            revenue: 680000,
            status: 'active',
            image: '/assets/images/farm2.jpg',
            lastActivity: '2025-10-19'
          },
          {
            id: 3,
            name: 'River View Farm',
            location: 'Mysore, Karnataka',
            area: 8,
            soilType: 'Alluvial Soil',
            irrigationType: 'Flood',
            activeCrops: 2,
            totalYield: 32,
            revenue: 320000,
            status: 'active',
            image: '/assets/images/farm3.jpg',
            lastActivity: '2025-10-18'
          },
          {
            id: 4,
            name: 'Highland Acres',
            location: 'Hassan, Karnataka',
            area: 12,
            soilType: 'Laterite Soil',
            irrigationType: 'Drip',
            activeCrops: 4,
            totalYield: 52,
            revenue: 520000,
            status: 'inactive',
            image: '/assets/images/farm4.jpg',
            lastActivity: '2025-09-15'
          }
        ]);
      }
    } catch (error) {
      showNotification('Failed to load farms', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteFarm = async (id) => {
    if (window.confirm('Are you sure you want to delete this farm? This action cannot be undone.')) {
      try {
        const result = await farmService.deleteFarm(id);
        if (result.success) {
          setFarms(farms.filter(farm => farm.id !== id));
          showNotification('Farm deleted successfully', 'success');
        } else {
          showNotification(result.message, 'error');
        }
      } catch (error) {
        showNotification('Failed to delete farm', 'error');
      }
    }
  };

  const handleViewDetails = (farmId) => {
    navigate(`/farms/${farmId}`);
  };

  const handleEditFarm = (farmId) => {
    navigate(`/farms/edit/${farmId}`);
  };

  // Filter and search logic
  const getFilteredFarms = () => {
    let filtered = [...farms];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(farm =>
        farm.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        farm.location.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (filterStatus !== 'all') {
      filtered = filtered.filter(farm => farm.status === filterStatus);
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'area':
          return b.area - a.area;
        case 'revenue':
          return b.revenue - a.revenue;
        case 'yield':
          return b.totalYield - a.totalYield;
        default:
          return 0;
      }
    });

    return filtered;
  };

  const filteredFarms = getFilteredFarms();

  // Calculate summary statistics
  const totalFarms = farms.length;
  const activeFarms = farms.filter(f => f.status === 'active').length;
  const totalArea = farms.reduce((sum, farm) => sum + farm.area, 0);
  const totalRevenue = farms.reduce((sum, farm) => sum + farm.revenue, 0);

  if (loading) {
    return <Loader fullPage />;
  }

  return (
    <div className="farm-management">
      {/* Header */}
      <div className="farm-management-header">
        <div className="header-content">
          <h1>Farm Management</h1>
          <p>Manage and monitor all your registered farms</p>
        </div>
        <Link to="/farms/add" className="btn btn-primary">
          <FiPlus /> Add New Farm
        </Link>
      </div>

      {/* Summary Statistics */}
      <div className="farm-stats-grid">
        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#2ecc71' }}>
            <FiMapPin />
          </div>
          <div className="stat-content">
            <h3>{totalFarms}</h3>
            <p>Total Farms</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#3498db' }}>
            <FiActivity />
          </div>
          <div className="stat-content">
            <h3>{activeFarms}</h3>
            <p>Active Farms</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#f39c12' }}>
            <FiMapPin />
          </div>
          <div className="stat-content">
            <h3>{totalArea} acres</h3>
            <p>Total Area</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#9b59b6' }}>
            <FiTrendingUp />
          </div>
          <div className="stat-content">
            <h3>₹{(totalRevenue / 100000).toFixed(1)}L</h3>
            <p>Total Revenue</p>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="farm-filters">
        <div className="search-box">
          <input
            type="text"
            placeholder="Search farms by name or location..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="filter-controls">
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>

          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
            <option value="name">Sort by Name</option>
            <option value="area">Sort by Area</option>
            <option value="revenue">Sort by Revenue</option>
            <option value="yield">Sort by Yield</option>
          </select>
        </div>
      </div>

      {/* Farms Grid */}
      {filteredFarms.length > 0 ? (
        <div className="farms-grid">
          {filteredFarms.map(farm => (
            <div key={farm.id} className="farm-card">
              <div className="farm-image">
                <img src={farm.image} alt={farm.name} />
                <span className={`status-badge ${farm.status}`}>
                  {farm.status}
                </span>
              </div>

              <div className="farm-content">
                <h3>{farm.name}</h3>
                <div className="farm-location">
                  <FiMapPin />
                  <span>{farm.location}</span>
                </div>

                <div className="farm-details-grid">
                  <div className="detail-item">
                    <span className="detail-label">Area</span>
                    <span className="detail-value">{farm.area} acres</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Soil Type</span>
                    <span className="detail-value">{farm.soilType}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Active Crops</span>
                    <span className="detail-value">{farm.activeCrops}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Revenue</span>
                    <span className="detail-value">₹{(farm.revenue / 1000).toFixed(0)}k</span>
                  </div>
                </div>

                <div className="farm-actions">
                  <button
                    className="action-btn view"
                    onClick={() => handleViewDetails(farm.id)}
                    title="View Details"
                  >
                    <FiEye /> View
                  </button>
                  <button
                    className="action-btn edit"
                    onClick={() => handleEditFarm(farm.id)}
                    title="Edit Farm"
                  >
                    <FiEdit /> Edit
                  </button>
                  <button
                    className="action-btn delete"
                    onClick={() => handleDeleteFarm(farm.id)}
                    title="Delete Farm"
                  >
                    <FiTrash2 /> Delete
                  </button>
                </div>

                <div className="farm-footer">
                  <span className="last-activity">
                    Last activity: {new Date(farm.lastActivity).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <div className="empty-icon">
            <FiMapPin />
          </div>
          <h3>No farms found</h3>
          <p>
            {searchTerm || filterStatus !== 'all'
              ? 'Try adjusting your filters'
              : 'Get started by adding your first farm'}
          </p>
          {!searchTerm && filterStatus === 'all' && (
            <Link to="/farms/add" className="btn btn-primary">
              <FiPlus /> Add Your First Farm
            </Link>
          )}
        </div>
      )}
    </div>
  );
};

export default FarmManagement;
