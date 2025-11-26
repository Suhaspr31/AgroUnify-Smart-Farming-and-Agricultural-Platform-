import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { FiArrowLeft } from 'react-icons/fi';
import Loader from '../../../components/common/Loader';
import './ProduceDetail.css';

const ProduceDetail = () => {
  const { id } = useParams();
  const [produce, setProduce] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProduceDetails();
  }, [id]);

  const fetchProduceDetails = () => {
    setLoading(true);
    setTimeout(() => {
      setProduce({
        id: id,
        name: 'Fresh Organic Rice',
        quantity: 500,
        unit: 'kg',
        price: 45,
        status: 'Available',
        harvest: '2025-10-15',
        description: 'Premium quality organic rice harvested from our fields.',
        variety: 'Basmati 1121',
        certification: 'Organic Certified'
      });
      setLoading(false);
    }, 700);
  };

  if (loading) return <Loader fullPage />;
  if (!produce) return <div className="container"><p>Produce not found</p></div>;

  return (
    <div className="produce-detail-page">
      <div className="container">
        <Link to="/produce" className="back-link">
          <FiArrowLeft /> Back to Produce
        </Link>
        <div className="produce-detail-card">
          <div className={`status-badge ${produce.status.toLowerCase()}`}>{produce.status}</div>
          <h1>{produce.name}</h1>
          <p className="description">{produce.description}</p>
          <div className="info-grid">
            <div className="info-item">
              <span className="label">Quantity</span>
              <span className="value">{produce.quantity} {produce.unit}</span>
            </div>
            <div className="info-item">
              <span className="label">Price</span>
              <span className="value">₹{produce.price}/{produce.unit}</span>
            </div>
            <div className="info-item">
              <span className="label">Variety</span>
              <span className="value">{produce.variety}</span>
            </div>
            <div className="info-item">
              <span className="label">Harvest Date</span>
              <span className="value">{new Date(produce.harvest).toLocaleDateString()}</span>
            </div>
            <div className="info-item">
              <span className="label">Certification</span>
              <span className="value">{produce.certification}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProduceDetail;
