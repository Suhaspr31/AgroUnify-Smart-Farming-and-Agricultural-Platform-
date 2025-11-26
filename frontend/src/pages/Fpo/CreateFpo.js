import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import './CreateFpo.css';

const CreateFpo = () => {
  const navigate = useNavigate();
  const { showNotification } = useApp();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    shortName: '',
    location: '',
    registration: '',
    established: '',
    crops: '',
    description: '',
    presidentName: '',
    presidentPhone: '',
    secretaryName: '',
    secretaryPhone: ''
  });
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) newErrors.name = 'FPO name is required';
    if (!formData.shortName.trim()) newErrors.shortName = 'Short name is required';
    if (!formData.location.trim()) newErrors.location = 'Location is required';
    if (!formData.established) newErrors.established = 'Establishment date is required';
    if (!formData.description.trim()) newErrors.description = 'Description is required';

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
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      showNotification('FPO created successfully!', 'success');
      navigate('/fpo');
    } catch (error) {
      showNotification('Failed to create FPO', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="create-fpo-page">
      <div className="container">
        <div className="page-header">
          <h1>Create FPO</h1>
          <p>Register a new Farmer Producer Organization</p>
        </div>

        <form onSubmit={handleSubmit} className="fpo-form">
          <div className="form-section">
            <h2>Basic Information</h2>
            
            <div className="form-row">
              <div className="form-group">
                <label>FPO Name *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className={errors.name ? 'error' : ''}
                  placeholder="Enter full FPO name"
                />
                {errors.name && <span className="error-text">{errors.name}</span>}
              </div>

              <div className="form-group">
                <label>Short Name *</label>
                <input
                  type="text"
                  name="shortName"
                  value={formData.shortName}
                  onChange={handleChange}
                  className={errors.shortName ? 'error' : ''}
                  placeholder="e.g., KFPO"
                />
                {errors.shortName && <span className="error-text">{errors.shortName}</span>}
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Location *</label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  className={errors.location ? 'error' : ''}
                  placeholder="City, State"
                />
                {errors.location && <span className="error-text">{errors.location}</span>}
              </div>

              <div className="form-group">
                <label>Established Date *</label>
                <input
                  type="date"
                  name="established"
                  value={formData.established}
                  onChange={handleChange}
                  className={errors.established ? 'error' : ''}
                />
                {errors.established && <span className="error-text">{errors.established}</span>}
              </div>
            </div>

            <div className="form-group">
              <label>Registration Number</label>
              <input
                type="text"
                name="registration"
                value={formData.registration}
                onChange={handleChange}
                placeholder="Official registration number"
              />
            </div>

            <div className="form-group">
              <label>Crops (comma separated)</label>
              <input
                type="text"
                name="crops"
                value={formData.crops}
                onChange={handleChange}
                placeholder="e.g., Rice, Wheat, Cotton"
              />
            </div>

            <div className="form-group">
              <label>Description *</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                className={errors.description ? 'error' : ''}
                rows="4"
                placeholder="Describe the FPO's mission and activities"
              />
              {errors.description && <span className="error-text">{errors.description}</span>}
            </div>
          </div>

          <div className="form-section">
            <h2>Leadership Information</h2>
            
            <div className="form-row">
              <div className="form-group">
                <label>President Name</label>
                <input
                  type="text"
                  name="presidentName"
                  value={formData.presidentName}
                  onChange={handleChange}
                  placeholder="Enter president's name"
                />
              </div>

              <div className="form-group">
                <label>President Phone</label>
                <input
                  type="tel"
                  name="presidentPhone"
                  value={formData.presidentPhone}
                  onChange={handleChange}
                  placeholder="+91 XXXXX XXXXX"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Secretary Name</label>
                <input
                  type="text"
                  name="secretaryName"
                  value={formData.secretaryName}
                  onChange={handleChange}
                  placeholder="Enter secretary's name"
                />
              </div>

              <div className="form-group">
                <label>Secretary Phone</label>
                <input
                  type="tel"
                  name="secretaryPhone"
                  value={formData.secretaryPhone}
                  onChange={handleChange}
                  placeholder="+91 XXXXX XXXXX"
                />
              </div>
            </div>
          </div>

          <div className="form-actions">
            <button 
              type="button" 
              className="btn btn-secondary"
              onClick={() => navigate('/fpo')}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? 'Creating FPO...' : 'Create FPO'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateFpo;
