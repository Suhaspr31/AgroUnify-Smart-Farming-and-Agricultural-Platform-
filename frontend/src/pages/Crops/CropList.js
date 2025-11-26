import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiSearch, FiFilter } from 'react-icons/fi';
import cropService from '../../services/cropService';
import Loader from '../../components/common/Loader';
import './CropList.css';

const CropList = () => {
  const [crops, setCrops] = useState([]);
  const [filteredCrops, setFilteredCrops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedSeason, setSelectedSeason] = useState('all');

  const categories = ['All', 'Cereals', 'Pulses', 'Oilseeds', 'Vegetables', 'Fruits', 'Spices'];
  const seasons = ['All', 'Kharif', 'Rabi', 'Zaid'];

  useEffect(() => {
    fetchCrops();
  }, []);

  const fetchCrops = async () => {
    setLoading(true);
    const result = await cropService.getAllCrops();
    if (result.success) {
      setCrops(result.data);
    } else {
      // Mock data for demonstration
      setCrops([
        {
          id: 1,
          name: 'Rice',
          category: 'Cereals',
          season: 'Kharif',
          image: '/assets/crops/rice.jpg',
          price: 2500,
          description: 'High-quality rice variety suitable for various climates',
          growthPeriod: '120-150 days'
        },
        {
          id: 2,
          name: 'Wheat',
          category: 'Cereals',
          season: 'Rabi',
          image: '/assets/crops/wheat.jpg',
          price: 2000,
          description: 'Premium wheat variety with excellent yield',
          growthPeriod: '110-130 days'
        },
        {
          id: 3,
          name: 'Cotton',
          category: 'Fiber',
          season: 'Kharif',
          image: '/assets/crops/cotton.jpg',
          price: 5500,
          description: 'High-quality cotton with good fiber strength',
          growthPeriod: '150-180 days'
        },
        {
          id: 4,
          name: 'Maize',
          category: 'Cereals',
          season: 'Kharif',
          image: '/assets/crops/maize.jpg',
          price: 1800,
          description: 'Hybrid maize variety with high yield potential',
          growthPeriod: '90-120 days'
        },
        {
          id: 5,
          name: 'Tomato',
          category: 'Vegetables',
          season: 'Rabi',
          image: '/assets/crops/tomato.jpg',
          price: 3000,
          description: 'Disease-resistant tomato variety',
          growthPeriod: '60-80 days'
        },
        {
          id: 6,
          name: 'Sugarcane',
          category: 'Cash Crop',
          season: 'Kharif',
          image: '/assets/crops/sugarcane.jpg',
          price: 3500,
          description: 'High-sugar content sugarcane variety',
          growthPeriod: '300-365 days'
        }
      ]);
    }
    setLoading(false);
  };

  useEffect(() => {
    let filtered = [...crops];

    if (searchTerm) {
      filtered = filtered.filter(crop =>
        crop.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(crop => crop.category === selectedCategory);
    }

    if (selectedSeason !== 'all') {
      filtered = filtered.filter(crop => crop.season === selectedSeason);
    }

    setFilteredCrops(filtered);
  }, [crops, searchTerm, selectedCategory, selectedSeason]);

  if (loading) {
    return <Loader fullPage />;
  }

  return (
    <div className="crop-list-page">
      <div className="container">
        <div className="page-header">
          <h1>Crop Varieties</h1>
          <p>Explore our comprehensive collection of crop varieties</p>
        </div>

        {/* Filters */}
        <div className="filters-section">
          <div className="search-box">
            <FiSearch />
            <input
              type="text"
              placeholder="Search crops..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="filter-group">
            <label>
              <FiFilter /> Category:
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              <option value="all">All Categories</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label>Season:</label>
            <select
              value={selectedSeason}
              onChange={(e) => setSelectedSeason(e.target.value)}
            >
              <option value="all">All Seasons</option>
              {seasons.map(season => (
                <option key={season} value={season}>{season}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Crop Grid */}
        <div className="crop-grid">
          {filteredCrops.length > 0 ? (
            filteredCrops.map(crop => (
              <Link key={crop.id} to={`/crops/${crop.id}`} className="crop-card">
                <div className="crop-image">
                  <img src={crop.image} alt={crop.name} />
                  <span className="crop-season">{crop.season}</span>
                </div>
                <div className="crop-info">
                  <h3>{crop.name}</h3>
                  <p className="crop-category">{crop.category}</p>
                  <p className="crop-description">{crop.description}</p>
                  <div className="crop-footer">
                    <span className="crop-price">₹{crop.price}/quintal</span>
                    <span className="crop-growth">{crop.growthPeriod}</span>
                  </div>
                </div>
              </Link>
            ))
          ) : (
            <div className="no-results">
              <p>No crops found matching your criteria</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CropList;
