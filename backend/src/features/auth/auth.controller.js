const authService = require('./auth.service');
const { successResponse, errorResponse } = require('../../utils/response');
const logger = require('../../core/logger');

class AuthController {
  /**
   * Register new user
   */
  async register(req, res, next) {
    try {
      const result = await authService.register(req.body);
      return successResponse(res, result, 'Registration successful', 201);
    } catch (error) {
      logger.error('Registration error:', error);
      return errorResponse(res, error.message, 400);
    }
  }

  /**
   * Login user
   */
  async login(req, res, next) {
    try {
      const result = await authService.login(req.body);
      return successResponse(res, result, 'Login successful');
    } catch (error) {
      logger.error('Login error:', error);
      return errorResponse(res, error.message, 401);
    }
  }

  /**
   * Refresh access token
   */
  async refreshToken(req, res, next) {
    try {
      const { refreshToken } = req.body;
      
      if (!refreshToken) {
        return errorResponse(res, 'Refresh token is required', 400);
      }

      const result = await authService.refreshToken(refreshToken);
      return successResponse(res, result, 'Token refreshed successfully');
    } catch (error) {
      logger.error('Token refresh error:', error);
      return errorResponse(res, error.message, 401);
    }
  }

  /**
   * Logout user
   */
  async logout(req, res, next) {
    try {
      // Token blacklisting can be implemented here if needed
      return successResponse(res, null, 'Logout successful');
    } catch (error) {
      logger.error('Logout error:', error);
      return errorResponse(res, error.message, 500);
    }
  }

  /**
   * Get current user
   */
  async getCurrentUser(req, res, next) {
    try {
      return successResponse(res, req.user, 'User retrieved successfully');
    } catch (error) {
      logger.error('Get current user error:', error);
      return errorResponse(res, error.message, 500);
    }
  }

  /**
   * Forgot password
   */
  async forgotPassword(req, res, next) {
    try {
      const { email } = req.body;
      await authService.forgotPassword(email);
      return successResponse(res, null, 'Password reset link sent to your email');
    } catch (error) {
      logger.error('Forgot password error:', error);
      return errorResponse(res, error.message, 400);
    }
  }

  /**
   * Reset password
   */
  async resetPassword(req, res, next) {
    try {
      const { token, password } = req.body;
      await authService.resetPassword(token, password);
      return successResponse(res, null, 'Password reset successful');
    } catch (error) {
      logger.error('Reset password error:', error);
      return errorResponse(res, error.message, 400);
    }
  }

  /**
   * Change password
   */
  async changePassword(req, res, next) {
    try {
      const { currentPassword, newPassword } = req.body;
      await authService.changePassword(req.user._id, currentPassword, newPassword);
      return successResponse(res, null, 'Password changed successfully');
    } catch (error) {
      logger.error('Change password error:', error);
      return errorResponse(res, error.message, 400);
    }
  }
}

module.exports = new AuthController();
