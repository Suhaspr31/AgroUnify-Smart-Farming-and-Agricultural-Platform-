import axios from 'axios';

const SENDGRID_API_KEY = process.env.REACT_APP_SENDGRID_API_KEY;
const SENDGRID_URL = 'https://api.sendgrid.com/v3/mail/send';

const emailClient = axios.create({
  baseURL: SENDGRID_URL,
  headers: {
    'Authorization': `Bearer ${SENDGRID_API_KEY}`,
    'Content-Type': 'application/json'
  },
  timeout: 10000
});

export const emailService = {
  sendWelcomeEmail: async (userData) => {
    try {
      const emailData = {
        personalizations: [{
          to: [{ email: userData.email }],
          subject: 'Welcome to AgriUnify - Your Farming Companion!'
        }],
        from: { email: 'noreply@agriunify.com', name: 'AgriUnify Team' },
        content: [{
          type: 'text/html',
          value: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h1 style="color: #4CAF50;">Welcome to AgriUnify!</h1>
              <p>Dear ${userData.name},</p>
              <p>Thank you for joining AgriUnify, your comprehensive farming companion platform.</p>
              <p>With AgriUnify, you can:</p>
              <ul>
                <li>Manage your farms and crops</li>
                <li>Track market prices and trends</li>
                <li>Get weather forecasts and alerts</li>
                <li>Access government schemes and subsidies</li>
                <li>Connect with other farmers and buyers</li>
              </ul>
              <p>Get started by exploring your dashboard and adding your first farm!</p>
              <p>Best regards,<br>The AgriUnify Team</p>
            </div>
          `
        }]
      };

      const response = await emailClient.post('', emailData);
      return { success: true, messageId: response.data };
    } catch (error) {
      console.error('SendGrid welcome email error:', error);
      return {
        success: false,
        message: error.response?.data?.errors?.[0]?.message || 'Failed to send welcome email'
      };
    }
  },

  sendPasswordResetEmail: async (email, resetToken) => {
    try {
      const resetLink = `${window.location.origin}/reset-password?token=${resetToken}`;

      const emailData = {
        personalizations: [{
          to: [{ email }],
          subject: 'Reset Your AgriUnify Password'
        }],
        from: { email: 'noreply@agriunify.com', name: 'AgriUnify Support' },
        content: [{
          type: 'text/html',
          value: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #2196F3;">Password Reset Request</h2>
              <p>You requested a password reset for your AgriUnify account.</p>
              <p>Click the link below to reset your password:</p>
              <a href="${resetLink}" style="background: #4CAF50; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 16px 0;">Reset Password</a>
              <p>This link will expire in 1 hour for security reasons.</p>
              <p>If you didn't request this reset, please ignore this email.</p>
              <p>Best regards,<br>The AgriUnify Team</p>
            </div>
          `
        }]
      };

      await emailClient.post('', emailData);
      return { success: true };
    } catch (error) {
      console.error('SendGrid password reset email error:', error);
      return {
        success: false,
        message: error.response?.data?.errors?.[0]?.message || 'Failed to send reset email'
      };
    }
  },

  sendOrderConfirmationEmail: async (orderData, userEmail) => {
    try {
      const emailData = {
        personalizations: [{
          to: [{ email: userEmail }],
          subject: `Order Confirmation - Order #${orderData.orderId}`
        }],
        from: { email: 'orders@agriunify.com', name: 'AgriUnify Orders' },
        content: [{
          type: 'text/html',
          value: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #4CAF50;">Order Confirmation</h2>
              <p>Thank you for your order! Here are the details:</p>
              <div style="background: #f9f9f9; padding: 16px; border-radius: 8px; margin: 16px 0;">
                <p><strong>Order ID:</strong> ${orderData.orderId}</p>
                <p><strong>Total Amount:</strong> ₹${orderData.totalAmount}</p>
                <p><strong>Status:</strong> ${orderData.status}</p>
              </div>
              <p>You will receive updates on your order status via email and SMS.</p>
              <p>Best regards,<br>The AgriUnify Team</p>
            </div>
          `
        }]
      };

      await emailClient.post('', emailData);
      return { success: true };
    } catch (error) {
      console.error('SendGrid order confirmation email error:', error);
      return {
        success: false,
        message: error.response?.data?.errors?.[0]?.message || 'Failed to send order confirmation'
      };
    }
  },

  sendSchemeApplicationEmail: async (applicationData, userEmail) => {
    try {
      const emailData = {
        personalizations: [{
          to: [{ email: userEmail }],
          subject: `Scheme Application Submitted - ${applicationData.schemeName}`
        }],
        from: { email: 'schemes@agriunify.com', name: 'AgriUnify Schemes' },
        content: [{
          type: 'text/html',
          value: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #2196F3;">Scheme Application Submitted</h2>
              <p>Your application for <strong>${applicationData.schemeName}</strong> has been successfully submitted.</p>
              <div style="background: #f9f9f9; padding: 16px; border-radius: 8px; margin: 16px 0;">
                <p><strong>Application ID:</strong> ${applicationData.applicationId}</p>
                <p><strong>Scheme:</strong> ${applicationData.schemeName}</p>
                <p><strong>Status:</strong> Under Review</p>
                <p><strong>Submitted on:</strong> ${new Date().toLocaleDateString()}</p>
              </div>
              <p>You will be notified once your application is processed. This usually takes 7-10 working days.</p>
              <p>Best regards,<br>The AgriUnify Team</p>
            </div>
          `
        }]
      };

      await emailClient.post('', emailData);
      return { success: true };
    } catch (error) {
      console.error('SendGrid scheme application email error:', error);
      return {
        success: false,
        message: error.response?.data?.errors?.[0]?.message || 'Failed to send application confirmation'
      };
    }
  },

  sendMarketAlertEmail: async (alertData, userEmail) => {
    try {
      const emailData = {
        personalizations: [{
          to: [{ email: userEmail }],
          subject: `Market Alert: ${alertData.commodity} Price Update`
        }],
        from: { email: 'alerts@agriunify.com', name: 'AgriUnify Market Alerts' },
        content: [{
          type: 'text/html',
          value: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #FF9800;">Market Price Alert</h2>
              <div style="background: #fff3e0; padding: 16px; border-radius: 8px; margin: 16px 0;">
                <h3>${alertData.commodity}</h3>
                <p><strong>Current Price:</strong> ₹${alertData.currentPrice}</p>
                <p><strong>Change:</strong> <span style="color: ${alertData.changePercent > 0 ? '#4CAF50' : '#F44336'};">${alertData.changePercent > 0 ? '+' : ''}${alertData.changePercent}%</span></p>
                <p><strong>Recommendation:</strong> ${alertData.recommendation}</p>
              </div>
              <p>Stay updated with real-time market prices on the AgriUnify platform.</p>
              <p>Best regards,<br>The AgriUnify Market Team</p>
            </div>
          `
        }]
      };

      await emailClient.post('', emailData);
      return { success: true };
    } catch (error) {
      console.error('SendGrid market alert email error:', error);
      return {
        success: false,
        message: error.response?.data?.errors?.[0]?.message || 'Failed to send market alert'
      };
    }
  }
};

export default emailService;