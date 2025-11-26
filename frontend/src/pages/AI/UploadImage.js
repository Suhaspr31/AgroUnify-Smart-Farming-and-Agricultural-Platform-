import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiUpload, FiCamera, FiX, FiImage } from 'react-icons/fi';
import { useApp } from '../../context/AppContext';
import './UploadImage.css';

const UploadImage = () => {
  const navigate = useNavigate();
  const { showNotification } = useApp();
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  const handleImageSelect = (file) => {
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        showNotification('Please select an image file', 'error');
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        showNotification('Image size should be less than 5MB', 'error');
        return;
      }

      setSelectedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFileInput = (e) => {
    const file = e.target.files[0];
    handleImageSelect(file);
  };

  const handleDrag = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleImageSelect(e.dataTransfer.files[0]);
    }
  }, []);

  const handleCameraCapture = (e) => {
    const file = e.target.files[0];
    handleImageSelect(file);
  };

  const handleRemoveImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
  };

  const handleAnalyze = async () => {
    if (!selectedImage) {
      showNotification('Please select an image first', 'error');
      return;
    }

    setAnalyzing(true);

    try {
      // Simulate API call for AI analysis
      const formData = new FormData();
      formData.append('image', selectedImage);

      // Mock API delay
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Navigate to analysis result with image data
      navigate('/ai/analysis', {
        state: {
          imageUrl: imagePreview,
          imageName: selectedImage.name
        }
      });
    } catch (error) {
      showNotification('Failed to analyze image. Please try again.', 'error');
      setAnalyzing(false);
    }
  };

  return (
    <div className="upload-image-page">
      <div className="container">
        <div className="page-header">
          <h1>AI Crop Disease Detection</h1>
          <p>Upload an image of your crop to detect diseases and get treatment recommendations</p>
        </div>

        <div className="upload-container">
          {!imagePreview ? (
            <div
              className={`upload-area ${dragActive ? 'drag-active' : ''}`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <FiImage className="upload-icon" />
              <h3>Upload Crop Image</h3>
              <p>Drag and drop an image here, or click to select</p>
              <div className="upload-buttons">
                <label className="btn btn-primary">
                  <FiUpload /> Choose File
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileInput}
                    hidden
                  />
                </label>
                <label className="btn btn-secondary">
                  <FiCamera /> Take Photo
                  <input
                    type="file"
                    accept="image/*"
                    capture="environment"
                    onChange={handleCameraCapture}
                    hidden
                  />
                </label>
              </div>
              <small>Supported formats: JPG, PNG, JPEG (Max 5MB)</small>
            </div>
          ) : (
            <div className="image-preview-container">
              <div className="image-preview">
                <img src={imagePreview} alt="Selected crop" />
                <button className="remove-image" onClick={handleRemoveImage}>
                  <FiX />
                </button>
              </div>
              <div className="image-info">
                <h3>{selectedImage.name}</h3>
                <p>Size: {(selectedImage.size / 1024).toFixed(2)} KB</p>
              </div>
            </div>
          )}

          {imagePreview && (
            <div className="action-buttons">
              <button
                className="btn btn-secondary"
                onClick={handleRemoveImage}
                disabled={analyzing}
              >
                Change Image
              </button>
              <button
                className="btn btn-primary btn-large"
                onClick={handleAnalyze}
                disabled={analyzing}
              >
                {analyzing ? (
                  <>
                    <span className="spinner"></span>
                    Analyzing...
                  </>
                ) : (
                  'Analyze Image'
                )}
              </button>
            </div>
          )}
        </div>

        <div className="features-section">
          <h3>How It Works</h3>
          <div className="features-grid">
            <div className="feature-item">
              <div className="feature-number">1</div>
              <h4>Upload Image</h4>
              <p>Take a clear photo of the affected crop leaf or plant part</p>
            </div>
            <div className="feature-item">
              <div className="feature-number">2</div>
              <h4>AI Analysis</h4>
              <p>Our AI model analyzes the image to detect diseases and pests</p>
            </div>
            <div className="feature-item">
              <div className="feature-number">3</div>
              <h4>Get Results</h4>
              <p>Receive instant diagnosis with treatment recommendations</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UploadImage;
