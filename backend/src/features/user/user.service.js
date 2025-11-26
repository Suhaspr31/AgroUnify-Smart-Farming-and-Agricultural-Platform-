const User = require('./user.model');
const fs = require('fs').promises;
const path = require('path');

class UserService {
  /**
   * Update user profile
   */
  async updateProfile(userId, updateData) {
    const allowedFields = ['name', 'phone', 'location', 'preferences'];
    const filteredData = {};

    // Filter allowed fields
    Object.keys(updateData).forEach(key => {
      if (allowedFields.includes(key)) {
        filteredData[key] = updateData[key];
      }
    });

    const user = await User.findByIdAndUpdate(
      userId,
      filteredData,
      { new: true, runValidators: true }
    );

    if (!user) {
      throw new Error('User not found');
    }

    return user;
  }

  /**
   * Upload avatar
   */
  async uploadAvatar(userId, file) {
    const user = await User.findById(userId);
    
    if (!user) {
      throw new Error('User not found');
    }

    // Delete old avatar if exists
    if (user.avatar) {
      const oldPath = path.join('uploads/profiles', user.avatar);
      try {
        await fs.unlink(oldPath);
      } catch (error) {
        // Ignore if file doesn't exist
      }
    }

    // Update avatar
    user.avatar = file.filename;
    await user.save();

    return user;
  }

  /**
   * Get all users with pagination
   */
  async getAllUsers({ page = 1, limit = 10, role, search }) {
    const query = {};

    if (role) {
      query.role = role;
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (page - 1) * limit;

    const [users, total] = await Promise.all([
      User.find(query)
        .select('-password')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      User.countDocuments(query)
    ]);

    return { users, total };
  }

  /**
   * Get user by ID
   */
  async getUserById(userId) {
    const user = await User.findById(userId).select('-password');
    
    if (!user) {
      throw new Error('User not found');
    }

    return user;
  }

  /**
   * Update user (admin)
   */
  async updateUser(userId, updateData) {
    const user = await User.findByIdAndUpdate(
      userId,
      updateData,
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      throw new Error('User not found');
    }

    return user;
  }

  /**
   * Delete user
   */
  async deleteUser(userId) {
    const user = await User.findByIdAndDelete(userId);
    
    if (!user) {
      throw new Error('User not found');
    }

    // Delete avatar if exists
    if (user.avatar) {
      const avatarPath = path.join('uploads/profiles', user.avatar);
      try {
        await fs.unlink(avatarPath);
      } catch (error) {
        // Ignore if file doesn't exist
      }
    }

    return user;
  }

  /**
   * Deactivate account
   */
  async deactivateAccount(userId) {
    const user = await User.findByIdAndUpdate(
      userId,
      { isActive: false },
      { new: true }
    );

    if (!user) {
      throw new Error('User not found');
    }

    return user;
  }
}

module.exports = new UserService();
