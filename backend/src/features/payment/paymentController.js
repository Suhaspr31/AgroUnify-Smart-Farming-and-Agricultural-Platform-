const Razorpay = require('razorpay');
const crypto = require('crypto');
const logger = require('../../core/logger');
const fraudService = require('./fraud.service');

// Initialize Razorpay only if credentials are provided
let razorpay = null;
if (process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET) {
  razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });
  logger.info('Razorpay initialized successfully');
} else {
  logger.warn('Razorpay credentials not configured. Payment functionality will be disabled.');
}

// Create payment order with fraud check
const createOrder = async (req, res) => {
  try {
    if (!razorpay) {
      return res.status(503).json({
        success: false,
        message: 'Payment service is not configured',
      });
    }

    const { amount, currency = 'INR', receipt, notes, transactionData } = req.body;

    // Perform fraud detection if transaction data is provided
    if (transactionData) {
      const fraudCheck = await fraudService.comprehensiveFraudCheck(
        { ...transactionData, amount, timestamp: new Date() },
        req.user ? await getUserTransactionHistory(req.user._id) : []
      );

      if (fraudCheck.action === 'block') {
        logger.warn(`Payment blocked due to fraud detection: ${fraudCheck.overallRisk}`, { service: 'payment' });
        return res.status(403).json({
          success: false,
          message: 'Payment blocked due to security concerns',
          fraudCheck: {
            risk: fraudCheck.overallRisk,
            reasons: fraudCheck.details
          }
        });
      }

      if (fraudCheck.action === 'challenge') {
        logger.info(`Payment challenged for additional verification`, { service: 'payment' });
        // In a real implementation, you might trigger additional verification here
      }
    }

    const options = {
      amount: amount * 100, // Razorpay expects amount in paisa
      currency,
      receipt,
      notes,
    };

    const order = await razorpay.orders.create(options);

    logger.info(`Payment order created: ${order.id}`, { service: 'payment' });

    res.status(200).json({
      success: true,
      order,
      key: process.env.RAZORPAY_KEY_ID,
      fraudCheck: transactionData ? 'performed' : 'skipped'
    });
  } catch (error) {
    logger.error('Error creating payment order:', error, { service: 'payment' });
    res.status(500).json({
      success: false,
      message: 'Failed to create payment order',
      error: error.message,
    });
  }
};

// Verify payment
const verifyPayment = async (req, res) => {
  try {
    if (!razorpay) {
      return res.status(503).json({
        success: false,
        message: 'Payment service is not configured',
      });
    }

    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    // Create expected signature
    const sign = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSign = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(sign.toString())
      .digest('hex');

    if (razorpay_signature === expectedSign) {
      // Payment verified successfully
      logger.info(`Payment verified: ${razorpay_payment_id}`, { service: 'payment' });

      res.status(200).json({
        success: true,
        message: 'Payment verified successfully',
        paymentId: razorpay_payment_id,
      });
    } else {
      logger.warn(`Payment verification failed: ${razorpay_payment_id}`, { service: 'payment' });
      res.status(400).json({
        success: false,
        message: 'Payment verification failed',
      });
    }
  } catch (error) {
    logger.error('Error verifying payment:', error, { service: 'payment' });
    res.status(500).json({
      success: false,
      message: 'Payment verification error',
      error: error.message,
    });
  }
};

// Get payment details
const getPayment = async (req, res) => {
  try {
    if (!razorpay) {
      return res.status(503).json({
        success: false,
        message: 'Payment service is not configured',
      });
    }

    const { paymentId } = req.params;

    const payment = await razorpay.payments.fetch(paymentId);

    res.status(200).json({
      success: true,
      payment,
    });
  } catch (error) {
    logger.error('Error fetching payment:', error, { service: 'payment' });
    res.status(500).json({
      success: false,
      message: 'Failed to fetch payment details',
      error: error.message,
    });
  }
};

// Refund payment
const refundPayment = async (req, res) => {
  try {
    if (!razorpay) {
      return res.status(503).json({
        success: false,
        message: 'Payment service is not configured',
      });
    }

    const { paymentId } = req.params;
    const { amount, notes } = req.body;

    const refund = await razorpay.payments.refund(paymentId, {
      amount: amount * 100, // Convert to paisa
      notes,
    });

    logger.info(`Payment refunded: ${refund.id}`, { service: 'payment' });

    res.status(200).json({
      success: true,
      refund,
    });
  } catch (error) {
    logger.error('Error processing refund:', error, { service: 'payment' });
    res.status(500).json({
      success: false,
      message: 'Failed to process refund',
      error: error.message,
    });
  }
};

// Helper function to get user transaction history (simplified)
const getUserTransactionHistory = async (userId) => {
  // In a real implementation, you'd query the database for user's transaction history
  // For now, return empty array
  return [];
};

// Fraud detection endpoint
const checkFraud = async (req, res) => {
  try {
    const { transactionData, userHistory = [] } = req.body;

    if (!transactionData) {
      return res.status(400).json({
        success: false,
        message: 'Transaction data is required'
      });
    }

    const fraudCheck = await fraudService.comprehensiveFraudCheck(transactionData, userHistory);

    res.status(200).json({
      success: true,
      fraudCheck
    });
  } catch (error) {
    logger.error('Error checking fraud:', error, { service: 'payment' });
    res.status(500).json({
      success: false,
      message: 'Fraud check failed',
      error: error.message,
    });
  }
};

module.exports = {
  createOrder,
  verifyPayment,
  getPayment,
  refundPayment,
  checkFraud,
};