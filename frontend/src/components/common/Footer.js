import React from 'react';
import { Link } from 'react-router-dom';
import { FiFacebook, FiTwitter, FiInstagram, FiLinkedin } from 'react-icons/fi';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-content">
          <div className="footer-section">
            <h3>AgroUnify</h3>
            <p>Empowering farmers with technology and market access.</p>
            <div className="social-links">
              <a href="https://facebook.com" aria-label="Facebook"><FiFacebook /></a>
              <a href="https://twitter.com" aria-label="Twitter"><FiTwitter /></a>
              <a href="https://instagram.com" aria-label="Instagram"><FiInstagram /></a>
              <a href="https://linkedin.com" aria-label="LinkedIn"><FiLinkedin /></a>
            </div>
          </div>

          <div className="footer-section">
            <h4>Quick Links</h4>
            <ul>
              <li><Link to="/crops">Crops</Link></li>
              <li><Link to="/marketplace">Marketplace</Link></li>
              <li><Link to="/weather">Weather</Link></li>
              <li><Link to="/prices">Market Prices</Link></li>
            </ul>
          </div>

          <div className="footer-section">
            <h4>Resources</h4>
            <ul>
              <li><Link to="/about">About Us</Link></li>
              <li><Link to="/contact">Contact</Link></li>
              <li><Link to="/faq">FAQ</Link></li>
              <li><Link to="/support">Support</Link></li>
            </ul>
          </div>

          <div className="footer-section">
            <h4>Legal</h4>
            <ul>
              <li><Link to="/privacy">Privacy Policy</Link></li>
              <li><Link to="/terms">Terms of Service</Link></li>
              <li><Link to="/refund">Refund Policy</Link></li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <p>&copy; 2025 AgroUnify. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
