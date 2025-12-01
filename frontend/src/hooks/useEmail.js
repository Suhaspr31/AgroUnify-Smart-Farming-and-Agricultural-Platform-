import { useState } from 'react';
import emailService from '../services/emailService';

export const useEmail = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const sendWelcomeEmail = async (userData) => {
    try {
      setLoading(true);
      setError(null);
      const result = await emailService.sendWelcomeEmail(userData);
      return result;
    } catch (err) {
      setError('Failed to send welcome email');
      return { success: false, message: 'Failed to send welcome email' };
    } finally {
      setLoading(false);
    }
  };

  const sendPasswordResetEmail = async (email, resetToken) => {
    try {
      setLoading(true);
      setError(null);
      const result = await emailService.sendPasswordResetEmail(email, resetToken);
      return result;
    } catch (err) {
      setError('Failed to send password reset email');
      return { success: false, message: 'Failed to send password reset email' };
    } finally {
      setLoading(false);
    }
  };

  const sendOrderConfirmationEmail = async (orderData, userEmail) => {
    try {
      setLoading(true);
      setError(null);
      const result = await emailService.sendOrderConfirmationEmail(orderData, userEmail);
      return result;
    } catch (err) {
      setError('Failed to send order confirmation email');
      return { success: false, message: 'Failed to send order confirmation email' };
    } finally {
      setLoading(false);
    }
  };

  const sendSchemeApplicationEmail = async (applicationData, userEmail) => {
    try {
      setLoading(true);
      setError(null);
      const result = await emailService.sendSchemeApplicationEmail(applicationData, userEmail);
      return result;
    } catch (err) {
      setError('Failed to send scheme application email');
      return { success: false, message: 'Failed to send scheme application email' };
    } finally {
      setLoading(false);
    }
  };

  const sendMarketAlertEmail = async (alertData, userEmail) => {
    try {
      setLoading(true);
      setError(null);
      const result = await emailService.sendMarketAlertEmail(alertData, userEmail);
      return result;
    } catch (err) {
      setError('Failed to send market alert email');
      return { success: false, message: 'Failed to send market alert email' };
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    sendWelcomeEmail,
    sendPasswordResetEmail,
    sendOrderConfirmationEmail,
    sendSchemeApplicationEmail,
    sendMarketAlertEmail
  };
};

export default useEmail;