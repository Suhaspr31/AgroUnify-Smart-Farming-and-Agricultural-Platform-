require('dotenv').config();
const esService = require('../src/features/product/elasticsearch.service');

(async () => {
  console.log('Testing Elasticsearch connection...');
  try {
    const ok = await esService.ping();
    if (ok) {
      console.log('Elasticsearch reachable at', process.env.ELASTICSEARCH_NODE || 'http://localhost:9200');
      process.exit(0);
    } else {
      console.error('Elasticsearch ping failed. Check that ES is running and ELASTICSEARCH_NODE is correct.');
      process.exit(2);
    }
  } catch (err) {
    console.error('Error while testing Elasticsearch:', err.message || err);
    process.exit(2);
  }
})();
