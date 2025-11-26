import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiSearch, FiFilter, FiShoppingCart } from 'react-icons/fi';
import { useCart } from '../../context/CartContext';
import { useApp } from '../../context/AppContext';
import marketService from '../../services/marketService';
import Loader from '../../components/common/Loader';
import './Marketplace.css';

const Marketplace = () => {
  const { addToCart } = useCart();
  const { showNotification } = useApp();
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [priceRange, setPriceRange] = useState('all');

  const categories = ['All', 'Seeds', 'Fertilizers', 'Pesticides', 'Equipment', 'Produce'];
  const priceRanges = [
    { value: 'all', label: 'All Prices' },
    { value: '0-500', label: 'Under ₹500' },
    { value: '500-1000', label: '₹500 - ₹1000' },
    { value: '1000-5000', label: '₹1000 - ₹5000' },
    { value: '5000+', label: 'Above ₹5000' }
  ];

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    const result = await marketService.getProducts();
    if (result.success) {
      setFilteredProducts(result.data);
    } else {
      // Mock data
      setFilteredProducts([
        {
          id: 1,
          name: 'Premium Rice Seeds',
          category: 'Seeds',
          price: 850,
          unit: 'kg',
          image: '/assets/marketplace/rice-seeds.jpg',
          rating: 4.5,
          seller: 'AgriSeeds Co.',
          description: 'High-yield hybrid rice seeds',
          stock: 150
        },
        {
          id: 2,
          name: 'Organic Fertilizer NPK',
          category: 'Fertilizers',
          price: 1200,
          unit: 'bag',
          image: '/assets/marketplace/fertilizer.jpg',
          rating: 4.8,
          seller: 'GreenFert India',
          description: 'Complete NPK organic fertilizer',
          stock: 200
        },
        {
          id: 3,
          name: 'Bio Pesticide Spray',
          category: 'Pesticides',
          price: 450,
          unit: 'liter',
          image: '/assets/marketplace/pesticide.jpg',
          rating: 4.3,
          seller: 'BioProtect Ltd',
          description: 'Eco-friendly pest control solution',
          stock: 80
        },
        {
          id: 4,
          name: 'Drip Irrigation Kit',
          category: 'Equipment',
          price: 8500,
          unit: 'set',
          image: '/assets/marketplace/irrigation.jpg',
          rating: 4.7,
          seller: 'WaterSave Systems',
          description: 'Complete drip irrigation system',
          stock: 25
        },
        {
          id: 5,
          name: 'Fresh Wheat',
          category: 'Produce',
          price: 2200,
          unit: 'quintal',
          image: '/assets/marketplace/wheat.jpg',
          rating: 4.6,
          seller: 'Farmer Direct',
          description: 'Freshly harvested premium wheat',
          stock: 500
        },
        {
          id: 6,
          name: 'Cotton Seeds',
          category: 'Seeds',
          price: 1500,
          unit: 'kg',
          image: '/assets/marketplace/cotton-seeds.jpg',
          rating: 4.4,
          seller: 'Cotton King Seeds',
          description: 'BT cotton hybrid seeds',
          stock: 100
        },
        {
          id: 7,
          name: 'Power Tiller',
          category: 'Equipment',
          price: 45000,
          unit: 'unit',
          image: '/assets/marketplace/tiller.jpg',
          rating: 4.9,
          seller: 'AgriMachinery Co',
          description: '8HP diesel power tiller',
          stock: 10
        },
        {
          id: 8,
          name: 'Vermicompost',
          category: 'Fertilizers',
          price: 600,
          unit: 'bag',
          image: '/assets/marketplace/vermicompost.jpg',
          rating: 4.7,
          seller: 'Organic Farm Solutions',
          description: 'Premium quality vermicompost',
          stock: 300
        }
      ]);
    }
    setLoading(false);
  };

  const handleAddToCart = (product) => {
    addToCart(product, 1);
    showNotification(`${product.name} added to cart`, 'success');
  };

  if (loading) {
    return <Loader fullPage />;
  }

  return (
    <div className="marketplace-page">
      <div className="container">
        <div className="page-header">
          <h1>Marketplace</h1>
          <p>Buy quality agricultural products and sell your produce</p>
        </div>

        {/* Filters */}
        <div className="marketplace-filters">
          <div className="search-box">
            <FiSearch />
            <input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="filter-group">
            <FiFilter />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              <option value="all">All Categories</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <select
              value={priceRange}
              onChange={(e) => setPriceRange(e.target.value)}
            >
              {priceRanges.map(range => (
                <option key={range.value} value={range.value}>{range.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Products Grid */}
        <div className="products-grid">
          {filteredProducts.length > 0 ? (
            filteredProducts.map(product => (
              <div key={product.id} className="product-card">
                <Link to={`/products/${product.id}`} className="product-image">
                  <img src={product.image} alt={product.name} />
                  {product.stock < 50 && (
                    <span className="low-stock-badge">Low Stock</span>
                  )}
                </Link>

                <div className="product-info">
                  <span className="product-category">{product.category}</span>
                  <Link to={`/products/${product.id}`}>
                    <h3>{product.name}</h3>
                  </Link>
                  <p className="product-description">{product.description}</p>
                  
                  <div className="product-seller">
                    <span>Sold by: {product.seller}</span>
                  </div>

                  <div className="product-rating">
                    <span className="stars">★★★★★</span>
                    <span className="rating-value">{product.rating}</span>
                  </div>

                  <div className="product-footer">
                    <div className="product-price">
                      <span className="price">₹{product.price}</span>
                      <span className="unit">/{product.unit}</span>
                    </div>
                    <button
                      className="btn-add-cart"
                      onClick={() => handleAddToCart(product)}
                    >
                      <FiShoppingCart /> Add to Cart
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="no-results">
              <p>No products found matching your criteria</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Marketplace;
