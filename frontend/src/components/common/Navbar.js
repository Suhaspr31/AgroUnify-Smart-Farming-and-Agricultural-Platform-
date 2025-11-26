import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { FiBell, FiSettings, FiUser } from 'react-icons/fi';
import './Navbar.css';

const Navbar = () => {
  const { user } = useAuth();

  return (
    <nav className="navbar">
      <div className="navbar-content">
        <div className="navbar-brand">
          <Link to="/dashboard">
            <img src="/logo.png" alt="AgroUnify" />
            <span>AgroUnify</span>
          </Link>
        </div>

        <div className="navbar-actions">
          <button className="icon-button">
            <FiBell />
            <span className="badge">3</span>
          </button>
          
          <Link to="/settings" className="icon-button">
            <FiSettings />
          </Link>

          <div className="user-profile">
            <FiUser />
            <span>{user?.name}</span>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
