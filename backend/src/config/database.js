const mongoose = require('mongoose');
const logger = require('../core/logger');

const connectDatabase = async () => {
  try {
    const MONGODB_URI = process.env.NODE_ENV === 'test'
      ? process.env.MONGODB_URI_TEST
      : process.env.MONGODB_URI;

    // Log the URI (masking password for security)
    const maskedUri = MONGODB_URI.replace(/:([^:@]{4})[^:@]*@/, ':$1****@');
    logger.info(`Attempting to connect to MongoDB with URI: ${maskedUri}`);
    console.log(`🔗 Connecting to MongoDB: ${maskedUri}`);

    const conn = await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    logger.info(`MongoDB Connected: ${conn.connection.host}`);
    console.log(`✅ Database connected: ${conn.connection.name}`);

    // Handle connection events
    mongoose.connection.on('error', (err) => {
      logger.error('MongoDB connection error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      logger.warn('MongoDB disconnected');
    });

    return conn;
  } catch (error) {
    logger.error('Error connecting to MongoDB:', error);
    throw error;
  }
};

const disconnectDatabase = async () => {
  try {
    await mongoose.connection.close();
    logger.info('MongoDB connection closed');
  } catch (error) {
    logger.error('Error closing MongoDB connection:', error);
    throw error;
  }
};

module.exports = {
  connectDatabase,
  disconnectDatabase
};
