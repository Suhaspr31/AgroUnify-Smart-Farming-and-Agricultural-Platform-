import React, { useState } from 'react';
import paymentService from '../services/paymentService';
import './Payment.css';

const Payment = () => {
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState('');

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handlePayment = async () => {
    if (!amount || amount <= 0) {
      alert('Please enter a valid amount');
      return;
    }

    setLoading(true);
    setPaymentStatus('Creating payment order...');

    try {
      // Load Razorpay script
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        alert('Razorpay SDK failed to load. Please check your internet connection.');
        setLoading(false);
        return;
      }

      // Create payment order
      const orderResponse = await paymentService.createOrder(
        parseFloat(amount),
        'INR',
        `order_${Date.now()}`,
        { description: 'AgriUnify Service Payment' }
      );

      if (!orderResponse.success) {
        alert('Failed to create payment order: ' + orderResponse.message);
        setLoading(false);
        return;
      }

      const { order, key } = orderResponse.data;

      setPaymentStatus('Opening payment gateway...');

      // Initialize Razorpay checkout
      const options = {
        key,
        amount: order.amount,
        currency: order.currency,
        name: 'AgriUnify',
        description: 'Agricultural Services Payment',
        order_id: order.id,
        handler: async function (response) {
          // Verify payment on backend
          const verificationResponse = await paymentService.verifyPayment({
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
          });

          if (verificationResponse.success) {
            setPaymentStatus('Payment successful! ✅');
            alert('Payment successful! Your transaction has been completed.');
          } else {
            setPaymentStatus('Payment verification failed ❌');
            alert('Payment verification failed. Please contact support.');
          }
          setLoading(false);
        },
        prefill: {
          name: 'Farmer Name',
          email: 'farmer@example.com',
          contact: '9999999999',
        },
        theme: {
          color: '#4CAF50',
        },
        modal: {
          ondismiss: function() {
            setPaymentStatus('Payment cancelled');
            setLoading(false);
          }
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.open();

    } catch (error) {
      console.error('Payment error:', error);
      alert('Payment failed. Please try again.');
      setPaymentStatus('Payment failed ❌');
      setLoading(false);
    }
  };

  return (
    <div className="payment-container">
      <div className="payment-card">
        <h2>💳 Make Payment</h2>
        <p>Secure payment processing for AgriUnify services</p>

        <div className="payment-form">
          <div className="form-group">
            <label htmlFor="amount">Amount (₹)</label>
            <input
              type="number"
              id="amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Enter amount"
              min="1"
              step="0.01"
              disabled={loading}
            />
          </div>

          <button
            className="payment-btn"
            onClick={handlePayment}
            disabled={loading || !amount}
          >
            {loading ? (
              <>
                <span className="spinner"></span>
                Processing...
              </>
            ) : (
              <>
                💳 Pay ₹{amount || '0'}
              </>
            )}
          </button>
        </div>

        {paymentStatus && (
          <div className={`payment-status ${paymentStatus.includes('successful') ? 'success' : paymentStatus.includes('failed') ? 'error' : 'info'}`}>
            {paymentStatus}
          </div>
        )}

        <div className="payment-info">
          <h3>🔒 Secure Payment</h3>
          <ul>
            <li>✅ SSL Encrypted</li>
            <li>✅ Razorpay Integration</li>
            <li>✅ Multiple Payment Methods</li>
            <li>✅ Instant Verification</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Payment;