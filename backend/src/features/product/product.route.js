const express = require('express');
const { body } = require('express-validator');
const productController = require('./product.controller');
const { authenticate, authorize, optionalAuth } = require('../../middleware/auth');
const upload = require('../../config/multer');
const validate = require('../../middleware/validation');
const { objectIdValidator } = require('../../utils/validators');

const router = express.Router();

// Public routes
router.get('/', optionalAuth, productController.getAllProducts);
router.get('/:id', optionalAuth, objectIdValidator('id'), validate, productController.getProductById);

// Protected routes
router.use(authenticate);

// Create product (vendors only)
router.post(
  '/',
  authorize('vendor', 'admin'),
  upload.array('images', 5),
  [
    body('name').trim().notEmpty().withMessage('Product name is required'),
    body('description').trim().notEmpty().withMessage('Description is required'),
    body('category').isIn(['seeds', 'fertilizers', 'pesticides', 'equipment', 'tools', 'produce']),
    body('price').isNumeric().withMessage('Price must be a number'),
    body('unit').notEmpty().withMessage('Unit is required'),
    body('stock').isNumeric().withMessage('Stock must be a number'),
    validate
  ],
  productController.createProduct
);

// Update product
router.put(
  '/:id',
  authorize('vendor', 'admin'),
  upload.array('images', 5),
  objectIdValidator('id'),
  validate,
  productController.updateProduct
);

// Delete product
router.delete(
  '/:id',
  authorize('vendor', 'admin'),
  objectIdValidator('id'),
  validate,
  productController.deleteProduct
);

// Add review
router.post(
  '/:id/reviews',
  objectIdValidator('id'),
  [
    body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
    body('comment').optional().trim(),
    validate
  ],
  productController.addReview
);

module.exports = router;
