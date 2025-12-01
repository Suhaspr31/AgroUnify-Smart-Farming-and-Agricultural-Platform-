require('dotenv').config();
const axios = require('axios');

const AGMARKNET_API_URL = 'https://api.data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070';
const API_KEY = process.env.AGMARKNET_API_KEY;

if (!API_KEY) {
  console.error('AGMARKNET_API_KEY not set in environment');
  process.exit(1);
}

(async () => {
  try {
    console.log('Testing Agmarknet API with provided key...');
    const resp = await axios.get(AGMARKNET_API_URL, {
      params: {
        'api-key': API_KEY,
        format: 'json',
        limit: 5
      },
      timeout: 15000,
      headers: {
        'User-Agent': 'AgriUnify-Test/1.0'
      }
    });

    if (resp.data) {
      console.log('Status:', resp.status, resp.statusText);
      if (Array.isArray(resp.data.records)) {
        console.log('Records returned:', resp.data.records.length);
        console.log('Sample record keys:', Object.keys(resp.data.records[0] || {}).slice(0, 10));
      } else {
        console.log('Response keys:', Object.keys(resp.data));
      }
    } else {
      console.log('No data in response');
    }
  } catch (err) {
    console.error('Error fetching from Agmarknet API:', err.message || err);
    if (err.response) {
      console.error('Response status:', err.response.status);
      console.error('Response data:', err.response.data);
    }
    process.exit(2);
  }
})();
