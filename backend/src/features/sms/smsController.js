const twilio = require('twilio');
const logger = require('../../core/logger');

// Initialize Twilio client only if credentials are provided and valid
let client = null;
if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN &&
    process.env.TWILIO_ACCOUNT_SID.startsWith('AC') &&
    process.env.TWILIO_AUTH_TOKEN.length > 20) {
  try {
    client = twilio(
      process.env.TWILIO_ACCOUNT_SID,
      process.env.TWILIO_AUTH_TOKEN
    );
    logger.info('Twilio client initialized successfully');
  } catch (error) {
    logger.warn('Twilio credentials are invalid. SMS functionality will be disabled.');
    client = null;
  }
} else {
  logger.warn('Twilio credentials not configured or invalid. SMS functionality will be disabled.');
}

// Send SMS
const sendSMS = async (req, res) => {
  try {
    if (!client) {
      return res.status(503).json({
        success: false,
        message: 'SMS service is not configured',
      });
    }

    const { to, message, from } = req.body;

    if (!to || !message) {
      return res.status(400).json({
        success: false,
        message: 'Phone number and message are required',
      });
    }

    const smsOptions = {
      body: message,
      from: from || process.env.TWILIO_PHONE_NUMBER,
      to: to.startsWith('+') ? to : `+91${to}`, // Add India code if not present
    };

    const messageResponse = await client.messages.create(smsOptions);

    logger.info(`SMS sent successfully: ${messageResponse.sid}`, { service: 'sms' });

    res.status(200).json({
      success: true,
      message: 'SMS sent successfully',
      messageId: messageResponse.sid,
    });
  } catch (error) {
    logger.error('Error sending SMS:', error, { service: 'sms' });
    res.status(500).json({
      success: false,
      message: 'Failed to send SMS',
      error: error.message,
    });
  }
};

// Send bulk SMS
const sendBulkSMS = async (req, res) => {
  try {
    if (!client) {
      return res.status(503).json({
        success: false,
        message: 'SMS service is not configured',
      });
    }

    const { recipients, message, from } = req.body;

    if (!recipients || !Array.isArray(recipients) || !message) {
      return res.status(400).json({
        success: false,
        message: 'Recipients array and message are required',
      });
    }

    const results = [];
    const errors = [];

    for (const recipient of recipients) {
      try {
        const smsOptions = {
          body: message,
          from: from || process.env.TWILIO_PHONE_NUMBER,
          to: recipient.startsWith('+') ? recipient : `+91${recipient}`,
        };

        const messageResponse = await client.messages.create(smsOptions);
        results.push({
          recipient,
          messageId: messageResponse.sid,
          status: 'sent',
        });
      } catch (error) {
        errors.push({
          recipient,
          error: error.message,
        });
      }
    }

    logger.info(`Bulk SMS sent: ${results.length} successful, ${errors.length} failed`, { service: 'sms' });

    res.status(200).json({
      success: true,
      message: `Bulk SMS sent: ${results.length} successful, ${errors.length} failed`,
      results,
      errors,
    });
  } catch (error) {
    logger.error('Error sending bulk SMS:', error, { service: 'sms' });
    res.status(500).json({
      success: false,
      message: 'Failed to send bulk SMS',
      error: error.message,
    });
  }
};

// Send weather alert SMS
const sendWeatherAlert = async (req, res) => {
  try {
    if (!client) {
      return res.status(503).json({
        success: false,
        message: 'SMS service is not configured',
      });
    }

    const { phoneNumber, alertType, location, message } = req.body;

    const alertMessage = `🌦️ Weather Alert for ${location}: ${message}\n\nStay safe and protect your crops!\n\n- AgriUnify Team`;

    const smsOptions = {
      body: alertMessage,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: phoneNumber.startsWith('+') ? phoneNumber : `+91${phoneNumber}`,
    };

    const messageResponse = await client.messages.create(smsOptions);

    logger.info(`Weather alert SMS sent: ${messageResponse.sid}`, { service: 'sms' });

    res.status(200).json({
      success: true,
      message: 'Weather alert SMS sent successfully',
      messageId: messageResponse.sid,
    });
  } catch (error) {
    logger.error('Error sending weather alert SMS:', error, { service: 'sms' });
    res.status(500).json({
      success: false,
      message: 'Failed to send weather alert SMS',
      error: error.message,
    });
  }
};

// Send price alert SMS
const sendPriceAlert = async (req, res) => {
  try {
    if (!client) {
      return res.status(503).json({
        success: false,
        message: 'SMS service is not configured',
      });
    }

    const { phoneNumber, commodity, price, change, location } = req.body;

    const alertMessage = `📊 Price Alert!\n\n${commodity} price in ${location}:\nCurrent: ₹${price}\nChange: ${change > 0 ? '+' : ''}${change}%\n\nCheck AgriUnify for more details!\n\n- AgriUnify Team`;

    const smsOptions = {
      body: alertMessage,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: phoneNumber.startsWith('+') ? phoneNumber : `+91${phoneNumber}`,
    };

    const messageResponse = await client.messages.create(smsOptions);

    logger.info(`Price alert SMS sent: ${messageResponse.sid}`, { service: 'sms' });

    res.status(200).json({
      success: true,
      message: 'Price alert SMS sent successfully',
      messageId: messageResponse.sid,
    });
  } catch (error) {
    logger.error('Error sending price alert SMS:', error, { service: 'sms' });
    res.status(500).json({
      success: false,
      message: 'Failed to send price alert SMS',
      error: error.message,
    });
  }
};

module.exports = {
  sendSMS,
  sendBulkSMS,
  sendWeatherAlert,
  sendPriceAlert,
};