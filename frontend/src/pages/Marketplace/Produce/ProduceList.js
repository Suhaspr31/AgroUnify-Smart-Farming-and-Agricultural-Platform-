import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiPlus, FiEdit, FiTrash2 } from 'react-icons/fi';
import Loader from '../../../components/common/Loader';
import './ProduceList.css';

const ProduceList = () => {
  const [produceList, setProduceList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProduce();
  }, []);

  const fetchProduce = () => {
    setLoading(true);
    setTimeout(() => {
      setProduceList([
        {
          id: 1,
          name: 'Fresh Organic Rice',
          quantity: 500,
          unit: 'kg',
          price: 45,
          status: 'Available',
          harvest: '2025-10-15'
        },
        {
          id: 2,
          name: 'Premium Wheat',
          quantity: 300,
          unit: 'kg',
          price: 35,
          status: 'Available',
          harvest: '2025-10-10'
        },
        {
          id: 3,
          name: 'Cotton Bales',
          quantity: 100,
          unit: 'bales',
          price: 5500,
          status: 'Sold',
          harvest: '2025-09-25'
        }
      ]);
      setLoading(false);
    }, 900);
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure?')) {
      setProduceList(produceList.filter(p => p.id !== id));
    }
  };

  if (loading) return <Loader fullPage />;

  return (
    <div className="produce-list-page">
      <div className="container">
        <div className="page-header">
          <div>
            <h1>My Produce</h1>
            <p>Manage your agricultural produce for sale</p>
          </div>
          <Link to="/produce/add" className="btn btn-primary">
            <FiPlus /> Add Produce
          </Link>
        </div>
        <div className="produce-grid">
          {produceList.map(item => (
            <div key={item.id} className="produce-card">
              <div className={`status-badge ${item.status.toLowerCase()}`}>{item.status}</div>
              <h3>{item.name}</h3>
              <div className="produce-details">
                <div className="detail-row">
                  <span className="label">Quantity:</span>
                  <span className="value">{item.quantity} {item.unit}</span>
                </div>
                <div className="detail-row">
                  <span className="label">Price:</span>
                  <span className="value">₹{item.price}/{item.unit}</span>
                </div>
                <div className="detail-row">
                  <span className="label">Harvest Date:</span>
                  <span className="value">{new Date(item.harvest).toLocaleDateString()}</span>
                </div>
              </div>
              <div className="produce-actions">
                <Link to={`/produce/${item.id}`} className="btn btn-secondary">View</Link>
                <Link to={`/produce/edit/${item.id}`} className="btn btn-icon"><FiEdit /></Link>
                <button className="btn btn-icon delete" onClick={() => handleDelete(item.id)}><FiTrash2 /></button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProduceList;
