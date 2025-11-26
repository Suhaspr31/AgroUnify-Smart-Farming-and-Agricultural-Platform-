import React, { useState, useRef } from 'react';
import { useAuth } from '../hooks/useAuth';
import { FiUser, FiMail, FiPhone, FiMapPin, FiEdit, FiLogOut, FiCamera } from 'react-icons/fi';
import authService from '../services/authService';
import './Profile.css';

const Profile = () => {
  const { user, updateUser, logout } = useAuth();

  // For dp preview
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    location: user?.location || ''
  });
  const [avatarPreview, setAvatarPreview] = useState(user?.avatarUrl || null);
  const [avatarFile, setAvatarFile] = useState(null);
  const fileInputRef = useRef();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  // Save profile
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // First upload avatar if selected
      if (avatarFile) {
        const avatarResult = await authService.uploadAvatar(avatarFile);
        if (!avatarResult.success) {
          alert(avatarResult.message || 'Failed to upload avatar');
          return;
        }
        // Update avatar preview immediately after successful upload
        if (avatarResult.user?.avatarUrl) {
          setAvatarPreview(avatarResult.user.avatarUrl);
        }
      }

      // Then update profile data
      const result = await updateUser(formData);
      if (result.success) {
        setIsEditing(false);
        setAvatarFile(null);
        // Update avatar preview from the updated user data
        if (result.user?.avatarUrl) {
          setAvatarPreview(result.user.avatarUrl);
        }
      } else {
        alert(result.message || 'Failed to update profile');
      }
    } catch (error) {
      console.error('Profile update error:', error);
      alert('Failed to update profile');
    }
  };

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to log out?')) logout();
  };

  // Open file dialog
  const handleAvatarClick = () => fileInputRef.current?.click();

  return (
    <div className="profile-page">
      {/* Header with Avatar and Info */}
      <div className="profile-header">
        <div className="profile-avatar-container">
          <div className="profile-avatar" onClick={isEditing ? handleAvatarClick : undefined}>
            {avatarPreview ? (
              <img src={avatarPreview} alt="Profile"/>
            ) : (
              <FiUser />
            )}
            {isEditing && (
              <>
                <button type="button" className="profile-avatar-edit" onClick={handleAvatarClick} aria-label="Change Profile Photo">
                  <FiCamera />
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  style={{ display: 'none' }}
                  onChange={handleAvatarChange}
                />
              </>
            )}
          </div>
          <div className="profile-avatar-label">
            {isEditing && <span>Change Photo</span>}
          </div>
        </div>
        <div className="profile-info">
          <h2>{user?.name}</h2>
          <div className="profile-role">{user?.role}</div>
          <div className="profile-action-buttons">
            {!isEditing ? (
              <button className="btn btn-edit" onClick={() => setIsEditing(true)}>
                <FiEdit /> Edit Profile
              </button>
            ) : (
              <button className="btn btn-cancel" onClick={() => setIsEditing(false)}>
                Cancel
              </button>
            )}
            <button className="btn btn-logout" onClick={handleLogout}>
              <FiLogOut /> Logout
            </button>
          </div>
        </div>
      </div>

      {/* Edit Mode */}
      {isEditing ? (
        <form className="profile-form" onSubmit={handleSubmit} encType="multipart/form-data">
          <div className="form-group">
            <label htmlFor="name">Name</label>
            <div className="form-input">
              <FiUser />
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                autoComplete="name"
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="email">Email</label>
            <div className="form-input">
              <FiMail />
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                autoComplete="email"
                required
                readOnly // usually email can't be changed
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="phone">Phone</label>
            <div className="form-input">
              <FiPhone />
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                autoComplete="phone"
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="location">Location</label>
            <div className="form-input">
              <FiMapPin />
              <input
                type="text"
                id="location"
                name="location"
                value={formData.location}
                onChange={handleChange}
                autoComplete="address-level1"
              />
            </div>
          </div>

          <div className="profile-form-actions">
            <button className="btn btn-save" type="submit">
              Save Changes
            </button>
          </div>
        </form>
      ) : (
        // Profile Details
        <div className="profile-details">
          <div className="detail-item">
            <FiMail />
            <div>
              <span className="detail-label">Email</span>
              <span className="detail-value">{user?.email}</span>
            </div>
          </div>
          <div className="detail-item">
            <FiPhone />
            <div>
              <span className="detail-label">Phone</span>
              <span className="detail-value">{user?.phone}</span>
            </div>
          </div>
          <div className="detail-item">
            <FiMapPin />
            <div>
              <span className="detail-label">Location</span>
              <span className="detail-value">{user?.location}</span>
            </div>
          </div>
          <div className="detail-item">
            <FiUser />
            <div>
              <span className="detail-label">Role</span>
              <span className="detail-value">{user?.role}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
