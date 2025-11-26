import React, { useState } from 'react';
import { SOIL_TYPES, IRRIGATION_TYPES } from '../../utils/constants';
import { validateField } from '../../utils/validators';

const FarmForm = ({ onSubmit, initialData = {} }) => {
  const [formData, setFormData] = useState({
    name: initialData.name || '',
    location: initialData.location || '',
    area: initialData.area || '',
    soilType: initialData.soilType || '',
    irrigationType: initialData.irrigationType || '',
    ...initialData
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

  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = validateForm();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="farm-form">
      <div className="form-group">
        <label htmlFor="name">Farm Name *</label>
        <input
          type="text"
          id="name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          className={errors.name ? 'error' : ''}
        />
        {errors.name && <span className="error-text">{errors.name}</span>}
      </div>

      <div className="form-group">
        <label htmlFor="location">Location *</label>
        <input
          type="text"
          id="location"
          name="location"
          value={formData.location}
          onChange={handleChange}
          className={errors.location ? 'error' : ''}
        />
        {errors.location && <span className="error-text">{errors.location}</span>}
      </div>

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="area">Area (acres) *</label>
          <input
            type="number"
            id="area"
            name="area"
            value={formData.area}
            onChange={handleChange}
            step="0.1"
            className={errors.area ? 'error' : ''}
          />
          {errors.area && <span className="error-text">{errors.area}</span>}
        </div>

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
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
          {errors.soilType && <span className="error-text">{errors.soilType}</span>}
        </div>
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
            <option key={type} value={type}>{type}</option>
          ))}
        </select>
        {errors.irrigationType && <span className="error-text">{errors.irrigationType}</span>}
      </div>

      <button type="submit" className="btn btn-primary">
        {initialData.id ? 'Update Farm' : 'Add Farm'}
      </button>
    </form>
  );
};

export default FarmForm;
