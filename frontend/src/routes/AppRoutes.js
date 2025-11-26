import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';

// Layouts
import MainLayout from '../layouts/MainLayout';
import AuthLayout from '../layouts/AuthLayout';
import DashboardLayout from '../layouts/DashboardLayout';

// Pages
import Home from '../pages/Home';
import Login from '../pages/Auth/Login';
import Register from '../pages/Auth/Register';
import Dashboard from '../pages/Dashboard/Dashboard';
import FarmerDashboard from '../pages/Dashboard/FarmerDashboard';
import CustomerDashboard from '../pages/Dashboard/CustomerDashboard';
import AdminDashboard from '../pages/Dashboard/AdminDashboard';

// Crops
import CropList from '../pages/Crops/CropList';
import CropDetail from '../pages/Crops/CropDetail';
import CropManagement from '../pages/Crops/CropManagement';
import CropDiseaseDetector from '../pages/Crops/CropDiseaseDetector';

// Farms
import FarmList from '../pages/Farms/FarmList';
import FarmDetail from '../pages/Farms/FarmDetail';
import AddFarm from '../pages/Farms/AddFarm';

// Marketplace
import Marketplace from '../pages/Marketplace/Marketplace';
import ProductList from '../pages/Marketplace/ProductList';
import ProductDetail from '../pages/Marketplace/ProductDetail';
import Cart from '../pages/Marketplace/Cart';

// Orders
import OrderList from '../pages/Orders/OrderList';
import OrderDetail from '../pages/Orders/OrderDetail';

// Weather
import Weather from '../pages/Weather/Weather';
import WeatherDashboard from '../pages/Weather/WeatherDashboard';
import WeatherAlerts from '../pages/Weather/WeatherAlerts';

// Market Prices
import PriceTrends from '../pages/MarketPrices/PriceTrends';
import CropComparison from '../pages/MarketPrices/CropComparison';

// Other
import About from '../pages/About';
import Contact from '../pages/Contact';
import Profile from '../components/Profile';
import Settings from '../components/Settings';

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route element={<MainLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/weather" element={<Weather />} />
        <Route path="/crops" element={<CropList />} />
        <Route path="/crops/:id" element={<CropDetail />} />
        <Route path="/marketplace" element={<Marketplace />} />
        <Route path="/products" element={<ProductList />} />
        <Route path="/products/:id" element={<ProductDetail />} />
        <Route path="/prices" element={<PriceTrends />} />
        <Route path="/prices/compare" element={<CropComparison />} />
      </Route>

      {/* Auth Routes */}
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Route>

      {/* Protected Routes */}
      <Route element={<ProtectedRoute />}>
        <Route element={<DashboardLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/dashboard/farmer" element={<FarmerDashboard />} />
          <Route path="/dashboard/customer" element={<CustomerDashboard />} />
          <Route path="/dashboard/admin" element={<AdminDashboard />} />
          
          <Route path="/my-farms" element={<FarmList />} />
          <Route path="/my-farms/:id" element={<FarmDetail />} />
          <Route path="/farms/add" element={<AddFarm />} />
          
          <Route path="/my-crops" element={<CropManagement />} />
          <Route path="/crop-disease-detector" element={<CropDiseaseDetector />} />
          
          <Route path="/cart" element={<Cart />} />
          <Route path="/orders" element={<OrderList />} />
          <Route path="/orders/:id" element={<OrderDetail />} />
          
          <Route path="/weather/dashboard" element={<WeatherDashboard />} />
          <Route path="/weather/alerts" element={<WeatherAlerts />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/settings" element={<Settings />} />
        </Route>
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRoutes;
