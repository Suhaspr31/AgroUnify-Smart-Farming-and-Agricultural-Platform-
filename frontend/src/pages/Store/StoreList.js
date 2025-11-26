import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiMapPin, FiPhone } from 'react-icons/fi';
import Loader from '../../components/common/Loader';
import './StoreList.css';

const StoreList = () => {
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStores();
  }, []);

  const fetchStores = () => {
    setLoading(true);
    setTimeout(() => {
      setStores([
        {
          id: 1,
          name: 'AgriMart Bangalore',
          location: 'Bangalore, Karnataka',
          phone: '+91 98765 43210',
          products: ['Seeds', 'Fertilizers', 'Tools'],
          rating: 4.5
        },
        {
          id: 2,
          name: 'FarmSupply Center',
          location: 'Mysore, Karnataka',
          phone: '+91 98765 43211',
          products: ['Equipment', 'Pesticides'],
          rating: 4.3
        }
      ]);
      setLoading(false);
    }, 800);
  };

  if (loading) return <Loader fullPage />;

  return (
    <div className="store-list-page">
      <div className="container">
        <div className="page-header">
          <h1>Agricultural Stores</h1>
          <p>Find nearby stores for farming supplies</p>
        </div>
        <div className="stores-grid">
          {stores.map(store => (
            <div key={store.id} className="store-card">
              <h3>{store.name}</h3>
              <div className="store-info">
                <p><FiMapPin /> {store.location}</p>
                <p><FiPhone /> {store.phone}</p>
              </div>
              <div className="products-list">
                {store.products.map((p, i) => (
                  <span key={i} className="product-tag">{p}</span>
                ))}
              </div>
              <Link to={`/store/${store.id}`} className="btn btn-primary">View Store</Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default StoreList;
