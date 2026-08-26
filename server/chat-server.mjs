import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.dirname(fileURLToPath(import.meta.url));
const envPath = path.join(root, '..', '.env');
if (fs.existsSync(envPath)) {
  for (const line of fs.readFileSync(envPath, 'utf8').split(/\r?\n/)) {
    const match = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/);
    if (match && !process.env[match[1]]) {
      process.env[match[1]] = match[2].replace(/^['"]|['"]$/g, '');
    }
  }
}

const port = Number(process.env.CHAT_API_PORT || 3001);
const apiKey = process.env.GROQ_API_KEY;
const model = process.env.GROQ_MODEL || 'llama-3.1-8b-instant';

const server = http.createServer(async (request, response) => {
  if (request.method !== 'POST' || request.url !== '/api/chat') {
    response.writeHead(404, { 'Content-Type': 'application/json' });
    response.end(JSON.stringify({ error: 'Not found' }));
    return;
  }

  if (!apiKey) {
    sendJson(response, 503, { error: 'GROQ_API_KEY is missing. Add it to .env, then restart npm run chat-api.' });
    return;
  }

  try {
    const body = await readBody(request);
    const payload = JSON.parse(body);
    const messages = Array.isArray(payload.messages) ? payload.messages : [];
    const weatherContext = typeof payload.weatherContext === 'string' ? payload.weatherContext : '';
    const groqResponse = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        temperature: 0.7,
        messages: [
          { role: 'system', content: `You are a helpful general-purpose assistant. Answer naturally in the user's language, including Arabic or English. Do not limit yourself to weather. Use this live weather context only when relevant: ${weatherContext}` },
          ...messages.slice(-12),
        ],
      }),
    });
    const data = await groqResponse.json();
    if (!groqResponse.ok) {
      sendJson(response, groqResponse.status, { error: data?.error?.message || 'Groq request failed.' });
      return;
    }
    sendJson(response, 200, { text: data.choices?.[0]?.message?.content || '' });
  } catch (error) {
    sendJson(response, 400, { error: error instanceof Error ? error.message : 'Invalid request.' });
  }
});

function readBody(request) {
  return new Promise((resolve, reject) => {
    let body = '';
    request.on('data', (chunk) => { body += chunk; if (body.length > 100_000) request.destroy(); });
    request.on('end', () => resolve(body));
    request.on('error', reject);
  });
}

function sendJson(response, status, payload) {
  const body = JSON.stringify(payload);
  response.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Content-Length': Buffer.byteLength(body),
  });
  response.end(body);
}

server.listen(port, () => console.log(`Chat API listening on http://localhost:${port}`));
