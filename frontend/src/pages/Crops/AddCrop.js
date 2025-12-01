import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import cropService from '../../services/cropService';
import fieldService from '../../services/fieldService';
import { validateField } from '../../utils/validators';
import './AddCrop.css';

const AddCrop = () => {
  const navigate = useNavigate();
  const { showNotification } = useApp();
  const [loading, setLoading] = useState(false);
  const [fields, setFields] = useState([]);
  const [fieldsLoading, setFieldsLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    field: '',
    plantingDate: '',
    expectedYield: '',
    yieldUnit: 'quintal',
    stage: 'seedling',
    health: 'good',
    notes: ''
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    const fetchFields = async () => {
      try {
        console.log('Fetching fields...'); // Debug log
        console.log('Auth token present:', !!localStorage.getItem('authToken')); // Debug log
        const result = await fieldService.getAllFields();
        console.log('Fields API response:', result); // Debug log
        console.log('Full response data:', result.data); // Debug log

        if (result.success) {
          // Handle paginated response structure from backend
          let fieldsData = [];
          if (result.data?.data && Array.isArray(result.data.data)) {
            fieldsData = result.data.data;
          } else if (result.data && Array.isArray(result.data)) {
            fieldsData = result.data;
          } else if (result.data?.fields && Array.isArray(result.data.fields)) {
            fieldsData = result.data.fields;
          }

          console.log('Extracted fields data:', fieldsData); // Debug log
          console.log('Number of fields:', fieldsData.length); // Debug log
          console.log('First field sample:', fieldsData[0]); // Debug log

          setFields(fieldsData);
        } else {
          console.error('Failed to load fields:', result.message); // Debug log
          console.error('Response status:', result.status); // Debug log
          showNotification('Failed to load fields', 'error');
        }
      } catch (error) {
        console.error('Error fetching fields:', error); // Debug log
        console.error('Error details:', error.response?.data || error.message); // Debug log
        console.error('Error status:', error.response?.status); // Debug log
        console.error('Error headers:', error.response?.headers); // Debug log
        showNotification('Failed to load fields', 'error');
      } finally {
        setFieldsLoading(false);
      }
    };

    fetchFields();
  }, [showNotification]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Crop name is required';
    }

    // Field is now optional
    // if (!formData.field.trim()) {
    //   newErrors.field = 'Field selection is required';
    // }

    const plantingDateError = validateField('date', formData.plantingDate);
    if (plantingDateError) newErrors.plantingDate = plantingDateError;

    const yieldError = validateField('number', formData.expectedYield);
    if (yieldError) newErrors.expectedYield = yieldError;

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
      const cropData = {
        name: formData.name.trim(), // Trim whitespace
        plantingDate: formData.plantingDate,
        expectedYield: parseFloat(formData.expectedYield),
        yieldUnit: formData.yieldUnit,
        stage: formData.stage,
        health: formData.health,
        notes: formData.notes || undefined
      };

      // Only add field if it's selected (not empty string)
      if (formData.field && formData.field.trim() !== '') {
        cropData.field = formData.field;
      }

      console.log('Sending crop data:', cropData); // Debug log

      console.log('About to call cropService.createCrop with:', cropData);
      const result = await cropService.createCrop(cropData);
      console.log('Crop creation result:', result);

      if (result.success) {
        showNotification('Crop added successfully!', 'success');
        navigate('/my-crops');
      } else {
        console.error('Crop creation failed:', result.message);
        console.error('Full error response:', result);
        showNotification(result.message || 'Failed to add crop', 'error');
      }
    } catch (error) {
      console.error('Exception during crop creation:', error);
      console.error('Error response:', error.response?.data);
      showNotification('Failed to add crop', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="add-crop-page">
      <div className="container">
        <div className="page-header">
          <h1>Add New Crop</h1>
          <p>Register a new crop for cultivation</p>
        </div>

        <form onSubmit={handleSubmit} className="crop-form">
          <div className="form-section">
            <h2>Basic Information</h2>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="name">Crop Name *</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="e.g., Rice, Wheat, Cotton"
                  className={errors.name ? 'error' : ''}
                />
                {errors.name && <span className="error-text">{errors.name}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="field">Field (Optional)</label>
                <select
                  id="field"
                  name="field"
                  value={formData.field}
                  onChange={handleChange}
                  className={errors.field ? 'error' : ''}
                  disabled={fieldsLoading}
                >
                  <option value="">
                    {fieldsLoading ? 'Loading fields...' : 'Select a field (optional)'}
                  </option>
                  {fields.length > 0 ? fields.map(field => (
                    <option key={field._id || field.id} value={field._id || field.id}>
                      {field.name} - {field.area} acres
                    </option>
                  )) : (
                    <option disabled>No fields available</option>
                  )}
                </select>
                {errors.field && <span className="error-text">{errors.field}</span>}
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="plantingDate">Planting Date *</label>
                <input
                  type="date"
                  id="plantingDate"
                  name="plantingDate"
                  value={formData.plantingDate}
                  onChange={handleChange}
                  className={errors.plantingDate ? 'error' : ''}
                />
                {errors.plantingDate && <span className="error-text">{errors.plantingDate}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="expectedYield">Expected Yield (quintal) *</label>
                <input
                  type="number"
                  id="expectedYield"
                  name="expectedYield"
                  value={formData.expectedYield}
                  onChange={handleChange}
                  placeholder="Expected yield"
                  step="0.1"
                  className={errors.expectedYield ? 'error' : ''}
                />
                {errors.expectedYield && <span className="error-text">{errors.expectedYield}</span>}
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="stage">Current Stage</label>
                <select
                  id="stage"
                  name="stage"
                  value={formData.stage}
                  onChange={handleChange}
                >
                  <option value="seedling">Seedling</option>
                  <option value="vegetative">Vegetative</option>
                  <option value="flowering">Flowering</option>
                  <option value="fruiting">Fruiting</option>
                  <option value="ripening">Ripening</option>
                  <option value="harvested">Harvested</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="health">Health Status</label>
                <select
                  id="health"
                  name="health"
                  value={formData.health}
                  onChange={handleChange}
                >
                  <option value="excellent">Excellent</option>
                  <option value="good">Good</option>
                  <option value="fair">Fair</option>
                  <option value="poor">Poor</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="notes">Additional Notes</label>
              <textarea
                id="notes"
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                placeholder="Any additional information about this crop"
                rows="4"
              />
            </div>
          </div>

          <div className="form-actions">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => navigate('/my-crops')}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? 'Adding Crop...' : 'Add Crop'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddCrop;