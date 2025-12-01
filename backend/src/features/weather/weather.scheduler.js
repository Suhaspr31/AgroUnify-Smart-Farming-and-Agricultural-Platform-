const cron = require('node-cron');
const weatherService = require('./weather.service');
const logger = require('../../core/logger');

class WeatherScheduler {
  constructor() {
    this.isRunning = false;
  }

  start() {
    if (this.isRunning) {
      logger.info('Weather scheduler is already running');
      return;
    }

    // Run daily at 6 AM
    cron.schedule('0 6 * * *', async () => {
      logger.info('Starting daily weather alert check');
      try {
        await weatherService.checkAndCreateSowingAlerts();
        logger.info('Daily weather alert check completed successfully');
      } catch (error) {
        logger.error('Error in daily weather alert check:', error);
      }
    });

    // Run every 6 hours for weather monitoring
    cron.schedule('0 */6 * * *', async () => {
      logger.info('Starting 6-hour weather monitoring check');
      try {
        await weatherService.checkAndCreateSowingAlerts();
        logger.info('6-hour weather monitoring check completed successfully');
      } catch (error) {
        logger.error('Error in 6-hour weather monitoring check:', error);
      }
    });

    this.isRunning = true;
    logger.info('Weather scheduler started successfully');
  }

  stop() {
    // Note: node-cron doesn't provide a direct way to stop all jobs
    // In a production app, you'd want to store job references and destroy them
    this.isRunning = false;
    logger.info('Weather scheduler stopped');
  }

  // Manual trigger for testing
  async triggerManualCheck() {
    logger.info('Manual weather alert check triggered');
    try {
      await weatherService.checkAndCreateSowingAlerts();
      logger.info('Manual weather alert check completed successfully');
      return { success: true, message: 'Weather alert check completed' };
    } catch (error) {
      logger.error('Error in manual weather alert check:', error);
      return { success: false, message: error.message };
    }
  }
}

module.exports = new WeatherScheduler();