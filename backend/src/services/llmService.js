const https = require('https');
const http = require('http');
const ENV = require('../config/env');

const PROMPT_TEMPLATE = `You are an educational content curator. Given the following transcript with word-level timestamps, identify 3-5 segments that form complete educational concepts. Each segment must have:
1. Pembuka Kontekstual (introduction)
2. Elaborasi/Solusi (explanation)
3. Kesimpulan Mandiri (conclusion)

Duration constraint: 25-75 seconds per segment.

Return a JSON object with this exact structure:
{
  "clips": [
    {
      "clip_id": "string",
      "start_time_seconds": number,
      "end_time_seconds": number,
      "duration": number,
      "concept_score": number (0.0-1.0),
      "suggested_title": "string",
      "pedagogical_reason": "string"
    }
  ]
}`;

const selectConcepts = async (transcript, vocabulary) => {
  const transcriptText = transcript
    .map((t) => `[${t.start_time.toFixed(2)}-${t.end_time.toFixed(2)}] ${t.word}`)
    .join(' ');

  const userMessage = `Transcript:\n${transcriptText}\n\n${vocabulary ? `Custom vocabulary: ${vocabulary}\n\n` : ''}Identify 3-5 educational concept segments.`;

  const body = JSON.stringify({
    messages: [
      { role: 'system', content: PROMPT_TEMPLATE },
      { role: 'user', content: userMessage },
    ],
    response_format: { type: 'json_object' },
  });

  const url = new URL(ENV.LLM_API_URL);
  const transport = url.protocol === 'https:' ? https : http;

  return new Promise((resolve, reject) => {
    const req = transport.request(
      {
        hostname: url.hostname,
        port: url.port,
        path: url.pathname,
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          accept: 'application/json',
          authorization: `Bearer ${ENV.API_KEY}`,
        },
      },
      (res) => {
        let data = '';
        res.on('data', (chunk) => (data += chunk));
        res.on('end', () => {
          try {
            const result = JSON.parse(data);
            if (res.statusCode !== 200) {
              return reject(new Error(`LLM API error: ${result.error || data}`));
            }
            const content = result.choices?.[0]?.message?.content || data;
            const parsed = typeof content === 'string' ? JSON.parse(content) : content;
            resolve(parsed.clips || parsed);
          } catch (e) {
            reject(new Error('Gagal parse response LLM API.'));
          }
        });
      }
    );

    req.on('error', reject);
    req.write(body);
    req.end();
  });
};

module.exports = { selectConcepts };
