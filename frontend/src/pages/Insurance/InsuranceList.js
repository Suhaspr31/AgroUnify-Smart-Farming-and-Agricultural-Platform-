import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiPlus, FiFileText, FiCheckCircle } from 'react-icons/fi';
import Loader from '../../components/common/Loader';
import './InsuranceList.css';

const InsuranceList = () => {
  const [policies, setPolicies] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPolicies();
  }, []);

  const fetchPolicies = async () => {
    setLoading(true);
    setTimeout(() => {
      setPolicies([
        {
          id: 1,
          policyNumber: 'AGRI-2025001',
          crop: 'Rice',
          sumInsured: 50000,
          validity: '2025-06-01 to 2026-05-31',
          status: 'Active',
          company: 'AgriProtect',
        },
        {
          id: 2,
          policyNumber: 'AGRI-2024017',
          crop: 'Wheat',
          sumInsured: 35000,
          validity: '2025-05-01 to 2026-04-30',
          status: 'Active',
          company: 'GreenCrop Insurance',
        },
        {
          id: 3,
          policyNumber: 'AGRI-2022878',
          crop: 'Cotton',
          sumInsured: 40000,
          validity: '2024-06-01 to 2025-05-31',
          status: 'Expired',
          company: 'AgriProtect',
        },
      ]);
      setLoading(false);
    }, 900);
  };

  return (
    <div className="insurance-list-page">
      <div className="container">
        <div className="page-header">
          <div>
            <h1>My Insurance Policies</h1>
            <p>View and manage your crop insurance policies</p>
          </div>
          <Link to="/insurance/claim" className="btn btn-primary">
            <FiPlus /> File New Claim
          </Link>
        </div>
        {loading ? (
          <Loader fullPage />
        ) : (
          <div className="policies-grid">
            {policies.map(policy => (
              <div key={policy.id} className="policy-card">
                <div className="policy-header">
                  <div className={`status-badge ${policy.status.toLowerCase()}`}>
                    {policy.status === "Active" ? <FiCheckCircle /> : <FiFileText />}
                    {policy.status}
                  </div>
                  <div className="policy-info">
                    <h3>{policy.policyNumber}</h3>
                    <p>Company: {policy.company}</p>
                  </div>
                </div>
                <div className="policy-details">
                  <div className="detail-row">
                    <span className="label">Crop:</span>
                    <span className="value">{policy.crop}</span>
                  </div>
                  <div className="detail-row">
                    <span className="label">Sum Insured:</span>
                    <span className="value">₹{policy.sumInsured}</span>
                  </div>
                  <div className="detail-row">
                    <span className="label">Validity:</span>
                    <span className="value">{policy.validity}</span>
                  </div>
                </div>
                <div className="policy-actions">
                  <Link to={`/insurance/policy/${policy.id}`} className="btn btn-secondary">
                    View Details
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default InsuranceList;
