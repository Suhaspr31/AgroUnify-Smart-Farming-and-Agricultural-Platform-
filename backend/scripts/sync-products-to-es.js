require('dotenv').config();
const esService = require('../src/features/product/elasticsearch.service');

(async () => {
  console.log('Syncing all products to Elasticsearch...');
  try {
    await esService.syncAllProducts();
    console.log('Sync complete');
    process.exit(0);
  } catch (err) {
    console.error('Sync failed:', err.message || err);
    process.exit(2);
  }
})();
