const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

async function run() {
  try {
    // sanity check: GET root to ensure server is reachable
    try {
      const ping = await require('axios').get('http://localhost:5000/');
      console.log('Server ping status:', ping.status);
    } catch (e) {
      console.warn('Server ping failed, proceeding to POST test (server may be starting):', e && e.message);
    }
    const filePath = path.join(__dirname, '..', 'uploads', 'test-sample.png');

    // ensure sample file exists; if not, create a tiny placeholder
    if (!fs.existsSync(path.dirname(filePath))) fs.mkdirSync(path.dirname(filePath), { recursive: true });
    if (!fs.existsSync(filePath)) {
      // create a tiny PNG file header to satisfy multipart upload (non-viewable dummy)
      fs.writeFileSync(filePath, Buffer.from([0x89,0x50,0x4e,0x47,0x0d,0x0a,0x1a,0x0a]));
    }

    const form = new FormData();
    form.append('image', fs.createReadStream(filePath));
    form.append('notes', 'Test analysis run from local test script');

    const resp = await axios.post('http://localhost:5000/api/v1/crop-doctor/analyze', form, {
      headers: form.getHeaders(),
      timeout: 20000
    });

    console.log('Status:', resp.status);
    console.log('Body:', JSON.stringify(resp.data, null, 2));
  } catch (err) {
    console.error('Full error:', err && err.toString());
    if (err.code) console.error('Error code:', err.code);
    if (err.config) console.error('Request config:', err.config && { url: err.config.url, method: err.config.method });
    if (err.response) {
      console.error('Error status:', err.response.status);
      try {
        console.error('Error body:', JSON.stringify(err.response.data, null, 2));
      } catch (e) {
        console.error('Error body (raw):', err.response.data);
      }
    } else {
      console.error('Request failed:', err.message);
    }
    process.exit(1);
  }
}

run();
