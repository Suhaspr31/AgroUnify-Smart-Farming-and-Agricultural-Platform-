import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { FiArrowLeft, FiCalendar, FiMapPin, FiUsers, FiFileText, FiCheckCircle, FiExternalLink } from 'react-icons/fi';
import schemeService from '../../services/schemeService';
import { useEmail } from '../../hooks/useEmail';
import './SchemeDetail.css';

const SchemeDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { sendSchemeApplicationEmail, loading: emailLoading } = useEmail();

  const [scheme, setScheme] = useState(null);
  const [loading, setLoading] = useState(true);
  const [applicationData, setApplicationData] = useState({
    farmerName: '',
    aadhaarNumber: '',
    phoneNumber: '',
    address: '',
    landArea: '',
    annualIncome: '',
    bankDetails: '',
    documents: []
  });
  const [showApplicationForm, setShowApplicationForm] = useState(false);

  const fetchSchemeDetail = useCallback(async () => {
    setLoading(true);

    // Try to fetch from API first
    const result = await schemeService.getSchemeById(id);

    if (result.success) {
      setScheme(result.data);
    } else {
      // Fallback to mock data based on ID
      const mockSchemes = {
        1: {
          id: 1,
          name: 'Pradhan Mantri Kisan Samman Nidhi (PM-KISAN)',
          description: 'Direct income support of ₹6,000 per year to farmer families',
          category: 'income-support',
          state: 'national',
          eligibility: [
            'Small and marginal farmers with landholding up to 2 hectares',
            'Farmers who are owners/cultivators/sharecroppers/tenant farmers',
            'Age between 18-40 years',
            'Valid Aadhaar number linked with bank account'
          ],
          benefits: [
            '₹2,000 quarterly installments (total ₹6,000 annually)',
            'Direct bank transfer to beneficiary account',
            'No upper limit on number of installments',
            'Support for 5 years initially'
          ],
          requiredDocuments: [
            'Aadhaar Card',
            'Land documents',
            'Bank account details',
            'Recent passport size photograph'
          ],
          applicationProcess: [
            'Visit nearest CSC center or Agriculture office',
            'Fill online application form',
            'Upload required documents',
            'Verification by local authorities',
            'Approval and fund transfer'
          ],
          deadline: 'Ongoing',
          status: 'active',
          contactInfo: {
            helpline: '1800-3000-343',
            website: 'https://pmkisan.gov.in',
            email: 'help@pmkisan.gov.in'
          }
        },
        2: {
          id: 2,
          name: 'Pradhan Mantri Fasal Bima Yojana (PMFBY)',
          description: 'Comprehensive crop insurance scheme',
          category: 'insurance',
          state: 'national',
          eligibility: [
            'All farmers growing notified crops',
            'Both loanee and non-loanee farmers',
            'Cultivators, sharecroppers, tenant farmers'
          ],
          benefits: [
            'Coverage against yield loss due to natural calamities',
            'Protection against prevented sowing/localized calamities',
            'Post-harvest losses covered',
            'Mid-season adversity coverage'
          ],
          requiredDocuments: [
            'Land documents',
            'Crop sowing certificate',
            'Bank account details',
            'Aadhaar Card'
          ],
          applicationProcess: [
            'Register with nearest bank/insurance company',
            'Pay premium (75% subsidy for small farmers)',
            'Crop cutting experiments for loss assessment',
            'Claim settlement within stipulated time'
          ],
          deadline: 'Crop season based',
          status: 'active',
          contactInfo: {
            helpline: '1800-11-7717',
            website: 'https://pmfby.gov.in',
            email: 'info@pmfby.gov.in'
          }
        },
        3: {
          id: 3,
          name: 'Soil Health Card Scheme',
          description: 'Free soil testing and health cards for farmers',
          category: 'soil-health',
          state: 'national',
          eligibility: [
            'All farmers'
          ],
          benefits: [
            'Free soil testing',
            'Nutrient recommendations',
            'Soil health cards',
            'Fertilizer recommendations'
          ],
          requiredDocuments: [
            'Land documents',
            'Aadhaar Card'
          ],
          applicationProcess: [
            'Visit nearest soil testing lab',
            'Submit soil sample',
            'Receive soil health card',
            'Follow recommendations'
          ],
          deadline: 'Ongoing',
          status: 'active',
          contactInfo: {
            helpline: '1800-11-6666',
            website: 'https://soilhealth.dac.gov.in',
            email: 'soilhealth-dac@gov.in'
          }
        },
        4: {
          id: 4,
          name: 'National Agriculture Market (eNAM)',
          description: 'Online trading platform for agricultural commodities',
          category: 'market-linkage',
          state: 'national',
          eligibility: [
            'Farmers, traders, and commission agents'
          ],
          benefits: [
            'Better price discovery',
            'Reduced transaction costs',
            'Access to national market',
            'Transparent pricing'
          ],
          requiredDocuments: [
            'Aadhaar Card',
            'Bank account details',
            'Mobile number'
          ],
          applicationProcess: [
            'Register on eNAM portal',
            'Create account',
            'Link bank account',
            'Start trading'
          ],
          deadline: 'Ongoing',
          status: 'active',
          contactInfo: {
            helpline: '1800-11-5353',
            website: 'https://www.enam.gov.in',
            email: 'support@enam.gov.in'
          }
        }
      };

      setScheme(mockSchemes[id] || mockSchemes[1]);
    }
    setLoading(false);
  }, [id]);

  useEffect(() => {
    fetchSchemeDetail();
  }, [fetchSchemeDetail]);

  useEffect(() => {
    // Auto-open application form if accessed via /apply route
    if (location.pathname.endsWith('/apply')) {
      setShowApplicationForm(true);
    }
  }, [location.pathname]);

  const handleApplicationSubmit = async (e) => {
    e.preventDefault();

    const result = await schemeService.applyForScheme(scheme.id, applicationData);

    if (result.success) {
      // Send confirmation email
      await sendSchemeApplicationEmail({
        schemeName: scheme.name,
        applicationId: result.data.applicationId
      }, 'user@example.com'); // Replace with actual user email

      // Navigate to success page with application data
      navigate('/schemes/application/success', {
        state: {
          applicationData: {
            ...result.data,
            schemeName: scheme.name
          }
        }
      });
    } else {
      alert('Application submission failed. Please try again.');
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setApplicationData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  if (loading) {
    return (
      <div className="scheme-detail-page">
        <div className="container">
          <div className="loading">Loading scheme details...</div>
        </div>
      </div>
    );
  }

  if (!scheme) {
    return (
      <div className="scheme-detail-page">
        <div className="container">
          <div className="error">Scheme not found</div>
        </div>
      </div>
    );
  }

  return (
    <div className="scheme-detail-page">
      <div className="container">
        {/* Back Button */}
        <button className="back-btn" onClick={() => navigate('/schemes')}>
          <FiArrowLeft /> Back to Schemes
        </button>

        {/* Scheme Header */}
        <div className="scheme-header">
          <div className="scheme-icon">
            {scheme.category === 'income-support' ? '💰' :
             scheme.category === 'insurance' ? '🛡️' :
             scheme.category === 'soil-health' ? '🌱' : '📋'}
          </div>
          <div className="scheme-info">
            <h1>{scheme.name}</h1>
            <p className="scheme-description">{scheme.description}</p>
            <div className="scheme-meta">
              <span className="meta-item">
                <FiMapPin />
                {scheme.state === 'national' ? 'All India' : scheme.state}
              </span>
              <span className="meta-item">
                <FiCalendar />
                {scheme.deadline}
              </span>
              <span className={`status-badge ${scheme.status}`}>
                {scheme.status}
              </span>
            </div>
            {scheme.deadlineNotification && (
              <div className={`deadline-notification ${scheme.deadlineNotification.type}`}>
                <div className="notification-icon">
                  {scheme.deadlineNotification.type === 'urgent' ? '🚨' :
                   scheme.deadlineNotification.type === 'warning' ? '⚠️' : '❌'}
                </div>
                <div className="notification-content">
                  <h3>Deadline Alert</h3>
                  <p>{scheme.deadlineNotification.message}</p>
                  {scheme.deadlineNotification.daysLeft && (
                    <p className="days-left">⏰ {scheme.deadlineNotification.daysLeft} days remaining</p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Scheme Content */}
        <div className="scheme-content">
          {/* Eligibility */}
          <div className="content-section">
            <h2><FiUsers /> Eligibility Criteria</h2>
            <ul className="criteria-list">
              {scheme.eligibility.map((criteria, index) => (
                <li key={index}>
                  <FiCheckCircle />
                  {criteria}
                </li>
              ))}
            </ul>
          </div>

          {/* Benefits */}
          <div className="content-section">
            <h2>🎁 Benefits & Features</h2>
            <ul className="benefits-list">
              {scheme.benefits.map((benefit, index) => (
                <li key={index}>
                  <FiCheckCircle />
                  {benefit}
                </li>
              ))}
            </ul>
          </div>

          {/* Required Documents */}
          <div className="content-section">
            <h2><FiFileText /> Required Documents</h2>
            <ul className="documents-list">
              {scheme.requiredDocuments.map((doc, index) => (
                <li key={index}>{doc}</li>
              ))}
            </ul>
          </div>

          {/* Application Process */}
          <div className="content-section">
            <h2>📝 Application Process</h2>
            <ol className="process-list">
              {scheme.applicationProcess.map((step, index) => (
                <li key={index}>
                  <span className="step-number">{index + 1}</span>
                  {step}
                </li>
              ))}
            </ol>
          </div>

          {/* Contact Information */}
          <div className="content-section">
            <h2>📞 Contact Information</h2>
            <div className="contact-info">
              <div className="contact-item">
                <strong>Helpline:</strong> {scheme.contactInfo.helpline}
              </div>
              <div className="contact-item">
                <strong>Website:</strong>
                <a href={scheme.contactInfo.website} target="_blank" rel="noopener noreferrer">
                  {scheme.contactInfo.website} <FiExternalLink />
                </a>
              </div>
              <div className="contact-item">
                <strong>Email:</strong> {scheme.contactInfo.email}
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="action-buttons">
          <button
            className="btn btn-primary"
            onClick={() => setShowApplicationForm(true)}
          >
            Apply for Scheme
          </button>
          <button
            className="btn btn-secondary"
            onClick={() => window.open(scheme.contactInfo.website, '_blank')}
          >
            Visit Official Website
          </button>
        </div>

        {/* Application Form Modal */}
        {showApplicationForm && (
          <div className="modal-overlay">
            <div className="modal-content">
              <div className="modal-header">
                <h3>Apply for {scheme.name}</h3>
                <button
                  className="close-btn"
                  onClick={() => setShowApplicationForm(false)}
                >
                  ×
                </button>
              </div>

              <form onSubmit={handleApplicationSubmit} className="application-form">
                <div className="form-row">
                  <div className="form-group">
                    <label>Full Name *</label>
                    <input
                      type="text"
                      name="farmerName"
                      value={applicationData.farmerName}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Aadhaar Number *</label>
                    <input
                      type="text"
                      name="aadhaarNumber"
                      value={applicationData.aadhaarNumber}
                      onChange={handleInputChange}
                      pattern="[0-9]{12}"
                      required
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Phone Number *</label>
                    <input
                      type="tel"
                      name="phoneNumber"
                      value={applicationData.phoneNumber}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Land Area (acres) *</label>
                    <input
                      type="number"
                      name="landArea"
                      value={applicationData.landArea}
                      onChange={handleInputChange}
                      step="0.1"
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Address *</label>
                  <textarea
                    name="address"
                    value={applicationData.address}
                    onChange={handleInputChange}
                    rows="3"
                    required
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Annual Income</label>
                    <input
                      type="number"
                      name="annualIncome"
                      value={applicationData.annualIncome}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="form-group">
                    <label>Bank Account Details</label>
                    <input
                      type="text"
                      name="bankDetails"
                      value={applicationData.bankDetails}
                      onChange={handleInputChange}
                      placeholder="Account number and IFSC"
                    />
                  </div>
                </div>

                <div className="form-actions">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setShowApplicationForm(false)}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={emailLoading}
                  >
                    {emailLoading ? 'Submitting...' : 'Submit Application'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SchemeDetail;