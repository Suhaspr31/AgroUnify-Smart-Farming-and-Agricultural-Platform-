const fs = require('fs');
const path = require('path');

const BASE_DIR = path.resolve(__dirname, '..', '..', '..', 'data', 'news');

function ensureDir() {
  if (!fs.existsSync(BASE_DIR)) fs.mkdirSync(BASE_DIR, { recursive: true });
}

function fileForDate(dateString) {
  ensureDir();
  return path.join(BASE_DIR, `${dateString}.json`);
}

function saveForDate(dateString, articles) {
  const file = fileForDate(dateString);
  fs.writeFileSync(file, JSON.stringify({ date: dateString, ts: Date.now(), articles }, null, 2), 'utf8');
}

function loadForDate(dateString) {
  const file = fileForDate(dateString);
  if (!fs.existsSync(file)) return null;
  try {
    const raw = fs.readFileSync(file, 'utf8');
    return JSON.parse(raw);
  } catch (e) {
    return null;
  }
}

function listSavedDates() {
  ensureDir();
  return fs.readdirSync(BASE_DIR)
    .filter((f) => f.endsWith('.json'))
    .map((f) => f.replace('.json', ''))
    .sort()
    .reverse();
}

module.exports = { saveForDate, loadForDate, listSavedDates };
