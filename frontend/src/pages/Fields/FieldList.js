import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiPlus, FiEye, FiEdit, FiTrash2, FiMapPin } from 'react-icons/fi';
import { useApp } from '../../context/AppContext';
import Loader from '../../components/common/Loader';
import './FieldList.css';

const FieldList = () => {
  const navigate = useNavigate();
  const { showNotification } = useApp();
  const [fields, setFields] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedFarm, setSelectedFarm] = useState('all');

  useEffect(() => {
    fetchFields();
  }, []);

  const fetchFields = async () => {
    setLoading(true);
    // Mock data
    setTimeout(() => {
      setFields([
        {
          id: 1,
          name: 'Field A - North',
          farmName: 'Green Valley Farm',
          farmId: 1,
          area: 4,
          soilType: 'Red Soil',
          currentCrop: 'Rice',
          cropStage: 'Vegetative',
          plantingDate: '2025-06-15',
          expectedHarvest: '2025-10-20',
          health: 'Good',
          lastActivity: '2025-10-18'
        },
        {
          id: 2,
          name: 'Field B - South',
          farmName: 'Green Valley Farm',
          farmId: 1,
          area: 3,
          soilType: 'Red Soil',
          currentCrop: 'Wheat',
          cropStage: 'Flowering',
          plantingDate: '2025-11-01',
          expectedHarvest: '2026-03-15',
          health: 'Excellent',
          lastActivity: '2025-10-17'
        },
        {
          id: 3,
          name: 'Field C - East',
          farmName: 'Green Valley Farm',
          farmId: 1,
          area: 3,
          soilType: 'Black Soil',
          currentCrop: 'Cotton',
          cropStage: 'Maturity',
          plantingDate: '2025-05-20',
          expectedHarvest: '2025-10-25',
          health: 'Fair',
          lastActivity: '2025-10-19'
        }
      ]);
      setLoading(false);
    }, 1000);
  };

  const handleDeleteField = async (id) => {
    if (window.confirm('Are you sure you want to delete this field?')) {
      setFields(fields.filter(field => field.id !== id));
      showNotification('Field deleted successfully', 'success');
    }
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

  const filteredFields = selectedFarm === 'all' 
    ? fields 
    : fields.filter(field => field.farmId.toString() === selectedFarm);

  if (loading) {
    return <Loader fullPage />;
  }

  return (
    <div className="field-list-page">
      <div className="container">
        <div className="page-header">
          <div>
            <h1>My Fields</h1>
            <p>Manage and monitor all your agricultural fields</p>
          </div>
          <Link to="/fields/add" className="btn btn-primary">
            <FiPlus /> Add Field
          </Link>
        </div>

        <div className="filter-section">
          <select value={selectedFarm} onChange={(e) => setSelectedFarm(e.target.value)}>
            <option value="all">All Farms</option>
            <option value="1">Green Valley Farm</option>
            <option value="2">Sunrise Farmland</option>
          </select>
        </div>

        {filteredFields.length > 0 ? (
          <div className="fields-grid">
            {filteredFields.map(field => (
              <div key={field.id} className="field-card">
                <div className="field-header">
                  <div>
                    <h3>{field.name}</h3>
                    <p className="farm-name">
                      <FiMapPin /> {field.farmName}
                    </p>
                  </div>
                  <div 
                    className="health-indicator"
                    style={{ background: getHealthColor(field.health) }}
                  >
                    {field.health}
                  </div>
                </div>

                <div className="field-details">
                  <div className="detail-row">
                    <span className="label">Area:</span>
                    <span className="value">{field.area} acres</span>
                  </div>
                  <div className="detail-row">
                    <span className="label">Soil Type:</span>
                    <span className="value">{field.soilType}</span>
                  </div>
                  <div className="detail-row">
                    <span className="label">Current Crop:</span>
                    <span className="value">{field.currentCrop}</span>
                  </div>
                  <div className="detail-row">
                    <span className="label">Crop Stage:</span>
                    <span className="value">{field.cropStage}</span>
                  </div>
                  <div className="detail-row">
                    <span className="label">Expected Harvest:</span>
                    <span className="value">
                      {new Date(field.expectedHarvest).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                <div className="field-actions">
                  <Link to={`/fields/${field.id}`} className="action-btn view">
                    <FiEye /> View
                  </Link>
                  <Link to={`/fields/edit/${field.id}`} className="action-btn edit">
                    <FiEdit /> Edit
                  </Link>
                  <button 
                    className="action-btn delete"
                    onClick={() => handleDeleteField(field.id)}
                  >
                    <FiTrash2 /> Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <FiMapPin className="empty-icon" />
            <h3>No fields found</h3>
            <p>Add fields to start tracking your crops</p>
            <Link to="/fields/add" className="btn btn-primary">
              <FiPlus /> Add Your First Field
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default FieldList;
