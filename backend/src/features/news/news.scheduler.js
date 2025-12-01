const cron = require('node-cron');
const controller = require('./news.controller');
const alerts = require('./news.alerts');

// Keywords to mark an article as important
const IMPORTANT_KEYWORDS = [
  'disease', 'outbreak', 'pest', 'locust', 'blight', 'flood', 'drought', 'strike', 'ban', 'import', 'export', 'subsidy', 'alert', 'emergency'
];

function isImportant(article) {
  const text = `${article.title || ''} ${article.description || ''}`.toLowerCase();
  return IMPORTANT_KEYWORDS.some((kw) => text.includes(kw));
}

async function runOnce() {
  try {
    const data = await controller.fetchAgriculture({ pageSize: 50 });
    const articles = data.articles || [];
    const todayKey = new Date().toISOString().slice(0, 10);

    // Save snapshot (controller will also save on request, but ensure we persist here)
    try {
      const storage = require('./news.storage');
      storage.saveForDate(todayKey, articles);
    } catch (e) {
      console.warn('Scheduler: failed to save snapshot', e.message || e);
    }

    // Detect important articles and notify via SSE
    for (const a of articles) {
      if (isImportant(a)) {
        alerts.sendAlert({ type: 'important', article: a });
      }
    }
  } catch (e) {
    console.warn('News scheduler fetch failed:', e.message || e);
  }
}

function start() {
  // run immediately then every 30 minutes
  runOnce();
  cron.schedule('*/30 * * * *', () => {
    runOnce();
  });
}

module.exports = { start, runOnce };
