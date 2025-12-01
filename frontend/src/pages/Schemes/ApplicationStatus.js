import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiCheckCircle, FiClock, FiXCircle, FiFileText, FiCalendar } from 'react-icons/fi';
import schemeService from '../../services/schemeService';
import './ApplicationStatus.css';

const ApplicationStatus = () => {
  const { applicationId } = useParams();
  const navigate = useNavigate();
  const [application, setApplication] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [demoMode, setDemoMode] = useState(false);

  useEffect(() => {
    const fetchApplicationStatus = async () => {
      try {
        setLoading(true);
        const result = await schemeService.getApplicationById(applicationId);

        if (result.success) {
          setApplication(result.data);
        } else {
          setError(result.message);
        }
      } catch (err) {
        setError('Failed to fetch application status');
      } finally {
        setLoading(false);
      }
    };

    if (applicationId && applicationId !== 'demo') {
      fetchApplicationStatus();
    } else {
      // Show demo mode for testing
      setDemoMode(true);
      setLoading(false);
      setApplication({
        applicationId: 'DEMO-APP-2025-001',
        farmerName: 'Demo Farmer',
        aadhaarNumber: 'XXXX-XXXX-1234',
        phoneNumber: '+91-9876543210',
        address: 'Village Demo, District Demo, State Demo - 123456',
        landArea: 5,
        annualIncome: 250000,
        bankDetails: 'Demo Bank, Account: XXXXXXXX1234, IFSC: DEMO0001234',
        status: 'under-review',
        submittedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
        schemeId: {
          name: 'Pradhan Mantri Kisan Samman Nidhi (PM-KISAN)',
          category: 'income-support'
        },
        nextSteps: [
          {
            step: 'Document Verification',
            description: 'Your documents are being verified by local authorities',
            deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            completed: false
          },
          {
            step: 'Bank Account Validation',
            description: 'Your bank account details are being validated',
            deadline: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000),
            completed: false
          },
          {
            step: 'First Installment',
            description: 'First quarterly installment will be credited to your account',
            deadline: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000),
            completed: false
          }
        ]
      });
    }
  }, [applicationId]);

  const getStatusIcon = (status) => {
    switch (status) {
      case 'submitted': return <FiClock className="status-icon submitted" />;
      case 'under-review': return <FiClock className="status-icon review" />;
      case 'approved': return <FiCheckCircle className="status-icon approved" />;
      case 'rejected': return <FiXCircle className="status-icon rejected" />;
      case 'pending-documents': return <FiFileText className="status-icon pending" />;
      default: return <FiClock className="status-icon" />;
    }
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
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="application-status-page">
        <div className="container">
          <div className="loading">Loading application status...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="application-status-page">
        <div className="container">
          <div className="error">
            <h2>Application Not Found</h2>
            <p>{error}</p>
            <button
              className="btn btn-primary"
              onClick={() => navigate('/schemes')}
            >
              Back to Schemes
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!application) {
    return (
      <div className="application-status-page">
        <div className="container">
          <div className="error">
            <h2>Application Not Found</h2>
            <p>The application you're looking for doesn't exist.</p>
            <button
              className="btn btn-primary"
              onClick={() => navigate('/schemes')}
            >
              Back to Schemes
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="application-status-page">
      <div className="container">
        {/* Header */}
        <div className="page-header">
          <button className="back-btn" onClick={() => navigate('/schemes')}>
            <FiArrowLeft /> Back to Schemes
          </button>
          <h1>📋 Application Status</h1>
          <p>Track your government scheme application</p>
        </div>

        {/* Application Overview */}
        <div className="application-overview">
          <div className="status-card">
            {demoMode && (
              <div className="demo-banner">
                <span className="demo-badge">DEMO MODE</span>
                <p>This is a demonstration of the application status page. In real usage, this would show actual application data.</p>
              </div>
            )}
            <div className="status-header">
              {getStatusIcon(application.status)}
              <div className="status-info">
                <h2>{application.schemeId?.name || 'Government Scheme'}</h2>
                <p className="application-id">Application ID: {application.applicationId}</p>
              </div>
            </div>

            <div className="status-badge" style={{ backgroundColor: getStatusColor(application.status) }}>
              {application.status.replace('-', ' ').toUpperCase()}
            </div>

            <div className="application-details">
              <div className="detail-row">
                <span><strong>Submitted:</strong> {formatDate(application.submittedAt)}</span>
                <span><strong>Farmer:</strong> {application.farmerName}</span>
              </div>
              <div className="detail-row">
                <span><strong>Aadhaar:</strong> {application.aadhaarNumber}</span>
                <span><strong>Land Area:</strong> {application.landArea} acres</span>
              </div>
            </div>
          </div>
        </div>

        {/* Next Steps */}
        {application.nextSteps && application.nextSteps.length > 0 && (
          <div className="next-steps-section">
            <h3>📝 Next Steps</h3>
            <div className="steps-timeline">
              {application.nextSteps.map((step, index) => (
                <div key={index} className={`step-item ${step.completed ? 'completed' : ''}`}>
                  <div className="step-marker">
                    {step.completed ? <FiCheckCircle /> : <FiClock />}
                  </div>
                  <div className="step-content">
                    <h4>{step.step}</h4>
                    <p>{step.description}</p>
                    {step.deadline && (
                      <div className="step-deadline">
                        <FiCalendar />
                        <span>Deadline: {formatDate(step.deadline)}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Application Details */}
        <div className="application-details-section">
          <h3>📄 Application Details</h3>
          <div className="details-grid">
            <div className="detail-card">
              <h4>Personal Information</h4>
              <div className="detail-content">
                <p><strong>Name:</strong> {application.farmerName}</p>
                <p><strong>Aadhaar:</strong> {application.aadhaarNumber}</p>
                <p><strong>Phone:</strong> {application.phoneNumber}</p>
                <p><strong>Address:</strong> {application.address}</p>
              </div>
            </div>

            <div className="detail-card">
              <h4>Farm Information</h4>
              <div className="detail-content">
                <p><strong>Land Area:</strong> {application.landArea} acres</p>
                {application.annualIncome && (
                  <p><strong>Annual Income:</strong> ₹{application.annualIncome}</p>
                )}
                {application.bankDetails && (
                  <p><strong>Bank Details:</strong> {application.bankDetails}</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Remarks */}
        {application.remarks && (
          <div className="remarks-section">
            <h3>💬 Remarks</h3>
            <div className="remarks-content">
              <p>{application.remarks}</p>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="action-buttons">
          <button
            className="btn btn-secondary"
            onClick={() => navigate('/schemes')}
          >
            View More Schemes
          </button>
          <button
            className="btn btn-primary"
            onClick={() => window.print()}
          >
            Print Status
          </button>
        </div>
      </div>
    </div>
  );
};

export default ApplicationStatus;