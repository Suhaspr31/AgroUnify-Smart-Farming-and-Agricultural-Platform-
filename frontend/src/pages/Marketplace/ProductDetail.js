import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { FiArrowLeft, FiShoppingCart, FiTruck, FiShield, FiStar } from 'react-icons/fi';
import { useCart } from '../../context/CartContext';
import { useApp } from '../../context/AppContext';
import marketService from '../../services/marketService';
import Loader from '../../components/common/Loader';
import './ProductDetail.css';

const ProductDetail = () => {
  const { id } = useParams();
  const { addToCart } = useCart();
  const { showNotification } = useApp();
  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);

  const fetchProductDetails = useCallback(async () => {
    setLoading(true);
    const result = await marketService.getProductById(id);
    if (result.success) {
      setProduct(result.data);
    } else {
      // Mock data
      setProduct({
        id: id,
        name: 'Premium Rice Seeds',
        category: 'Seeds',
        price: 850,
        unit: 'kg',
        image: '/assets/marketplace/rice-seeds.jpg',
        rating: 4.5,
        reviews: 124,
        seller: 'AgriSeeds Co.',
        description: 'High-yield hybrid rice seeds with excellent disease resistance and grain quality.',
        stock: 150,
        features: [
          'High yield potential (7-8 tons/acre)',
          'Disease resistant variety',
          'Suitable for all soil types',
          'Maturity period: 120-130 days',
          'Excellent grain quality'
        ],
        specifications: {
          'Seed Type': 'Hybrid',
          'Crop': 'Rice',
          'Variety': 'Premium-101',
          'Germination Rate': '90% minimum',
          'Purity': '98% minimum',
          'Moisture': '12% maximum',
          'Packaging': '1kg sealed packets'
        },
        shipping: {
          freeShipping: true,
          deliveryTime: '3-5 business days',
          returnPolicy: '7 days return policy'
        },
        similarProducts: [2, 6]
      });
    }
    setLoading(false);
  }, [id]);

  useEffect(() => {
    fetchProductDetails();
  }, [fetchProductDetails]);

  const handleAddToCart = () => {
    addToCart(product, quantity);
    showNotification(`${quantity} ${product.unit}(s) of ${product.name} added to cart`, 'success');
  };

  const handleBuyNow = () => {
    addToCart(product, quantity);
    // Navigate to cart or checkout
    window.location.href = '/cart';
  };

  if (loading) {
    return <Loader fullPage />;
  }

  if (!product) {
    return (
      <div className="container">
        <p>Product not found</p>
      </div>
    );
  }

  return (
    <div className="product-detail-page">
      <div className="container">
        <Link to="/marketplace" className="back-link">
          <FiArrowLeft /> Back to Marketplace
        </Link>

        <div className="product-detail-container">
          <div className="product-gallery">
            <div className="main-image">
              <img src={product.image} alt={product.name} />
            </div>
          </div>

          <div className="product-details">
            <span className="product-category">{product.category}</span>
            <h1>{product.name}</h1>
            
            <div className="product-rating-section">
              <div className="rating-stars">
                <FiStar className="filled" />
                <FiStar className="filled" />
                <FiStar className="filled" />
                <FiStar className="filled" />
                <FiStar />
              </div>
              <span className="rating-text">{product.rating} ({product.reviews} reviews)</span>
            </div>

            <div className="product-price-section">
              <span className="current-price">₹{product.price}</span>
              <span className="price-unit">per {product.unit}</span>
            </div>

            <p className="product-description">{product.description}</p>

            <div className="product-seller-info">
              <strong>Sold by:</strong> {product.seller}
            </div>

            <div className="stock-status">
              {product.stock > 50 ? (
                <span className="in-stock">In Stock</span>
              ) : product.stock > 0 ? (
                <span className="low-stock">Only {product.stock} left</span>
              ) : (
                <span className="out-of-stock">Out of Stock</span>
              )}
            </div>

            <div className="quantity-selector">
              <label>Quantity:</label>
              <div className="quantity-controls">
                <button onClick={() => setQuantity(Math.max(1, quantity - 1))}>-</button>
                <input
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                  min="1"
                />
                <button onClick={() => setQuantity(quantity + 1)}>+</button>
              </div>
            </div>

            <div className="action-buttons">
              <button className="btn btn-primary" onClick={handleAddToCart}>
                <FiShoppingCart /> Add to Cart
              </button>
              <button className="btn btn-secondary" onClick={handleBuyNow}>
                Buy Now
              </button>
            </div>

            <div className="product-highlights">
              <div className="highlight-item">
                <FiTruck />
                <div>
                  <strong>Free Shipping</strong>
                  <p>On orders above ₹500</p>
                </div>
              </div>
              <div className="highlight-item">
                <FiShield />
                <div>
                  <strong>Quality Guaranteed</strong>
                  <p>Certified products</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Product Information Tabs */}
        <div className="product-info-tabs">
          <div className="tab-section">
            <h2>Features</h2>
            <ul className="features-list">
              {product.features.map((feature, index) => (
                <li key={index}>{feature}</li>
              ))}
            </ul>
          </div>

          <div className="tab-section">
            <h2>Specifications</h2>
            <table className="specifications-table">
              <tbody>
                {Object.entries(product.specifications).map(([key, value]) => (
                  <tr key={key}>
                    <td className="spec-key">{key}</td>
                    <td className="spec-value">{value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="tab-section">
            <h2>Shipping & Returns</h2>
            <div className="shipping-info">
              <p><strong>Delivery Time:</strong> {product.shipping.deliveryTime}</p>
              <p><strong>Return Policy:</strong> {product.shipping.returnPolicy}</p>
              {product.shipping.freeShipping && <p className="free-shipping">✓ Free Shipping Available</p>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
