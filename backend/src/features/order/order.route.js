const express = require('express');
const { body } = require('express-validator');
const orderController = require('./order.controller');
const { authenticate, authorize } = require('../../middleware/auth');
const validate = require('../../middleware/validation');
const { objectIdValidator } = require('../../utils/validators');

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Create order
router.post(
  '/',
  [
    body('items').isArray({ min: 1 }).withMessage('Order must have at least one item'),
    body('items.*.product').isMongoId().withMessage('Valid product ID required'),
    body('items.*.quantity').isInt({ min: 1 }).withMessage('Quantity must be at least 1'),
    body('shippingAddress.name').notEmpty().withMessage('Recipient name is required'),
    body('shippingAddress.phone').matches(/^[6-9]\d{9}$/).withMessage('Valid phone required'),
    body('shippingAddress.addressLine1').notEmpty().withMessage('Address is required'),
    body('shippingAddress.city').notEmpty().withMessage('City is required'),
    body('shippingAddress.state').notEmpty().withMessage('State is required'),
    body('shippingAddress.pincode').matches(/^\d{6}$/).withMessage('Valid pincode required'),
    body('paymentMethod').isIn(['cod', 'online', 'upi']).withMessage('Invalid payment method'),
    validate
  ],
  orderController.createOrder
);

// Get all orders (customer's orders)
router.get('/', orderController.getAllOrders);

// Get all orders (admin - all orders)
router.get('/admin/all', authorize('admin'), orderController.getAllOrdersAdmin);

// Get order by ID
router.get('/:id', objectIdValidator('id'), validate, orderController.getOrderById);

// Update order status (admin/vendor)
router.patch(
  '/:id/status',
  authorize('admin', 'vendor'),
  objectIdValidator('id'),
  [
    body('status').isIn(['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled']),
    body('note').optional().trim(),
    validate
  ],
  orderController.updateOrderStatus
);

// Cancel order
router.post(
  '/:id/cancel',
  objectIdValidator('id'),
  [
    body('reason').optional().trim(),
    validate
  ],
  orderController.cancelOrder
);

// Update payment status
router.patch(
  '/:id/payment',
  objectIdValidator('id'),
  [
    body('paymentStatus').isIn(['pending', 'completed', 'failed', 'refunded']),
    body('transactionId').optional().trim(),
    validate
  ],
  orderController.updatePaymentStatus
);

module.exports = router;
