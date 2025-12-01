/*
  Simple test script to verify a NewsAPI key returns results for agriculture news.
  Usage:
    set NEWS_API_KEY=your_key_here; node backend/scripts/testNewsApiKey.js
  or
    node backend/scripts/testNewsApiKey.js YOUR_KEY_HERE
*/
const axios = require('axios');

const NEWS_API_URL = 'https://newsapi.org/v2/everything';
const keyFromArg = process.argv[2];
const NEWS_API_KEY = keyFromArg || process.env.NEWS_API_KEY;

if (!NEWS_API_KEY) {
  console.error('Missing NewsAPI key. Provide as env NEWS_API_KEY or first arg.');
  process.exit(2);
}

function startOfTodayISO() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d.toISOString();
}

(async () => {
  try {
    const params = {
      apiKey: NEWS_API_KEY,
      q: 'agriculture OR farming OR crops OR farmers OR "agri business"',
      language: 'en',
      sortBy: 'publishedAt',
      from: startOfTodayISO(),
      pageSize: 5
    };

    const resp = await axios.get(NEWS_API_URL, { params, timeout: 10000 });
    console.log('status:', resp.status);
    console.log('totalResults:', resp.data.totalResults);
    console.log('sample articles:');
    (resp.data.articles || []).forEach((a, i) => {
      console.log(`${i + 1}. ${a.title} (${a.source?.name}) - ${a.publishedAt}`);
    });
  } catch (err) {
    console.error('Request failed:', err.response?.status, err.response?.data || err.message || err);
    process.exit(1);
  }
})();
