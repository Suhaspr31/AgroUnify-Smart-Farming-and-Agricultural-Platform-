const cron = require('node-cron');
const productService = require('./product.service');
const logger = require('../../core/logger');

class PriceSchedulerService {
  constructor() {
    this.isRunning = false;
    this.schedule = null;
    this.lastRun = null;
    this.nextRun = null;
  }

  // Start the price update scheduler (runs daily at 6 AM IST)
  startScheduler() {
    if (this.isRunning) {
      logger.warn('Price scheduler is already running');
      return;
    }

    // Schedule to run daily at 6:00 AM IST (12:30 AM UTC)
    this.schedule = cron.schedule('30 0 * * *', async () => {
      await this.runPriceUpdate();
    }, {
      timezone: 'Asia/Kolkata'
    });

    this.isRunning = true;
    this.calculateNextRun();
    logger.info('Price scheduler started - will run daily at 6:00 AM IST');
  }

  // Stop the scheduler
  stopScheduler() {
    if (this.schedule) {
      this.schedule.stop();
      this.schedule = null;
    }
    this.isRunning = false;
    this.nextRun = null;
    logger.info('Price scheduler stopped');
  }

  // Manually trigger price update
  async triggerManualUpdate() {
    logger.info('Manual price update triggered');
    return await this.runPriceUpdate();
  }

  // Run the actual price update
  async runPriceUpdate() {
    try {
      this.lastRun = new Date();
      logger.info('Starting scheduled price update...');

      const result = await productService.updateProductPrices();

      logger.info(`Scheduled price update completed: ${result.updatedCount} products updated`);
      this.calculateNextRun();

      return {
        success: true,
        updatedCount: result.updatedCount,
        totalProducts: result.totalProducts,
        lastRun: this.lastRun,
        nextRun: this.nextRun
      };

    } catch (error) {
      logger.error('Scheduled price update failed:', error);
      return {
        success: false,
        error: error.message,
        lastRun: this.lastRun
      };
    }
  }

  // Calculate next run time
  calculateNextRun() {
    if (!this.isRunning) return;

    const now = new Date();
    const nextRun = new Date(now);

    // Set to next 6:00 AM IST
    nextRun.setHours(6, 0, 0, 0);

    // If it's already past 6:00 AM today, set to tomorrow
    if (now.getHours() >= 6) {
      nextRun.setDate(nextRun.getDate() + 1);
    }

    this.nextRun = nextRun;
  }

  // Get scheduler status
  getStatus() {
    return {
      isRunning: this.isRunning,
      lastRun: this.lastRun,
      nextRun: this.nextRun,
      timezone: 'Asia/Kolkata (IST)',
      schedule: 'Daily at 6:00 AM'
    };
  }
}

module.exports = new PriceSchedulerService();