import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiPlus, FiUsers, FiMapPin, FiTrendingUp } from 'react-icons/fi';
import Loader from '../../components/common/Loader';
import './FpoList.css';

const FpoList = () => {
  const [fpos, setFpos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFpos();
  }, []);

  const fetchFpos = async () => {
    setLoading(true);
    // Mock data
    setTimeout(() => {
      setFpos([
        {
          id: 1,
          name: 'Karnataka Farmers Producer Organization',
          shortName: 'KFPO',
          location: 'Bangalore, Karnataka',
          members: 250,
          established: '2020-03-15',
          crops: ['Rice', 'Wheat', 'Cotton'],
          revenue: 15000000,
          status: 'Active',
          logo: '/assets/fpo/kfpo.jpg'
        },
        {
          id: 2,
          name: 'Mandya Agricultural Collective',
          shortName: 'MAC',
          location: 'Mandya, Karnataka',
          members: 180,
          established: '2019-08-20',
          crops: ['Sugarcane', 'Rice', 'Ragi'],
          revenue: 12500000,
          status: 'Active',
          logo: '/assets/fpo/mac.jpg'
        },
        {
          id: 3,
          name: 'Mysore Organic Farmers Union',
          shortName: 'MOFU',
          location: 'Mysore, Karnataka',
          members: 120,
          established: '2021-01-10',
          crops: ['Organic Vegetables', 'Fruits'],
          revenue: 8000000,
          status: 'Active',
          logo: '/assets/fpo/mofu.jpg'
        }
      ]);
      setLoading(false);
    }, 1000);
  };

  if (loading) {
    return <Loader fullPage />;
  }

  return (
    <div className="fpo-list-page">
      <div className="container">
        <div className="page-header">
          <div>
            <h1>Farmer Producer Organizations</h1>
            <p>Connect with FPOs for collective farming benefits</p>
          </div>
          <Link to="/fpo/create" className="btn btn-primary">
            <FiPlus /> Create FPO
          </Link>
        </div>

        <div className="fpos-grid">
          {fpos.map(fpo => (
            <div key={fpo.id} className="fpo-card">
              <div className="fpo-header">
                <div className="fpo-logo">
                  <img src={fpo.logo} alt={fpo.name} />
                </div>
                <div className="fpo-status active">{fpo.status}</div>
              </div>

              <div className="fpo-content">
                <h3>{fpo.name}</h3>
                <p className="fpo-short-name">{fpo.shortName}</p>
                <div className="fpo-location">
                  <FiMapPin />
                  <span>{fpo.location}</span>
                </div>

                <div className="fpo-stats">
                  <div className="stat-item">
                    <FiUsers />
                    <div>
                      <span className="stat-value">{fpo.members}</span>
                      <span className="stat-label">Members</span>
                    </div>
                  </div>
                  <div className="stat-item">
                    <FiTrendingUp />
                    <div>
                      <span className="stat-value">₹{(fpo.revenue / 1000000).toFixed(1)}M</span>
                      <span className="stat-label">Revenue</span>
                    </div>
                  </div>
                </div>

                <div className="fpo-crops">
                  <strong>Crops:</strong>
                  <div className="crop-tags">
                    {fpo.crops.map((crop, index) => (
                      <span key={index} className="crop-tag">{crop}</span>
                    ))}
                  </div>
                </div>

                <div className="fpo-footer">
                  <span className="established">Est. {new Date(fpo.established).getFullYear()}</span>
                  <Link to={`/fpo/${fpo.id}`} className="btn btn-secondary">
                    View Details
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FpoList;
