import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { FiArrowLeft } from 'react-icons/fi';
import './ProductDetail.css';

const ProductDetail = () => {
  const { id } = useParams();
  
  return (
    <div className="product-detail-page">
      <div className="container">
        <Link to="/store" className="back-link">
          <FiArrowLeft /> Back to Stores
        </Link>
        <h1>Product Detail - {id}</h1>
        <p>Product details will be displayed here.</p>
      </div>
    </div>
  );
};

export default ProductDetail;
