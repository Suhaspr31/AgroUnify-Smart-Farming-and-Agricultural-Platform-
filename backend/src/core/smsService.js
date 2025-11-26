const axios = require('axios');
const logger = require('./logger');

class SMSService {
  constructor() {
    this.apiKey = process.env.SMS_API_KEY;
    this.senderId = process.env.SMS_SENDER_ID || 'AGROUNIFY';
  }

  /**
   * Send SMS (stub implementation - integrate with actual SMS provider)
   */
  async sendSMS(phone, message) {
    try {
      // This is a placeholder. Replace with actual SMS API integration
      logger.info(`SMS would be sent to ${phone}: ${message}`);
      
      // Example integration (uncomment and modify for actual provider):
      /*
      const response = await axios.post('https://sms-provider-api.com/send', {
        apiKey: this.apiKey,
        to: phone,
        from: this.senderId,
        message: message
      });
      return { success: true, response: response.data };
      */

      return { success: true, message: 'SMS sent (stub)' };
    } catch (error) {
      logger.error('SMS sending failed:', error);
      throw error;
    }
  }

  /**
   * Send OTP
   */
  async sendOTP(phone, otp) {
    const message = `Your AgroUnify OTP is: ${otp}. Valid for 10 minutes.`;
    return this.sendSMS(phone, message);
  }

  /**
   * Send order notification
   */
  async sendOrderNotification(phone, orderId) {
    const message = `Your order ${orderId} has been confirmed. Thank you for shopping with AgroUnify!`;
    return this.sendSMS(phone, message);
  }
}

module.exports = new SMSService();
