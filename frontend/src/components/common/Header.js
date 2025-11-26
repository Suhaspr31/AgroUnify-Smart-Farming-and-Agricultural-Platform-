import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useCart } from '../../context/CartContext';
import { FiMenu, FiShoppingCart, FiUser, FiLogOut } from 'react-icons/fi';
import './Header.css';

const Header = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const { getItemCount } = useCart();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <header className="header">
      <div className="container">
        <div className="header-content">
          <Link to="/" className="logo">
            <img src="/logo.png" alt="AgroUnify" />
            <span>AgroUnify</span>
          </Link>

          <button className="menu-toggle" onClick={() => setMenuOpen(!menuOpen)}>
            <FiMenu />
          </button>

          <nav className={`nav-menu ${menuOpen ? 'active' : ''}`}>
            <Link to="/">Home</Link>
            <Link to="/crops">Crops</Link>
            <Link to="/marketplace">Marketplace</Link>
            <Link to="/weather">Weather</Link>
            <Link to="/prices">Market Prices</Link>
            <Link to="/about">About</Link>
            <Link to="/contact">Contact</Link>
          </nav>

          <div className="header-actions">
            <Link to="/cart" className="cart-icon">
              <FiShoppingCart />
              {getItemCount() > 0 && (
                <span className="cart-badge">{getItemCount()}</span>
              )}
            </Link>

            {isAuthenticated ? (
              <div className="user-menu">
                <button className="user-button">
                  <FiUser />
                  <span>{user?.name}</span>
                </button>
                <div className="dropdown">
                  <Link to="/dashboard">Dashboard</Link>
                  <Link to="/my-farms">My Farms</Link>
                  <Link to="/orders">Orders</Link>
                  <button onClick={handleLogout}>
                    <FiLogOut /> Logout
                  </button>
                </div>
              </div>
            ) : (
              <div className="auth-buttons">
                <Link to="/login" className="btn btn-secondary">Login</Link>
                <Link to="/register" className="btn btn-primary">Register</Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
