require('dotenv').config();
const app = require('./src/app');
const logger = require('./src/core/logger');

const PORT = process.env.PORT || 5000;

// Lightweight dev server that does NOT connect to the DB. We optionally start the news scheduler here so
// the news page can get day-to-day snapshots and alerts in dev.
const server = app.listen(PORT, () => {
  logger && logger.info && logger.info(`Dev server running on port ${PORT}`);
  console.log(`🚀 Dev server running on http://localhost:${PORT}`);
  console.log('⚠️  Running in dev no-DB mode');
});

// Start news scheduler in dev unless explicitly disabled
if (process.env.NEWS_SCHEDULER !== 'false') {
  try {
    const newsScheduler = require('./src/features/news/news.scheduler');
    newsScheduler.start();
    console.log('🔔 News scheduler started (dev)');
  } catch (e) {
    console.warn('Could not start news scheduler in dev:', e.message || e);
  }
} else {
  console.log('ℹ️  News scheduler disabled via NEWS_SCHEDULER=false');
}

process.on('SIGTERM', () => {
  logger && logger.info && logger.info('SIGTERM received. Shutting down dev server');
  server.close(() => process.exit(0));
});
