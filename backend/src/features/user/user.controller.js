const userService = require('./user.service');
const { successResponse, errorResponse, paginatedResponse } = require('../../utils/response');
const logger = require('../../core/logger');

class UserController {
  /**
   * Get current user profile
   */
  async getProfile(req, res) {
    try {
      return successResponse(res, req.user, 'Profile retrieved successfully');
    } catch (error) {
      logger.error('Get profile error:', error);
      return errorResponse(res, error.message, 500);
    }
  }

  /**
   * Update current user profile
   */
  async updateProfile(req, res) {
    try {
      const user = await userService.updateProfile(req.user._id, req.body);
      return successResponse(res, user, 'Profile updated successfully');
    } catch (error) {
      logger.error('Update profile error:', error);
      return errorResponse(res, error.message, 400);
    }
  }

  /**
   * Upload avatar
   */
  async uploadAvatar(req, res) {
    try {
      if (!req.file) {
        return errorResponse(res, 'No file uploaded', 400);
      }

      const user = await userService.uploadAvatar(req.user._id, req.file);
      return successResponse(res, user, 'Avatar uploaded successfully');
    } catch (error) {
      logger.error('Upload avatar error:', error);
      return errorResponse(res, error.message, 400);
    }
  }

  /**
   * Get all users (admin)
   */
  async getAllUsers(req, res) {
    try {
      const { page = 1, limit = 10, role, search } = req.query;
      const result = await userService.getAllUsers({ page, limit, role, search });
      
      return paginatedResponse(
        res,
        result.users,
        page,
        limit,
        result.total,
        'Users retrieved successfully'
      );
    } catch (error) {
      logger.error('Get all users error:', error);
      return errorResponse(res, error.message, 500);
    }
  }

  /**
   * Get user by ID
   */
  async getUserById(req, res) {
    try {
      const user = await userService.getUserById(req.params.id);
      return successResponse(res, user, 'User retrieved successfully');
    } catch (error) {
      logger.error('Get user by ID error:', error);
      return errorResponse(res, error.message, 404);
    }
  }

  /**
   * Update user (admin)
   */
  async updateUser(req, res) {
    try {
      const user = await userService.updateUser(req.params.id, req.body);
      return successResponse(res, user, 'User updated successfully');
    } catch (error) {
      logger.error('Update user error:', error);
      return errorResponse(res, error.message, 400);
    }
  }

  /**
   * Delete user (admin)
   */
  async deleteUser(req, res) {
    try {
      await userService.deleteUser(req.params.id);
      return successResponse(res, null, 'User deleted successfully');
    } catch (error) {
      logger.error('Delete user error:', error);
      return errorResponse(res, error.message, 400);
    }
  }

  /**
   * Deactivate account
   */
  async deactivateAccount(req, res) {
    try {
      await userService.deactivateAccount(req.user._id);
      return successResponse(res, null, 'Account deactivated successfully');
    } catch (error) {
      logger.error('Deactivate account error:', error);
      return errorResponse(res, error.message, 400);
    }
  }
}

module.exports = new UserController();
