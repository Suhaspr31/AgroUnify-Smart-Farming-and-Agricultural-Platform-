import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { FiArrowRight, FiCloud, FiTrendingUp, FiShoppingBag, FiUsers } from 'react-icons/fi';
import './Home.css';

const Home = () => {
  const { isAuthenticated } = useAuth();

  return (
    <div className="home-page">
      {/* Hero Section */}
      <section className="hero">
        <div className="container">
          <div className="hero-content">
            <div className="hero-text">
              <h1>Empowering Farmers with Technology</h1>
              <p>
                AgroUnify connects farmers with modern technology, market access, 
                and agricultural insights to maximize crop yields and profitability.
              </p>
              <div className="hero-actions">
                {isAuthenticated ? (
                  <Link to="/dashboard" className="btn btn-primary">
                    Go to Dashboard <FiArrowRight />
                  </Link>
                ) : (
                  <>
                    <Link to="/register" className="btn btn-primary">
                      Get Started <FiArrowRight />
                    </Link>
                    <Link to="/login" className="btn btn-secondary">
                      Login
                    </Link>
                  </>
                )}
              </div>
            </div>
            <div className="hero-image">
              <img src="\assets\images\hero-bg.jpg" alt="Agriculture Technology" />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features">
        <div className="container">
          <div className="section-header">
            <h2>Why Choose AgroUnify?</h2>
            <p>Comprehensive agricultural solutions at your fingertips</p>
          </div>
          
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">
                <FiCloud />
              </div>
              <h3>Smart Weather Monitoring</h3>
              <p>Get real-time weather updates, forecasts, and alerts to make informed farming decisions.</p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">
                <FiTrendingUp />
              </div>
              <h3>Market Price Analysis</h3>
              <p>Access live market prices, trends, and analytics to sell your crops at the best rates.</p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">
                <FiShoppingBag />
              </div>
              <h3>Digital Marketplace</h3>
              <p>Buy quality seeds, fertilizers, and equipment. Sell your produce directly to buyers.</p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">
                <FiUsers />
              </div>
              <h3>Community Support</h3>
              <p>Connect with other farmers, share experiences, and learn from agricultural experts.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="stats">
        <div className="container">
          <div className="stats-grid">
            <div className="stat-item">
              <h3>10,000+</h3>
              <p>Active Farmers</p>
            </div>
            <div className="stat-item">
              <h3>500+</h3>
              <p>Products Available</p>
            </div>
            <div className="stat-item">
              <h3>50+</h3>
              <p>Crop Varieties</p>
            </div>
            <div className="stat-item">
              <h3>95%</h3>
              <p>Customer Satisfaction</p>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="services">
        <div className="container">
          <div className="section-header">
            <h2>Our Services</h2>
            <p>Everything you need for successful farming</p>
          </div>
          
          <div className="services-grid">
            <div className="service-card">
              <h3>Crop Management</h3>
              <p>Monitor your crops, track growth stages, and get personalized recommendations.</p>
              <Link to="/crops" className="service-link">
                Learn More <FiArrowRight />
              </Link>
            </div>

            <div className="service-card">
              <h3>Weather Intelligence</h3>
              <p>Advanced weather forecasting and climate analysis for better planning.</p>
              <Link to="/weather" className="service-link">
                Learn More <FiArrowRight />
              </Link>
            </div>

            <div className="service-card">
              <h3>Marketplace</h3>
              <p>Buy and sell agricultural products with transparent pricing and quality assurance.</p>
              <Link to="/marketplace" className="service-link">
                Learn More <FiArrowRight />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta">
        <div className="container">
          <div className="cta-content">
            <h2>Ready to Transform Your Farming?</h2>
            <p>Join thousands of farmers who are already using AgroUnify to improve their yields and profits.</p>
            {!isAuthenticated && (
              <Link to="/register" className="btn btn-primary btn-large">
                Start Your Journey <FiArrowRight />
              </Link>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
