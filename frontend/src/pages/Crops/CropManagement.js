import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiPlus, FiEdit, FiTrash2, FiEye } from 'react-icons/fi';
import { useApp } from '../../context/AppContext';
import Loader from '../../components/common/Loader';
import './CropManagement.css';

const CropManagement = () => {
  const { showNotification } = useApp();
  const [crops, setCrops] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMyCrops();
  }, []);

  const fetchMyCrops = async () => {
    setLoading(true);
    // Mock data for farmer's crops
    setCrops([
      {
        id: 1,
        name: 'Rice - Paddy Field 1',
        cropType: 'Rice',
        area: '5 acres',
        plantingDate: '2025-06-15',
        expectedHarvest: '2025-10-30',
        status: 'Growing',
        health: 'Good',
        stage: 'Tillering'
      },
      {
        id: 2,
        name: 'Wheat - Field A',
        cropType: 'Wheat',
        area: '3 acres',
        plantingDate: '2025-11-01',
        expectedHarvest: '2026-03-15',
        status: 'Planted',
        health: 'Excellent',
        stage: 'Germination'
      },
      {
        id: 3,
        name: 'Cotton - South Field',
        cropType: 'Cotton',
        area: '4 acres',
        plantingDate: '2025-05-20',
        expectedHarvest: '2025-11-10',
        status: 'Growing',
        health: 'Fair',
        stage: 'Flowering'
      }
    ]);
    setLoading(false);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this crop record?')) {
      setCrops(crops.filter(crop => crop.id !== id));
      showNotification('Crop record deleted successfully', 'success');
    }
  };

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'growing':
        return '#2ecc71';
      case 'planted':
        return '#3498db';
      case 'harvested':
        return '#95a5a6';
      default:
        return '#7f8c8d';
    }
  };

  const getHealthColor = (health) => {
    switch (health.toLowerCase()) {
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

  return (
    <div className="crop-management-page">
      <div className="page-header">
        <div>
          <h1>My Crops</h1>
          <p>Manage and monitor your crop cultivation</p>
        </div>
        <Link to="/crops/add" className="btn btn-primary">
          <FiPlus /> Add New Crop
        </Link>
      </div>

      {crops.length > 0 ? (
        <div className="crops-table-container">
          <table className="crops-table">
            <thead>
              <tr>
                <th>Crop Name</th>
                <th>Type</th>
                <th>Area</th>
                <th>Planting Date</th>
                <th>Expected Harvest</th>
                <th>Stage</th>
                <th>Status</th>
                <th>Health</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {crops.map(crop => (
                <tr key={crop.id}>
                  <td className="crop-name">{crop.name}</td>
                  <td>{crop.cropType}</td>
                  <td>{crop.area}</td>
                  <td>{new Date(crop.plantingDate).toLocaleDateString()}</td>
                  <td>{new Date(crop.expectedHarvest).toLocaleDateString()}</td>
                  <td>{crop.stage}</td>
                  <td>
                    <span 
                      className="status-badge" 
                      style={{ background: getStatusColor(crop.status) }}
                    >
                      {crop.status}
                    </span>
                  </td>
                  <td>
                    <span 
                      className="health-badge" 
                      style={{ background: getHealthColor(crop.health) }}
                    >
                      {crop.health}
                    </span>
                  </td>
                  <td className="actions">
                    <button className="action-btn view" title="View Details">
                      <FiEye />
                    </button>
                    <button className="action-btn edit" title="Edit">
                      <FiEdit />
                    </button>
                    <button 
                      className="action-btn delete" 
                      title="Delete"
                      onClick={() => handleDelete(crop.id)}
                    >
                      <FiTrash2 />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="empty-state">
          <p>No crops added yet. Start by adding your first crop.</p>
          <Link to="/crops/add" className="btn btn-primary">
            <FiPlus /> Add Your First Crop
          </Link>
        </div>
      )}
    </div>
  );
};

export default CropManagement;
