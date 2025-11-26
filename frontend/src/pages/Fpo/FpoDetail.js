import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { FiArrowLeft, FiUsers, FiMapPin, FiCalendar, FiTrendingUp } from 'react-icons/fi';
import Loader from '../../components/common/Loader';
import './FpoDetail.css';

const FpoDetail = () => {
  const { id } = useParams();
  const [fpo, setFpo] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFpoDetails();
  }, [id]);

  const fetchFpoDetails = async () => {
    setLoading(true);
    setTimeout(() => {
      setFpo({
        id: id,
        name: 'Karnataka Farmers Producer Organization',
        shortName: 'KFPO',
        location: 'Bangalore, Karnataka',
        members: 250,
        established: '2020-03-15',
        registration: 'REG/2020/KA/12345',
        crops: ['Rice', 'Wheat', 'Cotton', 'Sugarcane'],
        revenue: 15000000,
        status: 'Active',
        description: 'KFPO is a collective of progressive farmers working together to improve agricultural practices, market access, and income.',
        services: [
          'Bulk procurement of seeds and fertilizers',
          'Collective marketing of produce',
          'Training and capacity building',
          'Access to credit and financial services',
          'Quality certification services'
        ],
        leadership: [
          { name: 'Rajesh Kumar', position: 'President', phone: '+91 98765 43210' },
          { name: 'Sunita Devi', position: 'Secretary', phone: '+91 98765 43211' },
          { name: 'Mohan Singh', position: 'Treasurer', phone: '+91 98765 43212' }
        ],
        achievements: [
          '₹15M annual turnover in 2024',
          '250+ farmer members across 15 villages',
          'Organic certification for 50 farmers',
          'Direct market linkages with 10+ buyers'
        ]
      });
      setLoading(false);
    }, 1000);
  };

  if (loading) {
    return <Loader fullPage />;
  }

  if (!fpo) {
    return (
      <div className="container">
        <p>FPO not found</p>
      </div>
    );
  }

  return (
    <div className="fpo-detail-page">
      <div className="container">
        <Link to="/fpo" className="back-link">
          <FiArrowLeft /> Back to FPOs
        </Link>

        <div className="fpo-header">
          <div className="fpo-info">
            <h1>{fpo.name}</h1>
            <p className="fpo-short-name">{fpo.shortName}</p>
            <div className="fpo-meta">
              <span><FiMapPin /> {fpo.location}</span>
              <span><FiCalendar /> Est. {new Date(fpo.established).getFullYear()}</span>
              <span><FiUsers /> {fpo.members} Members</span>
            </div>
          </div>
          <div className="fpo-stats-card">
            <div className="stat">
              <FiTrendingUp />
              <div>
                <span className="stat-value">₹{(fpo.revenue / 1000000).toFixed(1)}M</span>
                <span className="stat-label">Annual Revenue</span>
              </div>
            </div>
          </div>
        </div>

        <div className="fpo-content">
          <div className="content-section">
            <h2>About</h2>
            <p>{fpo.description}</p>
            <div className="info-grid">
              <div className="info-item">
                <span className="label">Registration No.</span>
                <span className="value">{fpo.registration}</span>
              </div>
              <div className="info-item">
                <span className="label">Status</span>
                <span className="value status-active">{fpo.status}</span>
              </div>
            </div>
          </div>

          <div className="content-section">
            <h2>Crops Covered</h2>
            <div className="crop-tags">
              {fpo.crops.map((crop, index) => (
                <span key={index} className="crop-tag">{crop}</span>
              ))}
            </div>
          </div>

          <div className="content-section">
            <h2>Services Offered</h2>
            <ul className="services-list">
              {fpo.services.map((service, index) => (
                <li key={index}>{service}</li>
              ))}
            </ul>
          </div>

          <div className="content-section">
            <h2>Leadership Team</h2>
            <div className="leadership-grid">
              {fpo.leadership.map((leader, index) => (
                <div key={index} className="leader-card">
                  <h3>{leader.name}</h3>
                  <p className="position">{leader.position}</p>
                  <p className="contact">{leader.phone}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="content-section achievements">
            <h2>Key Achievements</h2>
            <ul className="achievements-list">
              {fpo.achievements.map((achievement, index) => (
                <li key={index}>{achievement}</li>
              ))}
            </ul>
          </div>

          <div className="action-buttons">
            <button className="btn btn-primary">Join FPO</button>
            <button className="btn btn-secondary">Contact Us</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FpoDetail;
