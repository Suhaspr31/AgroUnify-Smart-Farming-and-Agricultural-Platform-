import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import './ClaimForm.css';

const ClaimForm = () => {
  const navigate = useNavigate();
  const { showNotification } = useApp();
  const [formData, setFormData] = useState({
    policyNumber: '',
    farmerName: '',
    crop: '',
    lossType: '',
    description: '',
    lossDate: '',
    documents: null
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: files ? files[0] : value
    }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.policyNumber) newErrors.policyNumber = 'Policy number is required';
    if (!formData.farmerName) newErrors.farmerName = 'Farmer name is required';
    if (!formData.crop) newErrors.crop = 'Crop is required';
    if (!formData.lossType) newErrors.lossType = 'Loss type is required';
    if (!formData.lossDate) newErrors.lossDate = 'Loss date is required';
    if (!formData.description) newErrors.description = 'Description is required';
    return newErrors;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const errs = validateForm();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      showNotification('Claim submitted successfully!', 'success');
      navigate('/insurance');
    }, 1400);
  };

  return (
    <div className="claim-form-page">
      <div className="container">
        <div className="page-header">
          <h1>File Insurance Claim</h1>
          <p>Fill out the form to report a loss and submit your insurance claim</p>
        </div>
        <form onSubmit={handleSubmit} className="claim-form">
          <div className="form-row">
            <div className="form-group">
              <label>Policy Number *</label>
              <input
                type="text"
                name="policyNumber"
                value={formData.policyNumber}
                onChange={handleChange}
                className={errors.policyNumber ? 'error' : ''}
                placeholder="Enter policy number"
              />
              {errors.policyNumber && <span className="error-text">{errors.policyNumber}</span>}
            </div>
            <div className="form-group">
              <label>Farmer Name *</label>
              <input
                type="text"
                name="farmerName"
                value={formData.farmerName}
                onChange={handleChange}
                className={errors.farmerName ? 'error' : ''}
                placeholder="Enter your name"
              />
              {errors.farmerName && <span className="error-text">{errors.farmerName}</span>}
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Crop *</label>
              <input
                type="text"
                name="crop"
                value={formData.crop}
                onChange={handleChange}
                className={errors.crop ? 'error' : ''}
                placeholder="e.g., Rice"
              />
              {errors.crop && <span className="error-text">{errors.crop}</span>}
            </div>
            <div className="form-group">
              <label>Loss Type *</label>
              <select
                name="lossType"
                value={formData.lossType}
                onChange={handleChange}
                className={errors.lossType ? 'error' : ''}
              >
                <option value="">Select loss type</option>
                <option value="Weather">Weather</option>
                <option value="Disease">Disease</option>
                <option value="Pests">Pests</option>
                <option value="Other">Other</option>
              </select>
              {errors.lossType && <span className="error-text">{errors.lossType}</span>}
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Date of Loss *</label>
              <input
                type="date"
                name="lossDate"
                value={formData.lossDate}
                onChange={handleChange}
                className={errors.lossDate ? 'error' : ''}
              />
              {errors.lossDate && <span className="error-text">{errors.lossDate}</span>}
            </div>
            <div className="form-group">
              <label>Supporting Documents</label>
              <input
                type="file"
                name="documents"
                onChange={handleChange}
                accept=".pdf,.jpg,.jpeg,.png"
              />
            </div>
          </div>
          <div className="form-group">
            <label>Description *</label>
            <textarea
              name="description"
              rows="4"
              value={formData.description}
              onChange={handleChange}
              className={errors.description ? 'error' : ''}
              placeholder="Briefly describe the loss and situation"
            />
            {errors.description && <span className="error-text">{errors.description}</span>}
          </div>
          <div className="form-actions">
            <button type="button" className="btn btn-secondary" onClick={() => navigate('/insurance')}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Submitting...' : 'Submit Claim'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ClaimForm;
