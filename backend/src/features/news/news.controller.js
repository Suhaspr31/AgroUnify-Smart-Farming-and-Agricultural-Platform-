const axios = require('axios');
const alerts = require('./news.alerts');
const storage = require('./news.storage');

const NEWS_API_URL = 'https://newsapi.org/v2';
const NEWS_API_KEY = process.env.NEWS_API_KEY;

// Simple in-memory cache to reduce NewsAPI calls (key -> { ts, data })
const cache = new Map();
const CACHE_TTL_MS = parseInt(process.env.NEWS_CACHE_TTL_MS || '300000', 10); // default 5 minutes

function startOfTodayISO() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d.toISOString();
}

function formatDateKey(date) {
  const d = new Date(date);
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

function cacheKey(prefix, params) {
  const sortedKeys = Object.keys(params || {}).sort();
  const parts = sortedKeys.map((k) => `${k}=${params[k]}`);
  return `${prefix}:${parts.join('&')}`;
}

async function fetchWithCache(prefix, params, urlPath) {
  const key = cacheKey(prefix, params);
  const now = Date.now();
  const entry = cache.get(key);
  if (entry && now - entry.ts < CACHE_TTL_MS) {
    return entry.data;
  }

  const response = await axios.get(`${NEWS_API_URL}${urlPath}`, { params, timeout: 10000 });
  cache.set(key, { ts: now, data: response });
  return response;
}

exports.getAgricultureNews = async (req, res, next) => {
  try {
    const { page = 1, pageSize = 20, from } = req.query;
    const fromParam = from || startOfTodayISO();

    const params = {
      apiKey: NEWS_API_KEY,
      q: 'agriculture OR farming OR crops OR farmers OR "agri business"',
      language: 'en',
      sortBy: 'publishedAt',
      from: fromParam,
      page,
      pageSize
    };

    let response = await fetchWithCache('agri', params, '/everything');

    // If there are no results for today's from param, relax the from constraint and retry once (and cache that)
    if ((response.data?.totalResults || 0) === 0) {
      console.warn('No articles for from=', fromParam, '- retrying without from to broaden results');
      const paramsNoFrom = { ...params };
      delete paramsNoFrom.from;
      response = await fetchWithCache('agri_no_from', paramsNoFrom, '/everything');
    }

    // Save snapshot for today's date (and also when from wasn't present we save under today's key)
    try {
      const dateKey = formatDateKey(fromParam || new Date());
      storage.saveForDate(dateKey, response.data.articles || []);
    } catch (e) {
      console.warn('Failed to save news snapshot:', e.message || e);
    }

    return res.json({ success: true, data: response.data.articles, totalResults: response.data.totalResults });
  } catch (error) {
    console.error('Agriculture news fetch error:', error?.response?.data || error.message || error);
    return res.status(502).json({ success: false, message: error.response?.data?.message || 'Failed to fetch agriculture news' });
  }
};

exports.getTopHeadlines = async (req, res, next) => {
  try {
    const { country = 'in', category = 'business', page = 1, pageSize = 20 } = req.query;
    const params = {
      apiKey: NEWS_API_KEY,
      country,
      category,
      page,
      pageSize
    };

    const response = await axios.get(`${NEWS_API_URL}/top-headlines`, { params, timeout: 10000 });
    return res.json({ success: true, data: response.data.articles, totalResults: response.data.totalResults });
  } catch (error) {
    console.error('Top headlines fetch error:', error?.response?.data || error.message || error);
    return res.status(502).json({ success: false, message: error.response?.data?.message || 'Failed to fetch top headlines' });
  }
};

exports.searchNews = async (req, res, next) => {
  try {
    const { q, page = 1, pageSize = 20, from } = req.query;
    if (!q) return res.status(400).json({ success: false, message: 'Missing query param `q`' });

    const params = {
      apiKey: NEWS_API_KEY,
      q,
      language: 'en',
      sortBy: 'publishedAt',
      from,
      page,
      pageSize
    };

    const response = await axios.get(`${NEWS_API_URL}/everything`, { params, timeout: 10000 });
    return res.json({ success: true, data: response.data.articles, totalResults: response.data.totalResults });
  } catch (error) {
    console.error('News search error:', error?.response?.data || error.message || error);
    return res.status(502).json({ success: false, message: error.response?.data?.message || 'Failed to search news' });
  }
};

// Helper to fetch raw agriculture articles (used by scheduler)
exports.fetchAgriculture = async (params = {}) => {
  const p = {
    apiKey: NEWS_API_KEY,
    q: 'agriculture OR farming OR crops OR farmers OR "agri business"',
    language: 'en',
    sortBy: 'publishedAt',
    pageSize: params.pageSize || 20,
    page: params.page || 1,
    from: params.from
  };
  const resp = await fetchWithCache('agri_sched', p, '/everything');
  return resp.data;
};

// GET /api/v1/news/history?date=YYYY-MM-DD
exports.getHistory = (req, res) => {
  const { date } = req.query;
  if (date) {
    const data = storage.loadForDate(date);
    if (!data) return res.status(404).json({ success: false, message: 'No snapshot for this date' });
    return res.json({ success: true, data: data.articles, meta: { date: data.date, ts: data.ts } });
  }

  // list available dates
  const dates = storage.listSavedDates();
  return res.json({ success: true, dates });
};

// Server-Sent Events endpoint for alerts
exports.alertsStream = (req, res) => {
  alerts.sseHeaders(res);
  alerts.addClient(res);

  req.on('close', () => {
    alerts.removeClient(res);
  });
};
