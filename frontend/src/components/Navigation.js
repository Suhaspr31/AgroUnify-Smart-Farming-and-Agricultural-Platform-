import React from 'react';
import { Link } from 'react-router-dom';
import './Navigation.css';

const Navigation = () => {
  const navItems = [
    { to: '/', label: 'Home' },
    { to: '/crops', label: 'Crops' },
    { to: '/marketplace', label: 'Marketplace' },
    { to: '/weather', label: 'Weather' },
    { to: '/prices', label: 'Market Prices' }
  ];

  return (
    <nav className="navigation">
      {navItems.map(item => (
        <Link key={item.to} to={item.to} className="nav-item">
          {item.label}
        </Link>
      ))}
    </nav>
  );
};

export default Navigation;
