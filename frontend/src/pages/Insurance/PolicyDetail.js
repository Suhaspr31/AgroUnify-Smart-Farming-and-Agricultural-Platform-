import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { FiArrowLeft, FiCheckCircle, FiFileText, FiCalendar } from 'react-icons/fi';
import Loader from '../../components/common/Loader';
import './PolicyDetail.css';

const PolicyDetail = () => {
  const { id } = useParams();
  const [policy, setPolicy] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPolicyDetails();
  }, [id]);

  const fetchPolicyDetails = () => {
    setLoading(true);
    setTimeout(() => {
      setPolicy({
        id: id,
        policyNumber: 'AGRI-2025001',
        crop: 'Rice',
        sumInsured: 50000,
        premium: 2500,
        validity: '2025-06-01 to 2026-05-31',
        status: 'Active',
        company: 'AgriProtect Insurance',
        farmerName: 'Rajesh Kumar',
        area: 5,
        coverage: ['Weather', 'Disease', 'Pests', 'Fire'],
        claims: [
          { id: 1, date: '2025-09-15', type: 'Weather', status: 'Approved', amount: 15000 }
        ]
      });
      setLoading(false);
    }, 800);
  };

  if (loading) return <Loader fullPage />;
  if (!policy) return <div className="container"><p>Policy not found</p></div>;

  return (
    <div className="policy-detail-page">
      <div className="container">
        <Link to="/insurance" className="back-link">
          <FiArrowLeft /> Back to Policies
        </Link>
        <div className="policy-header">
          <div>
            <h1>{policy.policyNumber}</h1>
            <p>{policy.company}</p>
          </div>
          <div className={`status-badge ${policy.status.toLowerCase()}`}>
            {policy.status === 'Active' ? <FiCheckCircle /> : <FiFileText />}
            {policy.status}
          </div>
        </div>
        <div className="policy-content">
          <div className="info-section">
            <h2>Policy Details</h2>
            <div className="info-grid">
              <div className="info-item">
                <span className="label">Farmer Name</span>
                <span className="value">{policy.farmerName}</span>
              </div>
              <div className="info-item">
                <span className="label">Crop</span>
                <span className="value">{policy.crop}</span>
              </div>
              <div className="info-item">
                <span className="label">Area Covered</span>
                <span className="value">{policy.area} acres</span>
              </div>
              <div className="info-item">
                <span className="label">Sum Insured</span>
                <span className="value">₹{policy.sumInsured.toLocaleString()}</span>
              </div>
              <div className="info-item">
                <span className="label">Premium</span>
                <span className="value">₹{policy.premium.toLocaleString()}</span>
              </div>
              <div className="info-item">
                <span className="label">Validity</span>
                <span className="value">{policy.validity}</span>
              </div>
            </div>
          </div>
          <div className="info-section">
            <h2>Coverage</h2>
            <div className="coverage-list">
              {policy.coverage.map((item, index) => (
                <span key={index} className="coverage-badge">{item}</span>
              ))}
            </div>
          </div>
          <div className="info-section">
            <h2>Claims History</h2>
            {policy.claims.length > 0 ? (
              <div className="claims-list">
                {policy.claims.map(claim => (
                  <div key={claim.id} className="claim-item">
                    <div className="claim-header">
                      <span className="claim-type">{claim.type}</span>
                      <span className={`claim-status ${claim.status.toLowerCase()}`}>{claim.status}</span>
                    </div>
                    <div className="claim-details">
                      <span>Date: {new Date(claim.date).toLocaleDateString()}</span>
                      <span>Amount: ₹{claim.amount.toLocaleString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p>No claims filed yet</p>
            )}
          </div>
          <div className="action-section">
            <Link to="/insurance/claim" className="btn btn-primary">File New Claim</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PolicyDetail;
