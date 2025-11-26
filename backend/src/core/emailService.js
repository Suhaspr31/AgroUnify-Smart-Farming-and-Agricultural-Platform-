const nodemailer = require('nodemailer');
const logger = require('./logger');

class EmailService {
  constructor() {
    // Skip email configuration if credentials are not set
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
      console.warn('Email credentials not configured. Email functionality will be disabled.');
      this.transporter = null;
      return;
    }

    this.transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
      }
    });
  }

  /**
    * Send email
    */
   async sendEmail({ to, subject, text, html }) {
     if (!this.transporter) {
       logger.warn('Email service not configured. Skipping email send.');
       return { success: false, message: 'Email service not configured' };
     }

     try {
       const mailOptions = {
         from: process.env.EMAIL_FROM,
         to,
         subject,
         text,
         html
       };

       const info = await this.transporter.sendMail(mailOptions);
       logger.info(`Email sent: ${info.messageId}`);
       return { success: true, messageId: info.messageId };
     } catch (error) {
       logger.error('Email sending failed:', error);
       throw error;
     }
   }

  /**
   * Send welcome email
   */
  async sendWelcomeEmail(user) {
    const subject = 'Welcome to AgroUnify!';
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #2ecc71;">Welcome to AgroUnify!</h1>
        <p>Hi ${user.name},</p>
        <p>Thank you for joining AgroUnify. We're excited to have you as part of our farming community.</p>
        <p>Get started by:</p>
        <ul>
          <li>Adding your farms</li>
          <li>Monitoring your crops</li>
          <li>Exploring the marketplace</li>
        </ul>
        <p>If you have any questions, feel free to reach out to our support team.</p>
        <p>Best regards,<br>The AgroUnify Team</p>
      </div>
    `;

    return this.sendEmail({
      to: user.email,
      subject,
      html
    });
  }

  /**
   * Send password reset email
   */
  async sendPasswordResetEmail(user, resetToken) {
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
    const subject = 'Password Reset Request';
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #2ecc71;">Password Reset</h1>
        <p>Hi ${user.name},</p>
        <p>You requested to reset your password. Click the button below to proceed:</p>
        <a href="${resetUrl}" style="display: inline-block; padding: 12px 24px; background-color: #2ecc71; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0;">Reset Password</a>
        <p>If you didn't request this, please ignore this email.</p>
        <p>This link will expire in 1 hour.</p>
        <p>Best regards,<br>The AgroUnify Team</p>
      </div>
    `;

    return this.sendEmail({
      to: user.email,
      subject,
      html
    });
  }

  /**
   * Send order confirmation email
   */
  async sendOrderConfirmationEmail(user, order) {
    const subject = 'Order Confirmation';
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #2ecc71;">Order Confirmed!</h1>
        <p>Hi ${user.name},</p>
        <p>Your order has been confirmed.</p>
        <h3>Order Details:</h3>
        <p><strong>Order ID:</strong> ${order._id}</p>
        <p><strong>Total Amount:</strong> ₹${order.totalAmount}</p>
        <p>We'll notify you once your order is shipped.</p>
        <p>Best regards,<br>The AgroUnify Team</p>
      </div>
    `;

    return this.sendEmail({
      to: user.email,
      subject,
      html
    });
  }
}

module.exports = new EmailService();
