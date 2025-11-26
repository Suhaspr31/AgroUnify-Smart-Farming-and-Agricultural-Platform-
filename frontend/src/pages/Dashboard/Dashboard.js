import React, { useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import FarmerDashboard from './FarmerDashboard';
import CustomerDashboard from './CustomerDashboard';
import AdminDashboard from './AdminDashboard';
import './Dashboard.css';

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    // Redirect to role-specific dashboard
    switch (user.role) {
      case 'farmer':
        navigate('/dashboard/farmer');
        break;
      case 'customer':
        navigate('/dashboard/customer');
        break;
      case 'admin':
        navigate('/dashboard/admin');
        break;
      default:
        break;
    }
  }, [user, navigate]);

  if (!user) return null;

  // Render appropriate dashboard based on user role
  switch (user.role) {
    case 'farmer':
      return <FarmerDashboard />;
    case 'customer':
      return <CustomerDashboard />;
    case 'admin':
      return <AdminDashboard />;
    default:
      return <FarmerDashboard />;
  }
};

export default Dashboard;
