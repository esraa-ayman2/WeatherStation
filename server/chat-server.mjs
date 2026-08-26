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
const apiKey = process.env.GEMINI_API_KEY;
const model = process.env.GEMINI_MODEL || 'gemini-3.6-flash';

const server = http.createServer(async (request, response) => {
  if (request.method !== 'POST' || request.url !== '/api/chat') {
    response.writeHead(404, { 'Content-Type': 'application/json' });
    response.end(JSON.stringify({ error: 'Not found' }));
    return;
  }

  if (!apiKey) {
    sendJson(response, 503, { error: 'GEMINI_API_KEY is missing. Add it to .env, then restart npm run chat-api.' });
    return;
  }

  try {
    const body = await readBody(request);
    const payload = JSON.parse(body);
    const messages = Array.isArray(payload.messages) ? payload.messages : [];
    const weatherContext = typeof payload.weatherContext === 'string' ? payload.weatherContext : '';
    const geminiResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(apiKey)}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        systemInstruction: {
          parts: [{ text: `You are a smart weather assistant embedded in the Weather Station application. 
Your primary role is to answer questions regarding weather conditions, forecasts, clothing advice based on weather, outdoor activity recommendations, and climate concepts.
Always respond in the exact same language used by the user in their prompt (e.g., respond in Arabic if the query is in Arabic, and English if in English).
If the user asks about completely unrelated topics (such as coding, history, or general trivia), politely decline in their language and guide them back to weather topics.
Use this live weather context when relevant: ${weatherContext}` }],
        },
        contents: messages.slice(-12).map((message) => ({
          role: message.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: message.content }],
        })),
        generationConfig: { temperature: 0.7 },
      }),
    });
    const data = await geminiResponse.json();
    if (!geminiResponse.ok) {
      if (geminiResponse.status === 429 || data?.error?.message?.includes('quota')) {
        sendJson(response, 200, { 
          text: 'المساعد الذكي يستريح ثوانٍ معدودة لكثرة الطلبات، يرجى إعادة المحاولة الآن 🌤️' 
        });
        return;
    }
    sendJson(response, geminiResponse.status, { error: data?.error?.message || 'Gemini request failed.' });
      return;
    }
    const text = data.candidates?.[0]?.content?.parts?.map((part) => part.text || '').join('') || '';
    sendJson(response, 200, { text });
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
