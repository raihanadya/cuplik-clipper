const fs = require('fs');
const FormData = require('form-data');
const https = require('https');
const http = require('http');
const ENV = require('../config/env');

const transcribe = async (audioPath, vocabulary) => {
  const audioBuffer = fs.readFileSync(audioPath);

  const form = new FormData();
  form.append('file', audioBuffer, {
    filename: 'audio.wav',
    contentType: 'audio/wav',
  });
  form.append('language', 'id');
  if (vocabulary) {
    form.append('prompt', vocabulary);
  }

  const url = new URL(ENV.ASR_API_URL);
  const transport = url.protocol === 'https:' ? https : http;

  return new Promise((resolve, reject) => {
    const req = transport.request(
      {
        hostname: url.hostname,
        port: url.port,
        path: url.pathname,
        method: 'POST',
        headers: {
          ...form.getHeaders(),
          accept: 'application/json',
          authorization: `Bearer ${ENV.MLAPI_KEY}`,
        },
      },
      (res) => {
        let data = '';
        res.on('data', (chunk) => (data += chunk));
        res.on('end', () => {
          try {
            const result = JSON.parse(data);
            if (res.statusCode !== 200) {
              return reject(new Error(`ASR API error: ${result.error || data}`));
            }
            resolve(result);
          } catch (e) {
            reject(new Error('Gagal parse response ASR API.'));
          }
        });
      }
    );

    req.on('error', reject);
    form.pipe(req);
  });
};

module.exports = { transcribe };
