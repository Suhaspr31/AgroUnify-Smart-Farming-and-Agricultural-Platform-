import React from 'react';
import { FiShoppingCart, FiStar, FiEye } from 'react-icons/fi';
import './Marketplace.css';

const MarketplaceGrid = ({ products, onAddToCart, onViewProduct }) => {
  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push(<FiStar key={i} className="star filled" />);
    }
    if (hasHalfStar) {
      stars.push(<FiStar key="half" className="star half" />);
    }
    const remainingStars = 5 - Math.ceil(rating);
    for (let i = 0; i < remainingStars; i++) {
      stars.push(<FiStar key={`empty-${i}`} className="star empty" />);
    }

    return stars;
  };

  const calculateDiscountedPrice = (price, discount) => {
    if (!discount) return price;
    return price - (price * discount / 100);
  };

  return (
    <div className="marketplace-grid">
      {products.map(product => {
        const discountedPrice = calculateDiscountedPrice(product.price, product.discount);
        
        return (
          <div key={product.id} className="product-card">
            <div 
              className="product-image"
              onClick={() => onViewProduct(product.id)}
              style={{ cursor: 'pointer' }}
            >
              <img src={product.image} alt={product.name} />
              {product.discount > 0 && (
                <span className="discount-badge">{product.discount}% OFF</span>
              )}
              {product.stock < 50 && product.stock > 0 && (
                <span className="low-stock-badge">Low Stock</span>
              )}
              {product.stock === 0 && (
                <span className="out-of-stock-badge">Out of Stock</span>
              )}
            </div>

            <div className="product-info">
              <span className="product-category">{product.category}</span>
              <h3 
                onClick={() => onViewProduct(product.id)}
                style={{ cursor: 'pointer' }}
              >
                {product.name}
              </h3>
              <p className="product-description">{product.description}</p>
              
              <div className="product-seller">
                <span>Sold by: {product.seller}</span>
              </div>

              <div className="product-rating">
                <div className="stars">
                  {renderStars(product.rating)}
                </div>
                <span className="rating-value">
                  {product.rating} ({product.reviews} reviews)
                </span>
              </div>

              <div className="product-footer">
                <div className="product-price">
                  {product.discount > 0 ? (
                    <>
                      <span className="price discounted">₹{discountedPrice.toFixed(0)}</span>
                      <span className="original-price">₹{product.price}</span>
                    </>
                  ) : (
                    <span className="price">₹{product.price}</span>
                  )}
                  <span className="unit">/{product.unit}</span>
                </div>
                
                <div className="product-actions">
                  <button
                    className="btn-icon"
                    onClick={() => onViewProduct(product.id)}
                    title="View Details"
                  >
                    <FiEye />
                  </button>
                  <button
                    className="btn-add-cart"
                    onClick={() => onAddToCart(product)}
                    disabled={product.stock === 0}
                  >
                    <FiShoppingCart /> Add
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default MarketplaceGrid;
