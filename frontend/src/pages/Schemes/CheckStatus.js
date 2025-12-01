import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiSearch, FiFileText, FiArrowRight, FiPlus } from 'react-icons/fi';
import schemeService from '../../services/schemeService';
import './CheckStatus.css';

const CheckStatus = () => {
  const navigate = useNavigate();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [aadhaarNumber, setAadhaarNumber] = useState('');
  const [showDemo, setShowDemo] = useState(false);

  useEffect(() => {
    // Try to load applications if Aadhaar is stored
    const storedAadhaar = localStorage.getItem('userAadhaar');
    if (storedAadhaar) {
      setAadhaarNumber(storedAadhaar);
      fetchApplications(storedAadhaar);
    } else {
      setLoading(false);
    }
  }, []);

  const fetchApplications = async (aadhaar) => {
    if (!aadhaar) return;

    try {
      setLoading(true);
      const result = await schemeService.getApplications({ aadhaarNumber: aadhaar });

      if (result.success && result.data.length > 0) {
        setApplications(result.data);
      } else {
        setApplications([]);
        setShowDemo(true);
      }
    } catch (error) {
      console.error('Error fetching applications:', error);
      setApplications([]);
      setShowDemo(true);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (aadhaarNumber) {
      localStorage.setItem('userAadhaar', aadhaarNumber);
      fetchApplications(aadhaarNumber);
    }
  };

  const handleViewStatus = (applicationId) => {
    navigate(`/schemes/application/${applicationId}`);
  };

  const handleViewDemo = () => {
    navigate('/schemes/application/demo');
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'submitted': return '#FF9800';
      case 'under-review': return '#2196F3';
      case 'approved': return '#4CAF50';
      case 'rejected': return '#F44336';
      case 'pending-documents': return '#FF5722';
      default: return '#9E9E9E';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="check-status-page">
      <div className="container">
        <div className="page-header">
          <h1>📊 Application Status</h1>
          <p>Track the status of your government scheme applications</p>
        </div>

        {/* Search Form */}
        <div className="search-section">
          <form onSubmit={handleSearch} className="search-form">
            <div className="search-input-group">
              <FiSearch />
              <input
                type="text"
                placeholder="Enter your Aadhaar number (last 4 digits or full number)"
                value={aadhaarNumber}
                onChange={(e) => setAadhaarNumber(e.target.value)}
                pattern="[0-9]{4,12}"
                required
              />
            </div>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Searching...' : 'Search Applications'}
            </button>
          </form>
        </div>

        {/* Applications List */}
        {applications.length > 0 && (
          <div className="applications-section">
            <h2>Your Applications</h2>
            <div className="applications-grid">
              {applications.map((app) => (
                <div key={app.applicationId} className="application-card">
                  <div className="application-header">
                    <div className="scheme-info">
                      <h3>{app.schemeId?.name || 'Government Scheme'}</h3>
                      <p className="application-id">ID: {app.applicationId}</p>
                    </div>
                    <div
                      className="status-badge"
                      style={{ backgroundColor: getStatusColor(app.status) }}
                    >
                      {app.status.replace('-', ' ').toUpperCase()}
                    </div>
                  </div>

                  <div className="application-meta">
                    <span>📅 Submitted: {formatDate(app.submittedAt)}</span>
                    <span>👤 {app.farmerName}</span>
                  </div>

                  <div className="application-actions">
                    <button
                      className="btn btn-primary"
                      onClick={() => handleViewStatus(app.applicationId)}
                    >
                      View Details
                      <FiArrowRight />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Demo Section - Always Visible */}
        <div className="demo-section">
          <div className="demo-card">
            <div className="demo-header">
              <h3> See How It Works</h3>
              <p>Want to see what the application status page looks like after applying for a scheme?</p>
            </div>
            <div className="demo-actions">
              <button
                className="btn btn-outline"
                onClick={handleViewDemo}
              >
                View Demo Status
                <FiArrowRight />
              </button>
            </div>
          </div>
        </div>

        {/* No Applications Found */}
        {applications.length === 0 && !loading && aadhaarNumber && (
          <div className="no-applications">
            <div className="no-apps-icon">📭</div>
            <h2>No Applications Found</h2>
            <p>We couldn't find any applications with the provided Aadhaar number.</p>
            <p>This could mean:</p>
            <ul>
              <li>You haven't applied for any schemes yet</li>
              <li>The Aadhaar number is incorrect</li>
              <li>Applications are still being processed</li>
            </ul>

            <div className="no-apps-actions">
              <button
                className="btn btn-primary"
                onClick={() => navigate('/schemes')}
              >
                <FiPlus />
                Apply for Schemes
              </button>
              <button
                className="btn btn-outline"
                onClick={handleViewDemo}
              >
                <FiFileText />
                View Demo Status
              </button>
            </div>
          </div>
        )}

        {/* Demo Section */}
        {showDemo && (
          <div className="demo-section">
            <div className="demo-card">
              <div className="demo-header">
                <h3>👁️ See How It Works</h3>
                <p>Want to see what the application status page looks like after applying for a scheme?</p>
              </div>
              <div className="demo-actions">
                <button
                  className="btn btn-outline"
                  onClick={handleViewDemo}
                >
                  View Demo Status
                  <FiArrowRight />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Help Section */}
        <div className="help-section">
          <h3>Need Help?</h3>
          <div className="help-grid">
            <div className="help-item">
              <h4>📞 Contact Support</h4>
              <p>Call our helpline: 1800-XXX-XXXX</p>
            </div>
            <div className="help-item">
              <h4>📧 Email Support</h4>
              <p>Email us at: support@govschemes.in</p>
            </div>
            <div className="help-item">
              <h4>🏢 Visit Office</h4>
              <p>Visit your nearest agriculture office</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckStatus;