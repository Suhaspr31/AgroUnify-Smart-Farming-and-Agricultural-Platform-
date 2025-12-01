const express = require('express');
const {
  createOrder,
  verifyPayment,
  getPayment,
  refundPayment,
  checkFraud,
} = require('./paymentController');

const router = express.Router();

// Fraud detection
router.post('/check-fraud', checkFraud);

// Create payment order
router.post('/create-order', createOrder);

// Verify payment
router.post('/verify', verifyPayment);

// Get payment details
router.get('/:paymentId', getPayment);

// Refund payment
router.post('/:paymentId/refund', refundPayment);

module.exports = router;