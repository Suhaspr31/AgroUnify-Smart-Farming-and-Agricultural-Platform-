import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { FiLock, FiBell, FiSun, FiMoon, FiEyeOff, FiTrash2, FiSave, FiUserCheck } from 'react-icons/fi';
import './Settings.css';

const Settings = () => {
  const { user, deleteUser } = useAuth();
  
  // Theme preference
  const [theme, setTheme] = useState('light');
  
  // Notification preference
  const [notifications, setNotifications] = useState({
    orderUpdates: true,
    promoOffers: false,
    important: true,
  });

  const [showPassword, setShowPassword] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(false);

  // Change Password Demo State (replace with actual logic if backend available)
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({ ...prev, [name]: value }));
  };

  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    // TODO: Integrate with backend
    alert('Password changed successfully!');
    setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
  };

  // Theme toggle
  const handleThemeChange = (newTheme) => setTheme(newTheme);

  // Notification preference toggle
  const handleNotifChange = (field) => {
    setNotifications(prev => ({ ...prev, [field]: !prev[field] }));
  };

  // Account deletion (confirmation & action)
  const handleDeleteAccount = () => {
    setDeleteConfirm(false);
    if (window.confirm('This will permanently delete your account and all data. Proceed?')) {
      deleteUser();
    }
  };

  return (
    <div className="settings-page">
      <h1>Account Settings</h1>
      <div className="settings-section">
        <h2><FiUserCheck /> Profile Details</h2>
        <div className="settings-details-row">
          <div><span>Name:</span> {user?.name}</div>
          <div><span>Email:</span> {user?.email}</div>
          <div><span>Phone:</span> {user?.phone}</div>
          <div><span>Location:</span> {user?.location}</div>
          <div><span>Role:</span> {user?.role}</div>
        </div>
      </div>

      <div className="settings-section">
        <h2><FiLock /> Change Password</h2>
        <form className="settings-form" onSubmit={handlePasswordSubmit} autoComplete="off">
          <div className="settings-form-row">
            <label>
              Current Password
              <input
                type={showPassword ? 'text' : 'password'}
                name="currentPassword"
                value={passwordData.currentPassword}
                onChange={handlePasswordChange}
                autoComplete="off"
                required
              />
            </label>
          </div>
          <div className="settings-form-row">
            <label>
              New Password
              <input
                type={showPassword ? 'text' : 'password'}
                name="newPassword"
                value={passwordData.newPassword}
                onChange={handlePasswordChange}
                autoComplete="off"
                required
              />
            </label>
          </div>
          <div className="settings-form-row">
            <label>
              Confirm Password
              <input
                type={showPassword ? 'text' : 'password'}
                name="confirmPassword"
                value={passwordData.confirmPassword}
                onChange={handlePasswordChange}
                autoComplete="off"
                required
              />
            </label>
          </div>
          <div className="settings-form-actions">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setShowPassword(!showPassword)}
            >
              <FiEyeOff /> {showPassword ? 'Hide' : 'Show'} Password
            </button>
            <button type="submit" className="btn btn-primary">
              <FiSave /> Update Password
            </button>
          </div>
        </form>
      </div>

      <div className="settings-section">
        <h2><FiBell /> Notification Preferences</h2>
        <div className="settings-switch-row">
          <label>
            <input
              type="checkbox"
              checked={notifications.orderUpdates}
              onChange={() => handleNotifChange('orderUpdates')}
            />
            <span>Order Updates</span>
          </label>
          <label>
            <input
              type="checkbox"
              checked={notifications.promoOffers}
              onChange={() => handleNotifChange('promoOffers')}
            />
            <span>Promotional Offers</span>
          </label>
          <label>
            <input
              type="checkbox"
              checked={notifications.important}
              onChange={() => handleNotifChange('important')}
            />
            <span>Important Alerts</span>
          </label>
        </div>
      </div>

      <div className="settings-section">
        <h2><FiSun /> Appearance</h2>
        <div className="settings-theme-row">
          <button
            className={`theme-btn ${theme === 'light' ? 'active' : ''}`}
            onClick={() => handleThemeChange('light')}
          >
            <FiSun /> Light Mode
          </button>
          <button
            className={`theme-btn ${theme === 'dark' ? 'active' : ''}`}
            onClick={() => handleThemeChange('dark')}
          >
            <FiMoon /> Dark Mode
          </button>
        </div>
      </div>

      <div className="settings-section danger">
        <h2><FiTrash2 /> Danger Zone</h2>
        <p>This action cannot be undone. Proceed with caution.</p>
        <div>
          <button className="btn btn-danger" onClick={() => setDeleteConfirm(true)}>
            <FiTrash2 /> Delete Account
          </button>
          {deleteConfirm && (
            <button className="btn btn-warning" onClick={handleDeleteAccount}>
              Confirm Delete
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Settings;
