import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { FiArrowLeft, FiCalendar, FiDroplet, FiSun, FiThermometer } from 'react-icons/fi';
import cropService from '../../services/cropService';
import Loader from '../../components/common/Loader';
import './CropDetail.css';

const CropDetail = () => {
  const { id } = useParams();
  const [crop, setCrop] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchCropDetails = useCallback(async () => {
    setLoading(true);
    const result = await cropService.getCropById(id);
    if (result.success) {
      setCrop(result.data);
    } else {
      // Mock data
      setCrop({
        id: id,
        name: 'Rice',
        category: 'Cereals',
        season: 'Kharif',
        image: '/assets/crops/rice.jpg',
        price: 2500,
        description: 'High-quality rice variety suitable for various climates. This variety is known for its excellent yield and disease resistance.',
        growthPeriod: '120-150 days',
        waterRequirement: 'High',
        soilType: 'Clay loam, Clay',
        temperature: '20-35°C',
        rainfall: '100-200 cm',
        spacing: '20 cm x 15 cm',
        seedRate: '20-25 kg/acre',
        fertilizer: {
          nitrogen: '120 kg/ha',
          phosphorus: '60 kg/ha',
          potassium: '40 kg/ha'
        },
        diseases: [
          {
            name: 'Blast Disease',
            symptoms: 'Diamond-shaped lesions on leaves',
            control: 'Use resistant varieties, proper water management'
          },
          {
            name: 'Bacterial Leaf Blight',
            symptoms: 'Water-soaked lesions on leaf tips',
            control: 'Use certified seeds, balanced fertilization'
          }
        ],
        cultivation: [
          'Land preparation: Prepare field by ploughing and leveling',
          'Nursery: Raise seedlings in nursery for 21-25 days',
          'Transplanting: Transplant 2-3 seedlings per hill at 20x15 cm spacing',
          'Water management: Maintain 5-10 cm water level',
          'Weed control: Manual weeding or use herbicides',
          'Fertilizer application: Apply NPK as per soil test',
          'Pest management: Monitor regularly and apply pesticides if needed',
          'Harvesting: Harvest when 80% of grains turn golden yellow'
        ],
        benefits: [
          'High yield potential',
          'Good grain quality',
          'Disease resistant',
          'Suitable for various climates',
          'Good market demand'
        ]
      });
    }
    setLoading(false);
  }, [id]);

  useEffect(() => {
    fetchCropDetails();
  }, [fetchCropDetails]);

  if (loading) {
    return <Loader fullPage />;
  }

  if (!crop) {
    return (
      <div className="container">
        <p>Crop not found</p>
      </div>
    );
  }

  return (
    <div className="crop-detail-page">
      <div className="container">
        <Link to="/crops" className="back-link">
          <FiArrowLeft /> Back to Crops
        </Link>

        <div className="crop-detail-header">
          <div className="crop-detail-image">
            <img src={crop.image} alt={crop.name} />
            <span className="crop-detail-season">{crop.season}</span>
          </div>
          <div className="crop-detail-info">
            <span className="crop-detail-category">{crop.category}</span>
            <h1>{crop.name}</h1>
            <p className="crop-detail-description">{crop.description}</p>
            <div className="crop-detail-price">
              <span className="price-label">Current Market Price:</span>
              <span className="price-value">₹{crop.price}/quintal</span>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="crop-stats">
          <div className="stat-item">
            <FiCalendar />
            <div>
              <span className="stat-label">Growth Period</span>
              <span className="stat-value">{crop.growthPeriod}</span>
            </div>
          </div>
          <div className="stat-item">
            <FiDroplet />
            <div>
              <span className="stat-label">Water Requirement</span>
              <span className="stat-value">{crop.waterRequirement}</span>
            </div>
          </div>
          <div className="stat-item">
            <FiThermometer />
            <div>
              <span className="stat-label">Temperature</span>
              <span className="stat-value">{crop.temperature}</span>
            </div>
          </div>
          <div className="stat-item">
            <FiSun />
            <div>
              <span className="stat-label">Rainfall</span>
              <span className="stat-value">{crop.rainfall}</span>
            </div>
          </div>
        </div>

        {/* Details Sections */}
        <div className="crop-sections">
          {/* Growing Requirements */}
          <div className="detail-section">
            <h2>Growing Requirements</h2>
            <div className="requirement-grid">
              <div className="requirement-item">
                <strong>Soil Type:</strong>
                <p>{crop.soilType}</p>
              </div>
              <div className="requirement-item">
                <strong>Spacing:</strong>
                <p>{crop.spacing}</p>
              </div>
              <div className="requirement-item">
                <strong>Seed Rate:</strong>
                <p>{crop.seedRate}</p>
              </div>
            </div>
          </div>

          {/* Fertilizer Requirements */}
          <div className="detail-section">
            <h2>Fertilizer Requirements</h2>
            <div className="fertilizer-grid">
              <div className="fertilizer-item">
                <span className="fertilizer-name">Nitrogen (N)</span>
                <span className="fertilizer-amount">{crop.fertilizer.nitrogen}</span>
              </div>
              <div className="fertilizer-item">
                <span className="fertilizer-name">Phosphorus (P)</span>
                <span className="fertilizer-amount">{crop.fertilizer.phosphorus}</span>
              </div>
              <div className="fertilizer-item">
                <span className="fertilizer-name">Potassium (K)</span>
                <span className="fertilizer-amount">{crop.fertilizer.potassium}</span>
              </div>
            </div>
          </div>

          {/* Cultivation Practices */}
          <div className="detail-section">
            <h2>Cultivation Practices</h2>
            <ol className="cultivation-steps">
              {crop.cultivation.map((step, index) => (
                <li key={index}>{step}</li>
              ))}
            </ol>
          </div>

          {/* Common Diseases */}
          <div className="detail-section">
            <h2>Common Diseases & Control</h2>
            <div className="diseases-list">
              {crop.diseases.map((disease, index) => (
                <div key={index} className="disease-card">
                  <h3>{disease.name}</h3>
                  <div className="disease-info">
                    <div>
                      <strong>Symptoms:</strong>
                      <p>{disease.symptoms}</p>
                    </div>
                    <div>
                      <strong>Control Measures:</strong>
                      <p>{disease.control}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Benefits */}
          <div className="detail-section">
            <h2>Key Benefits</h2>
            <ul className="benefits-list">
              {crop.benefits.map((benefit, index) => (
                <li key={index}>{benefit}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CropDetail;
