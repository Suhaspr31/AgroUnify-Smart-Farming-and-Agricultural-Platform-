import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import farmService from '../../services/farmService';
import { validateField } from '../../utils/validators';
import { SOIL_TYPES, IRRIGATION_TYPES } from '../../utils/constants';
import './AddFarm.css';

const AddFarm = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { showNotification } = useApp();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    area: '',
    soilType: '',
    irrigationType: '',
    coordinates: {
      lat: '',
      lng: ''
    },
    description: ''
  });
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name.startsWith('coordinates.')) {
      const coordField = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        coordinates: {
          ...prev.coordinates,
          [coordField]: value
        }
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Farm name is required';
    }

    if (!formData.location.trim()) {
      newErrors.location = 'Location is required';
    }

    const areaError = validateField('area', formData.area);
    if (areaError) newErrors.area = areaError;

    if (!formData.soilType) {
      newErrors.soilType = 'Please select soil type';
    }

    if (!formData.irrigationType) {
      newErrors.irrigationType = 'Please select irrigation type';
    }

    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const newErrors = validateForm();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    try {
      // Transform form data to match backend expectations
      const farmData = {
        name: formData.name,
        totalArea: parseFloat(formData.area),
        areaUnit: 'acre', // Default unit
        location: {
          address: formData.location,
          coordinates: formData.coordinates.lat && formData.coordinates.lng ? {
            latitude: parseFloat(formData.coordinates.lat),
            longitude: parseFloat(formData.coordinates.lng)
          } : undefined
        },
        soilType: formData.soilType,
        irrigationType: formData.irrigationType,
        description: formData.description || undefined
      };

      const result = await farmService.createFarm(farmData);
      if (result.success) {
        showNotification('Farm added successfully!', 'success');
        // Navigate back to farm list and trigger refresh
        navigate('/my-farms', { state: { refresh: true } });
      } else {
        showNotification(result.message, 'error');
      }
    } catch (error) {
      showNotification('Failed to add farm', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="add-farm-page">
      <div className="container">
        <div className="page-header">
          <h1>Add New Farm</h1>
          <p>Register a new farm to start managing your crops</p>
        </div>

        <form onSubmit={handleSubmit} className="farm-form">
          <div className="form-section">
            <h2>Basic Information</h2>
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="name">Farm Name *</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter farm name"
                  className={errors.name ? 'error' : ''}
                />
                {errors.name && <span className="error-text">{errors.name}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="area">Total Area (acres) *</label>
                <input
                  type="number"
                  id="area"
                  name="area"
                  value={formData.area}
                  onChange={handleChange}
                  placeholder="Enter area in acres"
                  step="0.1"
                  className={errors.area ? 'error' : ''}
                />
                {errors.area && <span className="error-text">{errors.area}</span>}
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="location">Location *</label>
              <input
                type="text"
                id="location"
                name="location"
                value={formData.location}
                onChange={handleChange}
                placeholder="Village, Taluk, District, State"
                className={errors.location ? 'error' : ''}
              />
              {errors.location && <span className="error-text">{errors.location}</span>}
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="soilType">Soil Type *</label>
                <select
                  id="soilType"
                  name="soilType"
                  value={formData.soilType}
                  onChange={handleChange}
                  className={errors.soilType ? 'error' : ''}
                >
                  <option value="">Select soil type</option>
                  {SOIL_TYPES.map(type => (
                    <option key={type} value={type.toLowerCase()}>{type}</option>
                  ))}
                </select>
                {errors.soilType && <span className="error-text">{errors.soilType}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="irrigationType">Irrigation Type *</label>
                <select
                  id="irrigationType"
                  name="irrigationType"
                  value={formData.irrigationType}
                  onChange={handleChange}
                  className={errors.irrigationType ? 'error' : ''}
                >
                  <option value="">Select irrigation type</option>
                  {IRRIGATION_TYPES.map(type => (
                    <option key={type} value={type.toLowerCase()}>{type}</option>
                  ))}
                </select>
                {errors.irrigationType && <span className="error-text">{errors.irrigationType}</span>}
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="description">Description</label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Add any additional details about your farm"
                rows="4"
              />
            </div>
          </div>


          <div className="form-section">
            <h2>Location Coordinates (Optional)</h2>
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="coordinates.lat">Latitude</label>
                <input
                  type="number"
                  id="coordinates.lat"
                  name="coordinates.lat"
                  value={formData.coordinates.lat}
                  onChange={handleChange}
                  placeholder="e.g., 12.9716"
                  step="0.000001"
                />
              </div>

              <div className="form-group">
                <label htmlFor="coordinates.lng">Longitude</label>
                <input
                  type="number"
                  id="coordinates.lng"
                  name="coordinates.lng"
                  value={formData.coordinates.lng}
                  onChange={handleChange}
                  placeholder="e.g., 77.5946"
                  step="0.000001"
                />
              </div>
            </div>
          </div>

          <div className="form-actions">
            <button 
              type="button" 
              className="btn btn-secondary"
              onClick={() => navigate('/my-farms')}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? 'Adding Farm...' : 'Add Farm'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddFarm;
