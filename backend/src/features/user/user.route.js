const express = require('express');
const userController = require('./user.controller');
const { authenticate, authorize } = require('../../middleware/auth');
const upload = require('../../config/multer');
const { objectIdValidator } = require('../../utils/validators');
const validate = require('../../middleware/validation');

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Get current user profile
router.get('/profile', userController.getProfile);

// Update current user profile
router.put('/profile', userController.updateProfile);

// Upload avatar
router.post('/avatar', upload.single('avatar'), userController.uploadAvatar);

// Get all users (admin only)
router.get('/', authorize('admin'), userController.getAllUsers);

// Get user by ID
router.get('/:id', objectIdValidator('id'), validate, userController.getUserById);

// Update user (admin only)
router.put('/:id', authorize('admin'), objectIdValidator('id'), validate, userController.updateUser);

// Delete user (admin only)
router.delete('/:id', authorize('admin'), objectIdValidator('id'), validate, userController.deleteUser);

// Deactivate account
router.post('/deactivate', userController.deactivateAccount);

module.exports = router;
