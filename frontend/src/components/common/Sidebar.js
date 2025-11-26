import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import {
  FiHome,
  FiGrid,
  FiShoppingBag,
  FiTrendingUp,
  FiCloud,
  FiSettings,
  FiUser,
  FiPackage
} from 'react-icons/fi';
import './Sidebar.css';

const Sidebar = () => {
  const { user } = useAuth();

  const farmerLinks = [
    { to: '/dashboard', icon: <FiHome />, label: 'Dashboard' },
    { to: '/my-farms', icon: <FiGrid />, label: 'My Farms' },
    { to: '/my-crops', icon: <FiPackage />, label: 'My Crops' },
    { to: '/marketplace', icon: <FiShoppingBag />, label: 'Marketplace' },
    { to: '/orders', icon: <FiPackage />, label: 'Orders' },
    { to: '/weather/dashboard', icon: <FiCloud />, label: 'Weather' },
    { to: '/prices', icon: <FiTrendingUp />, label: 'Market Prices' },
    { to: '/profile', icon: <FiUser />, label: 'Profile' },
    { to: '/settings', icon: <FiSettings />, label: 'Settings' }
  ];

  const customerLinks = [
    { to: '/dashboard', icon: <FiHome />, label: 'Dashboard' },
    { to: '/marketplace', icon: <FiShoppingBag />, label: 'Marketplace' },
    { to: '/orders', icon: <FiPackage />, label: 'My Orders' },
    { to: '/profile', icon: <FiUser />, label: 'Profile' },
    { to: '/settings', icon: <FiSettings />, label: 'Settings' }
  ];

  const links = user?.role === 'farmer' ? farmerLinks : customerLinks;

  return (
    <aside className="sidebar">
      <nav className="sidebar-nav">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}
          >
            {link.icon}
            <span>{link.label}</span>
          </NavLink>
        ))}
      </nav>
    </aside>
  );
};

export default Sidebar;
