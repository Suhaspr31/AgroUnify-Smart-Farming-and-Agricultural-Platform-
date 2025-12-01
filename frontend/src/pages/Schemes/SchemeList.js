import React, { useState, useEffect, useCallback } from 'react';
import { FiSearch, FiExternalLink, FiCalendar, FiMapPin, FiUsers } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import schemeService from '../../services/schemeService';
import './SchemeList.css';

const SchemeList = () => {
  const navigate = useNavigate();
  const [schemes, setSchemes] = useState([]);
  const [filteredSchemes, setFilteredSchemes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedState, setSelectedState] = useState('all');

  useEffect(() => {
    fetchSchemes();
  }, []);

  const filterSchemes = useCallback(() => {
    let filtered = schemes;

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(scheme =>
        scheme.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        scheme.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Category filter
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(scheme => scheme.category === selectedCategory);
    }

    // State filter
    if (selectedState !== 'all') {
      filtered = filtered.filter(scheme => scheme.state === selectedState);
    }

    setFilteredSchemes(filtered);
  }, [schemes, searchQuery, selectedCategory, selectedState]);

  useEffect(() => {
    filterSchemes();
  }, [filterSchemes]);

  const fetchSchemes = async () => {
    setLoading(true);
    const result = await schemeService.getAllSchemes();

    if (result.success) {
      setSchemes(result.data);
    } else {
      // Fallback mock data
      setSchemes([
        {
          id: 1,
          name: 'Pradhan Mantri Kisan Samman Nidhi (PM-KISAN)',
          description: 'Direct income support of ₹6,000 per year to farmer families',
          category: 'income-support',
          state: 'national',
          eligibility: 'Small and marginal farmers with landholding up to 2 hectares',
          benefits: '₹2,000 quarterly installments',
          deadline: 'Ongoing',
          status: 'active'
        },
        {
          id: 2,
          name: 'Pradhan Mantri Fasal Bima Yojana (PMFBY)',
          description: 'Comprehensive crop insurance scheme',
          category: 'insurance',
          state: 'national',
          eligibility: 'All farmers growing notified crops',
          benefits: 'Coverage against yield loss, prevented sowing, and localized calamities',
          deadline: 'Crop season based',
          status: 'active'
        },
        {
          id: 3,
          name: 'Soil Health Card Scheme',
          description: 'Free soil testing and health cards for farmers',
          category: 'soil-health',
          state: 'national',
          eligibility: 'All farmers',
          benefits: 'Free soil testing, nutrient recommendations, and health cards',
          deadline: 'Ongoing',
          status: 'active'
        },
        {
          id: 4,
          name: 'National Agriculture Market (eNAM)',
          description: 'Online trading platform for agricultural commodities',
          category: 'market-linkage',
          state: 'national',
          eligibility: 'Farmers, traders, and commission agents',
          benefits: 'Better price discovery, reduced transaction costs',
          deadline: 'Ongoing',
          status: 'active'
        }
      ]);
    }
    setLoading(false);
  };


  const getCategoryIcon = (category) => {
    switch (category) {
      case 'income-support': return '💰';
      case 'insurance': return '🛡️';
      case 'soil-health': return '🌱';
      case 'market-linkage': return '🏪';
      case 'credit': return '💳';
      case 'equipment': return '🚜';
      default: return '📋';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return '#4CAF50';
      case 'upcoming': return '#FF9800';
      case 'closed': return '#F44336';
      default: return '#9E9E9E';
    }
  };

  if (loading) {
    return (
      <div className="scheme-list-page">
        <div className="container">
          <div className="loading">Loading government schemes...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="scheme-list-page">
      <div className="container">
        <div className="page-header">
          <h1>🏛️ Government Schemes</h1>
          <p>Explore various government schemes and subsidies available for farmers</p>
          <div className="header-actions">
            <button
              className="btn btn-outline"
              onClick={() => navigate('/schemes/status')}
            >
              📊 Check Application Status
            </button>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="filters-section">
          <div className="search-bar">
            <FiSearch />
            <input
              type="text"
              placeholder="Search schemes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="filter-dropdowns">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              <option value="all">All Categories</option>
              <option value="income-support">Income Support</option>
              <option value="insurance">Insurance</option>
              <option value="soil-health">Soil Health</option>
              <option value="market-linkage">Market Linkage</option>
              <option value="credit">Credit</option>
              <option value="equipment">Equipment</option>
            </select>

            <select
              value={selectedState}
              onChange={(e) => setSelectedState(e.target.value)}
            >
              <option value="all">All States</option>
              <option value="national">National</option>
              <option value="maharashtra">Maharashtra</option>
              <option value="uttar-pradesh">Uttar Pradesh</option>
              <option value="punjab">Punjab</option>
              <option value="haryana">Haryana</option>
              <option value="rajasthan">Rajasthan</option>
              <option value="madhya-pradesh">Madhya Pradesh</option>
              <option value="gujarat">Gujarat</option>
              <option value="karnataka">Karnataka</option>
              <option value="tamil-nadu">Tamil Nadu</option>
            </select>
          </div>
        </div>

        {/* Schemes Grid */}
        <div className="schemes-grid">
          {filteredSchemes.map((scheme) => (
            <div key={scheme.id} className="scheme-card">
              <div className="scheme-header">
                <div className="scheme-icon">
                  {getCategoryIcon(scheme.category)}
                </div>
                <div className="scheme-status">
                  <span
                    className="status-badge"
                    style={{ backgroundColor: getStatusColor(scheme.status) }}
                  >
                    {scheme.status}
                  </span>
                  {scheme.deadlineNotification && (
                    <span
                      className={`notification-badge ${scheme.deadlineNotification.type}`}
                    >
                      {scheme.deadlineNotification.type === 'urgent' ? '🚨' : '⚠️'} {scheme.deadlineNotification.message}
                    </span>
                  )}
                </div>
              </div>

              <div className="scheme-content">
                <h3 className="scheme-title">{scheme.name}</h3>
                <p className="scheme-description">{scheme.description}</p>

                <div className="scheme-details">
                  <div className="detail-item">
                    <FiUsers />
                    <span><strong>Eligibility:</strong> {scheme.eligibility}</span>
                  </div>
                  <div className="detail-item">
                    <FiCalendar />
                    <span><strong>Deadline:</strong> {scheme.deadline}</span>
                  </div>
                  <div className="detail-item">
                    <FiMapPin />
                    <span><strong>Coverage:</strong> {scheme.state === 'national' ? 'All India' : scheme.state}</span>
                  </div>
                </div>

                <div className="scheme-benefits">
                  <h4>Benefits:</h4>
                  <p>{scheme.benefits}</p>
                </div>
              </div>

              <div className="scheme-actions">
                <button
                  className="btn btn-primary"
                  onClick={() => navigate(`/schemes/${scheme.id}`)}
                >
                  View Details
                  <FiExternalLink />
                </button>
                <button
                  className="btn btn-secondary"
                  onClick={() => navigate(`/schemes/${scheme.id}/apply`)}
                >
                  Apply Now
                </button>
              </div>
            </div>
          ))}
        </div>

        {filteredSchemes.length === 0 && (
          <div className="no-schemes">
            <p>No schemes found matching your criteria. Try adjusting your search or filters.</p>
          </div>
        )}

        {/* Farmer Tips */}
        <div className="farmer-tips">
          <h3>💡 Important Notes for Farmers</h3>
          <div className="tips-list">
            <div className="tip-item">
              <h4>📋 Document Requirements</h4>
              <p>Keep your Aadhaar card, land documents, and bank details ready when applying for schemes.</p>
            </div>
            <div className="tip-item">
              <h4>⏰ Application Deadlines</h4>
              <p>Many schemes have seasonal deadlines. Apply well before the cutoff dates to avoid missing opportunities.</p>
            </div>
            <div className="tip-item">
              <h4>📞 Helpline Support</h4>
              <p>Contact your local agriculture office or use the Kisan Call Center (1800-180-1551) for assistance.</p>
            </div>
            <div className="tip-item">
              <h4>✅ Verification Process</h4>
              <p>Applications are verified by local authorities. Ensure all information provided is accurate.</p>
            </div>
            <div className="tip-item">
              <h4>📊 Check Status</h4>
              <p><a href="/schemes/status" style={{color: '#3498db', textDecoration: 'underline'}}>Check your application status</a> or view demo to see how it works.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SchemeList;