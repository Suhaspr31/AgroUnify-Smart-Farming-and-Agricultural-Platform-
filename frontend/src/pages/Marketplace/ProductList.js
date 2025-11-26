import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import marketService from '../../services/marketService';
import Loader from '../../components/common/Loader';
import './ProductList.css';

const ProductList = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    const result = await marketService.getProducts();
    if (result.success) {
      setProducts(result.data);
    } else {
      // Mock data for demonstration
      setProducts([
        {
          id: 1,
          name: 'Premium Rice Seeds',
          category: 'Seeds',
          price: 850,
          unit: 'kg',
          image: '/assets/marketplace/rice-seeds.jpg',
          rating: 4.5,
          seller: 'AgriSeeds Co.'
        },
        {
          id: 2,
          name: 'Organic Fertilizer NPK',
          category: 'Fertilizers',
          price: 1200,
          unit: 'bag',
          image: '/assets/marketplace/fertilizer.jpg',
          rating: 4.8,
          seller: 'GreenFert India'
        },
        {
          id: 3,
          name: 'Bio Pesticide Spray',
          category: 'Pesticides',
          price: 450,
          unit: 'liter',
          image: '/assets/marketplace/pesticide.jpg',
          rating: 4.3,
          seller: 'BioProtect Ltd'
        }
      ]);
    }
    setLoading(false);
  };

  if (loading) {
    return <Loader fullPage />;
  }

  return (
    <div className="product-list-page">
      <div className="container">
        <div className="page-header">
          <h1>All Products</h1>
          <p>Browse all marketplace items</p>
        </div>

        <div className="products-grid">
          {products.length > 0 ? (
            products.map(product => (
              <Link to={`/products/${product.id}`} key={product.id} className="product-card">
                <div className="product-image">
                  <img src={product.image} alt={product.name} />
                </div>
                <div className="product-info">
                  <span className="product-category">{product.category}</span>
                  <h3>{product.name}</h3>
                  <span className="product-price">₹{product.price} / {product.unit}</span>
                  <div className="product-rating">
                    <span>★★★★☆</span>
                    <span className="rating-value">{product.rating}</span>
                  </div>
                  <span className="product-seller">Sold by: {product.seller}</span>
                </div>
              </Link>
            ))
          ) : (
            <div className="no-results">
              <p>No products found</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductList;
