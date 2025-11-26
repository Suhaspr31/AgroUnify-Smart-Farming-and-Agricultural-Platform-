import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../components/common/Navbar';
import Sidebar from '../components/common/Sidebar';
import Notification from '../components/common/Notification';
import './DashboardLayout.css';

const DashboardLayout = () => {
  return (
    <div className="dashboard-layout">
      <Navbar />
      <div className="hover-trigger"></div>
      <div className="dashboard-container">
        <Sidebar />
        <main className="main-content">
          <div className="dashboard-main">
            <Outlet />
          </div>
        </main>
      </div>
      <Notification />
    </div>
  );
};

export default DashboardLayout;
