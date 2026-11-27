const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');
const os = require('os');
const crypto = require('crypto');
const zlib = require('zlib');
const webPush = require('web-push');

// Web Push configuration. Keep the private key server-side only.
const VAPID_PUBLIC_KEY = process.env.VAPID_PUBLIC_KEY || '';
const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY || '';
const SUPABASE_URL = (process.env.SUPABASE_URL || 'https://jkmxqnpkykqcvezbxqvo.supabase.co').replace(/\/+$/, '');
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || '';
if (VAPID_PUBLIC_KEY && VAPID_PRIVATE_KEY) webPush.setVapidDetails('mailto:admin@example.com', VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);
else console.warn('[Web Push] VAPID keys missing. Run npm run generate-vapid and add both keys to environment variables.');
function readJsonRequest(req, maxBytes = 65536) { return new Promise((resolve, reject) => { let raw = ''; req.on('data', chunk => { raw += chunk; if (raw.length > maxBytes) { reject(new Error('Request body too large.')); req.destroy(); } }); req.on('end', async () => { try { resolve(JSON.parse(raw || '{}')); } catch (_) { reject(new Error('Invalid JSON body.')); } }); req.on('error', reject); }); }
function requirePushConfig() { if (!VAPID_PUBLIC_KEY || !VAPID_PRIVATE_KEY) { const e = new Error('Add VAPID_PUBLIC_KEY and VAPID_PRIVATE_KEY.'); e.statusCode = 503; throw e; } if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) { const e = new Error('Add SUPABASE_URL and SUPABASE_SECRET_KEY (or SUPABASE_SERVICE_ROLE_KEY).'); e.statusCode = 503; throw e; } }
async function supabasePushRequest(method, query = '', body) { const response = await fetch(SUPABASE_URL + '/rest/v1/push_subscriptions' + query, { method, headers: { apikey: SUPABASE_SERVICE_ROLE_KEY, Authorization: 'Bearer ' + SUPABASE_SERVICE_ROLE_KEY, 'Content-Type': 'application/json', Prefer: 'resolution=merge-duplicates,return=minimal' }, ...(body === undefined ? {} : { body: JSON.stringify(body) }) }); if (!response.ok) throw new Error('Supabase push storage failed (' + response.status + '): ' + (await response.text()).slice(0, 250)); const text = await response.text(); return text ? JSON.parse(text) : []; }
async function sendPushNotificationToAll({ title, body, url = '/' }) { requirePushConfig(); const rows = await supabasePushRequest('GET', '?select=endpoint,subscription'); const payload = JSON.stringify({ title: title || 'Housekeeping Stock', body: body || '', url: url || '/' }); const results = await Promise.all((rows || []).map(async row => { try { await webPush.sendNotification(row.subscription, payload); return 'sent'; } catch (e) { if (e.statusCode === 404 || e.statusCode === 410) { await supabasePushRequest('DELETE', '?endpoint=eq.' + encodeURIComponent(row.endpoint)); return 'removed'; } console.error('[Web Push] Delivery failed:', e.message); return 'failed'; } })); return { total: rows.length, sent: results.filter(x => x === 'sent').length, removed: results.filter(x => x === 'removed').length }; }

const PORT = process.env.PORT || 3000;
const DATA_FILE = path.join(__dirname, 'data.json');
const PUBLIC_DIR = path.join(__dirname, 'public');

const defaultData = {
  settings: {
    minTotalStock: 500,
    title: "Housekeeping Stock Count",
    subtitle: "Count supplies on schedule and get reminded when a count is due.",
    reminderFrequencyHours: 24
  },
  items: [
    { id: "broom", name: "Broom", category: "Cleaning supplies", unit: "pcs", currentCount: null, lastCountedAt: null, countedBy: null, minStock: 20 },
    { id: "mop", name: "Mop", category: "Cleaning supplies", unit: "pcs", currentCount: null, lastCountedAt: null, countedBy: null, minStock: 20 },
    { id: "gloves", name: "Gloves", category: "Cleaning supplies", unit: "boxes", currentCount: null, lastCountedAt: null, countedBy: null, minStock: 50 },
    { id: "room_freshener", name: "Room freshener", category: "Cleaning supplies", unit: "pcs", currentCount: null, lastCountedAt: null, countedBy: null, minStock: 25 },
    { id: "toilet_roll", name: "Toilet roll", category: "Cleaning supplies", unit: "boxes", currentCount: null, lastCountedAt: null, countedBy: null, minStock: 100 },
    { id: "restaurant_tissue", name: "Restaurant tissue", category: "Cleaning supplies", unit: "boxes", currentCount: null, lastCountedAt: null, countedBy: null, minStock: 80 },
    { id: "garbage_cover_small", name: "Garbage cover small", category: "Cleaning supplies", unit: "boxes", currentCount: null, lastCountedAt: null, countedBy: null, minStock: 2, maxLimit: 5 },
    { id: "garbage_cover_big", name: "Garbage cover big", category: "Cleaning supplies", unit: "boxes", currentCount: null, lastCountedAt: null, countedBy: null, minStock: 2, maxLimit: 5 },
    { id: "floor_cleaner", name: "Floor cleaner", category: "Chemical supplies", unit: "pcs", currentCount: null, lastCountedAt: null, countedBy: null, minStock: 3, maxLimit: 5 },
    { id: "glass_cleaner", name: "Glass cleaner", category: "Chemical supplies", unit: "pcs", currentCount: null, lastCountedAt: null, countedBy: null, minStock: 3, maxLimit: 5 },
    { id: "dental_kit", name: "Dental kit", category: "Guest amenities", unit: "pcs", currentCount: null, lastCountedAt: null, countedBy: null, minStock: 60 },
    { id: "shaving_kit", name: "Shaving kit", category: "Guest amenities", unit: "pcs", currentCount: null, lastCountedAt: null, countedBy: null, minStock: 50 },
    { id: "shower_cap", name: "Shower cap", category: "Guest amenities", unit: "pcs", currentCount: null, lastCountedAt: null, countedBy: null, minStock: 50 },
    { id: "soap", name: "Soap", category: "Guest amenities", unit: "pcs", currentCount: null, lastCountedAt: null, countedBy: null, minStock: 80 },
    { id: "shampoo", name: "Shampoo", category: "Guest amenities", unit: "pcs", currentCount: null, lastCountedAt: null, countedBy: null, minStock: 80 },
    { id: "moisturiser", name: "Moisturiser", category: "Guest amenities", unit: "pcs", currentCount: null, lastCountedAt: null, countedBy: null, minStock: 50 }
  ],
  history: []
};

const TMP_DATA_FILE = path.join(os.tmpdir(), 'hk_data.json');

function getDataFilePath() {
  if (process.env.VERCEL) {
    if (!fs.existsSync(TMP_DATA_FILE) && fs.existsSync(DATA_FILE)) {
      try {
        fs.copyFileSync(DATA_FILE, TMP_DATA_FILE);
      } catch (_) {}
    }
    return TMP_DATA_FILE;
  }
  return DATA_FILE;
}

function loadData() {
  if (remoteDataLoaded && appData) return appData;
  try {
    const targetFile = getDataFilePath();
    if (!fs.existsSync(targetFile)) {
      if (fs.existsSync(DATA_FILE)) {
        const raw = fs.readFileSync(DATA_FILE, 'utf8');
        return JSON.parse(raw);
      }
      return defaultData;
    }
    const raw = fs.readFileSync(targetFile, 'utf8');
    return JSON.parse(raw);
  } catch (err) {
    console.error("Error reading data file:", err);
    return defaultData;
  }
}

async function saveData(data) {
  await persistAppData(data);
}
let remoteDataLoaded = false;
let storageStatus = {
  configured: Boolean(SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY),
  connected: false,
  mode: 'local',
  message: 'Supabase database storage is not configured.'
};

async function supabaseDataRequest(method, query = '', body) {
  const response = await fetch(SUPABASE_URL + '/rest/v1/app_state' + query, {
    method,
    headers: {
      apikey: SUPABASE_SERVICE_ROLE_KEY,
      Authorization: 'Bearer ' + SUPABASE_SERVICE_ROLE_KEY,
      'Content-Type': 'application/json',
      Prefer: 'resolution=merge-duplicates,return=representation'
    },
    ...(body === undefined ? {} : { body: JSON.stringify(body) })
  });
  const responseText = await response.text();
  if (!response.ok) throw new Error('Supabase app-data storage failed (' + response.status + '): ' + responseText.slice(0, 300));
  return responseText ? JSON.parse(responseText) : [];
}

async function initializeDataStorage() {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    storageStatus = { configured: false, connected: false, mode: 'local', message: 'Add SUPABASE_URL and SUPABASE_SECRET_KEY to enable persistent database storage.' };
    console.warn('[Storage] Supabase app-data storage is not configured; using local JSON storage.');
    return;
  }
  try {
    const rows = await supabaseDataRequest('GET', '?id=eq.1&select=data,updated_at');
    if (Array.isArray(rows) && rows.length && rows[0].data && typeof rows[0].data === 'object') {
      appData = rows[0].data;
      remoteDataLoaded = true;
      storageStatus = { configured: true, connected: true, mode: 'supabase', message: 'Application data is loaded from Supabase.' };
      console.log('[Storage] Loaded application data from Supabase.');
      return;
    }

    // One-time migration: preserve the existing JSON data if the Supabase row is empty.
    const legacyPath = getDataFilePath();
    const initialData = fs.existsSync(legacyPath) ? loadData() : (fs.existsSync(DATA_FILE) ? loadData() : defaultData);
    await supabaseDataRequest('POST', '?on_conflict=id', { id: 1, data: initialData, updated_at: new Date().toISOString() });
    appData = initialData;
    remoteDataLoaded = true;
    storageStatus = { configured: true, connected: true, mode: 'supabase', message: 'Existing local data migrated to Supabase.' };
    console.log('[Storage] Initial application data saved to Supabase (existing JSON data preserved when present).');
  } catch (error) {
    storageStatus = { configured: true, connected: false, mode: 'error', message: error.message };
    console.error('[Storage] Supabase initialization failed:', error.message);
  }
}

async function refreshDataFromSupabase() {
  if (!storageStatus.connected) return;
  const rows = await supabaseDataRequest('GET', '?id=eq.1&select=data');
  if (Array.isArray(rows) && rows.length && rows[0].data && typeof rows[0].data === 'object') {
    appData = rows[0].data;
    remoteDataLoaded = true;
  }
}

async function persistAppData(data) {
  if (storageStatus.configured && !storageStatus.connected) {
    throw new Error('Supabase storage is configured but unavailable: ' + storageStatus.message);
  }
  if (storageStatus.connected) {
    await supabaseDataRequest('POST', '?on_conflict=id', { id: 1, data, updated_at: new Date().toISOString() });
    storageStatus.message = 'Application data is saved in Supabase.';
  }
  const targetFile = getDataFilePath();
  fs.writeFileSync(targetFile, JSON.stringify(data, null, 2), 'utf8');
  appData = data;
  remoteDataLoaded = storageStatus.connected;
}


function extractTextFromInteractionResponse(parsed) {
  if (typeof parsed.output_text === 'string' && parsed.output_text.trim()) {
    return parsed.output_text.trim();
  }
  if (Array.isArray(parsed.steps)) {
    for (const step of parsed.steps) {
      if (step.type === 'model_output' && Array.isArray(step.content)) {
        for (const c of step.content) {
          if (c.type === 'text' && c.text) {
            return c.text.trim();
          }
        }
      }
    }
  }
  if (parsed.candidates && parsed.candidates[0] && parsed.candidates[0].content && parsed.candidates[0].content.parts) {
    return parsed.candidates[0].content.parts.map(p => p.text || '').join('').trim();
  }
  return '';
}

function callGeminiInteractionsApi(model, inputParts, apiKey, timeoutMs = 90000, thinkingLevel = 'low') {
  return new Promise((resolve, reject) => {
    const payload = JSON.stringify({
      model: model,
      input: inputParts,
      generation_config: { thinking_level: thinkingLevel },
      response_format: {
        type: 'text',
        mime_type: 'application/json'
      }
    });

    const apiReq = https.request({
      hostname: 'generativelanguage.googleapis.com',
      path: '/v1beta/interactions',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': apiKey,
        'Content-Length': Buffer.byteLength(payload)
      }
    }, apiRes => {
      let responseText = '';
      apiRes.on('data', chunk => responseText += chunk);
      apiRes.on('end', () => {
        let parsed;
        try {
          parsed = JSON.parse(responseText || '{}');
        } catch (_) {
          return reject(new Error('Google AI returned an unreadable response.'));
        }
        if (apiRes.statusCode < 200 || apiRes.statusCode >= 300) {
          const errMsg = (parsed.error && parsed.error.message) || `Google AI returned status ${apiRes.statusCode}`;
          const err = new Error(errMsg);
          err.statusCode = apiRes.statusCode;
          return reject(err);
        }
        const text = extractTextFromInteractionResponse(parsed);
        if (!text) {
          return reject(new Error('Google AI returned an empty response.'));
        }
        resolve(text);
      });
    });

    apiReq.setTimeout(timeoutMs, () => apiReq.destroy(new Error(`Google AI (${model}) timed out after ${timeoutMs / 1000}s.`)));
    apiReq.on('error', reject);
    apiReq.write(payload);
    apiReq.end();
  });
}


async function callGeminiWithRetry(model, inputParts, apiKey, maxRetries = 2, options = {}) {
  for (let attempt = 0; ; attempt++) {
    try {
      return await callGeminiInteractionsApi(model, inputParts, apiKey, options.timeoutMs || 90000, options.thinkingLevel || 'low');
    } catch (err) {
      const isRetryable =
        err.statusCode === 503 ||
        err.statusCode === 429 ||
        err.code === 'ETIMEDOUT' ||
        /timed?\s*out|timeout/i.test(err.message || '');

      if (!isRetryable || attempt >= maxRetries) throw err;

      const backoffMs = 1000 * Math.pow(2, attempt);
      const jitterMs = Math.floor(Math.random() * 501);
      const delayMs = backoffMs + jitterMs;
      console.warn(`[Gemini] ${model} retry ${attempt + 1}/${maxRetries} after ${delayMs}ms: ${err.message}`);
      await new Promise(resolve => setTimeout(resolve, delayMs));
    }
  }
}

function callOpenAiChat(payloadObj, apiKey, timeoutMs = 45000) {
  return new Promise((resolve, reject) => {
    const requestBody = JSON.stringify(payloadObj);
    const apiReq = https.request({
      hostname: 'api.openai.com',
      path: '/v1/chat/completions',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'Content-Length': Buffer.byteLength(requestBody)
      }
    }, apiRes => {
      let responseText = '';
      apiRes.on('data', chunk => responseText += chunk);
      apiRes.on('end', () => {
        let parsed;
        try {
          parsed = JSON.parse(responseText || '{}');
        } catch (_) {
          return reject(new Error('OpenAI returned an unreadable response.'));
        }
        if (apiRes.statusCode < 200 || apiRes.statusCode >= 300) {
          const errMsg = (parsed.error && parsed.error.message) || `OpenAI returned status ${apiRes.statusCode}`;
          const err = new Error(errMsg);
          err.statusCode = apiRes.statusCode;
          return reject(err);
        }
        const text = parsed.choices && parsed.choices[0] && parsed.choices[0].message && parsed.choices[0].message.content;
        resolve(text || '');
      });
    });
    apiReq.setTimeout(timeoutMs, () => apiReq.destroy(new Error(`OpenAI request timed out after ${timeoutMs / 1000}s.`)));
    apiReq.on('error', reject);
    apiReq.write(requestBody);
    apiReq.end();
  });
}

async function executeVisionAiWithFallback(prompt, imageBase64, mimeType) {
  const geminiKey = process.env.GEMINI_API_KEY;
  const openAiKey = process.env.OPENAI_API_KEY;

  if (!geminiKey && !openAiKey) {
    throw new Error('AI API key is not configured. Please set GEMINI_API_KEY (or OPENAI_API_KEY) in server environment variables.');
  }

  const interactionsInput = [
    { type: 'image', mime_type: mimeType, data: imageBase64 },
    { type: 'text', text: prompt }
  ];
  const failureLog = [];
  const geminiModels = [
    'gemini-4-hydrogen',
    'gemini-3.6-flash',
    'gemini-3.5-flash-lite',
    'gemini-2.5-flash',
    'gemini-3.8-flash'
  ];

  if (geminiKey) {
    for (const model of geminiModels) {
      try {
        const text = await callGeminiWithRetry(model, interactionsInput, geminiKey, 2, { thinkingLevel: 'medium', timeoutMs: 90000 });
        if (text) return { text, model };
        failureLog.push(`${model}: empty response`);
      } catch (err) {
        console.warn(`[AI Vision] ${model} failed (${err.message}). Trying next model...`);
        failureLog.push(`${model}: ${err.message}`);
      }
    }
  }

  if (openAiKey) {
    try {
      const text = await callOpenAiChat({
        model: 'gpt-4o-mini',
        messages: [{
          role: 'user',
          content: [
            { type: 'text', text: prompt },
            { type: 'image_url', image_url: { url: `data:${mimeType};base64,${imageBase64}` } }
          ]
        }],
        response_format: { type: 'json_object' },
        temperature: 0.1,
        max_tokens: 4096
      }, openAiKey);
      if (text) return { text, model: 'gpt-4o-mini (OpenAI fallback)' };
    } catch (err) {
      console.warn(`[AI Vision] OpenAI fallback failed (${err.message}).`);
      failureLog.push(`openai: ${err.message}`);
    }
  }

  throw new Error(`AI reading failed on all providers: ${failureLog.join(' | ')}`);
}

async function executeTextAiWithFallback(prompt) {
  const geminiKey = process.env.GEMINI_API_KEY;
  const openAiKey = process.env.OPENAI_API_KEY;

  if (!geminiKey && !openAiKey) {
    throw new Error('AI API key is not configured. Please set GEMINI_API_KEY (or OPENAI_API_KEY) in server environment variables.');
  }

  const interactionsInput = [{ type: 'text', text: prompt }];
  const failureLog = [];
  const geminiModels = [
    'gemini-4-hydrogen',
    'gemini-3.6-flash',
    'gemini-3.5-flash-lite',
    'gemini-2.5-flash',
    'gemini-3.8-flash'
  ];

  if (geminiKey) {
    for (const model of geminiModels) {
      try {
        const text = await callGeminiWithRetry(model, interactionsInput, geminiKey);
        if (text) return { text, model };
        failureLog.push(`${model}: empty response`);
      } catch (err) {
        console.warn(`[AI Review] ${model} failed (${err.message}). Trying next model...`);
        failureLog.push(`${model}: ${err.message}`);
      }
    }
  }

  if (openAiKey) {
    try {
      const text = await callOpenAiChat({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: prompt }],
        response_format: { type: 'json_object' },
        temperature: 0.1,
        max_tokens: 2048
      }, openAiKey);
      if (text) return { text, model: 'gpt-4o-mini (OpenAI fallback)' };
    } catch (err) {
      console.warn(`[AI Review] OpenAI fallback failed (${err.message}).`);
      failureLog.push(`openai: ${err.message}`);
    }
  }

  throw new Error(`AI review failed on all providers: ${failureLog.join(' | ')}`);
}


function loadRoomSupplyRules() {
  return JSON.parse(fs.readFileSync(path.join(__dirname, 'config', 'room-supply-rules.json'), 'utf8'));
}

// Normalize handwritten ETA shorthand such as "10. AM", "10.PM" and "09.30 am".
function normalizeRoomingSheetTime(value) {
  if (typeof value !== 'string') return '';
  const time = value.trim().replace(/\s+/g, ' ').toUpperCase();
  let hour, minute = 0, period;
  let match = /^(\d{1,2})\s*\.\s*(AM|PM)$/.exec(time);
  if (match) {
    hour = Number(match[1]);
    period = match[2];
  } else {
    match = /^(\d{1,2})[.:](\d{2})\s*(AM|PM)$/.exec(time);
    if (match) {
      hour = Number(match[1]);
      minute = Number(match[2]);
      period = match[3];
    } else {
      match = /^(\d{1,2})\s+(AM|PM)$/.exec(time);
      if (!match) return '';
      hour = Number(match[1]);
      period = match[2];
    }
  }
  if (hour < 1 || hour > 12 || minute > 59) return '';
  return String(hour).padStart(2, '0') + ':' + String(minute).padStart(2, '0') + ' ' + period;
}

// Normalize shorthand without turning explicit multi-room lists into accidental ranges.
function normalizeRoomingSheetRooms(value, expectedRoomCount, rules) {
  let source = String(value || '').toUpperCase()
    .replace(/[–—−]/g, '-')
    .replace(/\s+/g, '')
    .replace(/\(/g, ',').replace(/\)/g, ',')
    .replace(/\//g, ',')
    .replace(/-{3,}/g, '~');
  source = source.replace(/,+/g, ',').replace(/^,|,$/g, '');
  const known = new Set((rules.rooms || []).map(room => String(room.roomNumber).toUpperCase()));
  const parts = source.split(',').filter(Boolean);
  const tokens = [];
  let previousNumeric = '';

  for (const part of parts) {
    if (/^[A-Z]+\d+$/i.test(part) || /^(TREEHOUSE|CLUBVILLA)$/i.test(part)) {
      tokens.push(part);
      previousNumeric = '';
      continue;
    }
    if (/^\d{3}~\d{3}$/.test(part)) {
      const [start, end] = part.split('~');
      tokens.push(start + '-' + end);
      previousNumeric = end;
      continue;
    }
    if (/^\d{3}-\d{3}$/.test(part)) {
      const [start, end] = part.split('-');
      tokens.push(start + '-' + end);
      previousNumeric = end;
      continue;
    }
    if (/^\d{3}(?:-\d{3}){2,}$/.test(part)) {
      const list = part.split('-');
      tokens.push(...list);
      previousNumeric = list[list.length - 1];
      continue;
    }
    if (/^\d{3}-\d(?:-\d)+$/.test(part)) {
      const chunks = part.split('-');
      const prefix = chunks[0].slice(0, 2);
      tokens.push(chunks[0], ...chunks.slice(1).map(n => prefix + n));
      previousNumeric = tokens[tokens.length - 1];
      continue;
    }
    if (/^\d{3}$/.test(part)) {
      tokens.push(part);
      previousNumeric = part;
      continue;
    }
    if (/^\d{1,2}$/.test(part) && previousNumeric) {
      const expanded = part.length === 1
        ? previousNumeric.slice(0, 2) + part
        : previousNumeric.slice(0, 1) + part;
      tokens.push(expanded);
      previousNumeric = expanded;
      continue;
    }
    if (/^\d{3}-\d{3}$/.test(part)) {
      tokens.push(part);
      previousNumeric = part.split('-')[1];
      continue;
    }
    tokens.push(part);
    previousNumeric = '';
  }

  const expandedForValidation = [];
  for (const token of tokens) {
    const range = /^(\d{3})-(\d{3})$/.exec(token);
    if (range) {
      const start = Number(range[1]), end = Number(range[2]);
      if (end < start || end - start > 100) {
        expandedForValidation.push(token);
        continue;
      }
      for (let n = start; n <= end; n++) expandedForValidation.push(String(n));
    } else expandedForValidation.push(token);
  }
  const unknown = [...new Set(expandedForValidation.filter(room => !known.has(room)))];
  const count = expandedForValidation.length;
  const expected = Number(expectedRoomCount);
  const hasExpected = Number.isFinite(expected) && expected > 0;
  const dayUseOnly = expandedForValidation.length > 0 &&
    expandedForValidation.every(room => room === 'D1' || room === 'D2');
  const dayUseCountMatches = dayUseOnly && expandedForValidation.length === 1 &&
    ((expected === 0.01 && expandedForValidation[0] === 'D1') ||
     (expected === 0.02 && expandedForValidation[0] === 'D2') ||
     (expected === 1));
  const countMatches = !hasExpected || dayUseCountMatches || Math.abs(count - expected) < 0.001;
  return {
    // Expand ranges into individual room IDs because the deduction API accepts exact IDs.
    roomNumber: expandedForValidation.join(','),
    valid: unknown.length === 0 && countMatches,
    unknownRooms: unknown,
    count,
    expectedRoomCount: hasExpected ? expected : null,
    countMatches
  };
}

let appData = loadData();
const storageReady = initializeDataStorage();

function getLocalIpAddresses() {
  const interfaces = os.networkInterfaces();
  const addresses = [];
  for (const name of Object.keys(interfaces)) {
    for (const net of interfaces[name]) {
      if (net.family === 'IPv4' && !net.internal) {
        addresses.push(net.address);
      }
    }
  }
  return addresses;
}

function pngCrc32(buffer) {
  let crc = 0xffffffff;
  for (const byte of buffer) {
    crc ^= byte;
    for (let bit = 0; bit < 8; bit++) crc = (crc >>> 1) ^ ((crc & 1) ? 0xedb88320 : 0);
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function makePngChunk(type, data) {
  const typeBuffer = Buffer.from(type, 'ascii');
  const length = Buffer.alloc(4);
  length.writeUInt32BE(data.length, 0);
  const crcInput = Buffer.concat([typeBuffer, data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(pngCrc32(crcInput), 0);
  return Buffer.concat([length, typeBuffer, data, crc]);
}

function resizeRgbPng(source, targetSize) {
  const signature = source.subarray(0, 8);
  if (!signature.equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))) {
    throw new Error('Invalid PNG icon source');
  }

  let offset = 8;
  let width = 0;
  let height = 0;
  let bitDepth = 0;
  let colorType = 0;
  const imageData = [];

  while (offset < source.length) {
    const length = source.readUInt32BE(offset);
    const type = source.toString('ascii', offset + 4, offset + 8);
    const data = source.subarray(offset + 8, offset + 8 + length);
    if (type === 'IHDR') {
      width = data.readUInt32BE(0);
      height = data.readUInt32BE(4);
      bitDepth = data[8];
      colorType = data[9];
    } else if (type === 'IDAT') {
      imageData.push(data);
    } else if (type === 'IEND') {
      break;
    }
    offset += 12 + length;
  }

  if (!width || !height || bitDepth !== 8 || colorType !== 2) {
    throw new Error('Unsupported PNG icon format');
  }

  const bpp = 3;
  const stride = width * bpp;
  const inflated = zlib.inflateSync(Buffer.concat(imageData));
  const pixels = Buffer.alloc(height * stride);
  let sourceOffset = 0;

  for (let y = 0; y < height; y++) {
    const filter = inflated[sourceOffset++];
    const rowOffset = y * stride;
    for (let x = 0; x < stride; x++) {
      const raw = inflated[sourceOffset++];
      const left = x >= bpp ? pixels[rowOffset + x - bpp] : 0;
      const up = y > 0 ? pixels[rowOffset - stride + x] : 0;
      const upperLeft = (y > 0 && x >= bpp) ? pixels[rowOffset - stride + x - bpp] : 0;
      let predictor = 0;
      if (filter === 1) predictor = left;
      else if (filter === 2) predictor = up;
      else if (filter === 3) predictor = Math.floor((left + up) / 2);
      else if (filter === 4) {
        const p = left + up - upperLeft;
        const pa = Math.abs(p - left);
        const pb = Math.abs(p - up);
        const pc = Math.abs(p - upperLeft);
        predictor = pa <= pb && pa <= pc ? left : (pb <= pc ? up : upperLeft);
      } else if (filter !== 0) {
        throw new Error('Unsupported PNG row filter');
      }
      pixels[rowOffset + x] = (raw + predictor) & 255;
    }
  }

  const outStride = targetSize * bpp;
  const rawOutput = Buffer.alloc(targetSize * (outStride + 1));
  for (let y = 0; y < targetSize; y++) {
    const sourceY = Math.min(height - 1, Math.floor(y * height / targetSize));
    const rowStart = y * (outStride + 1);
    rawOutput[rowStart] = 0;
    for (let x = 0; x < targetSize; x++) {
      const sourceX = Math.min(width - 1, Math.floor(x * width / targetSize));
      const sourceIndex = sourceY * stride + sourceX * bpp;
      const targetIndex = rowStart + 1 + x * bpp;
      pixels.copy(rawOutput, targetIndex, sourceIndex, sourceIndex + bpp);
    }
  }

  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(targetSize, 0);
  ihdr.writeUInt32BE(targetSize, 4);
  ihdr[8] = 8;
  ihdr[9] = 2;
  ihdr[10] = 0;
  ihdr[11] = 0;
  ihdr[12] = 0;

  return Buffer.concat([
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
    makePngChunk('IHDR', ihdr),
    makePngChunk('IDAT', zlib.deflateSync(rawOutput)),
    makePngChunk('IEND', Buffer.alloc(0))
  ]);
}

const mimeTypes = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.webmanifest': 'application/manifest+json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon'
};

const server = http.createServer(async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  const parsedUrl = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  const pathname = parsedUrl.pathname;

  if (pathname.startsWith('/api/')) {
    await storageReady;
    if (storageStatus.connected && pathname === '/api/data' && req.method === 'GET') {
      try { await refreshDataFromSupabase(); }
      catch (error) { storageStatus.connected = false; storageStatus.mode = 'error'; storageStatus.message = error.message; console.error('[Storage] Refresh failed:', error.message); }
    }
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');


    // Storage health endpoint; never exposes database keys or stored records.
    if (pathname === '/api/storage/status' && req.method === 'GET') {
      res.writeHead(storageStatus.connected ? 200 : 503, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ ...storageStatus, table: 'app_state' }));
      return;
    }

    // Web Push public VAPID key
    if (pathname === '/api/push/vapid-public-key' && req.method === 'GET') {
      if (!VAPID_PUBLIC_KEY || !VAPID_PRIVATE_KEY) { res.writeHead(503, { 'Content-Type': 'application/json' }); res.end(JSON.stringify({ error: 'Web Push is not configured.' })); return; }
      res.writeHead(200, { 'Content-Type': 'application/json' }); res.end(JSON.stringify({ publicKey: VAPID_PUBLIC_KEY })); return;
    }
    // Save/refresh this browser subscription in Supabase
    if (pathname === '/api/push/subscribe' && req.method === 'POST') {
      readJsonRequest(req).then(async payload => { requirePushConfig(); const sub = payload.subscription; if (!sub || typeof sub.endpoint !== 'string' || !sub.keys || !sub.keys.p256dh || !sub.keys.auth) { res.writeHead(400, { 'Content-Type': 'application/json' }); res.end(JSON.stringify({ error: 'Valid PushSubscription required.' })); return; } await supabasePushRequest('POST', '?on_conflict=endpoint', { endpoint: sub.endpoint, subscription: sub }); res.writeHead(200, { 'Content-Type': 'application/json' }); res.end(JSON.stringify({ success: true })); }).catch(e => { if (!res.headersSent) { res.writeHead(e.statusCode || 500, { 'Content-Type': 'application/json' }); res.end(JSON.stringify({ error: e.message })); } }); return;
    }
    // Protected test endpoint; requires PUSH_TEST_TOKEN
    if (pathname === '/api/push/test' && req.method === 'POST') {
      readJsonRequest(req).then(async payload => { const token = process.env.PUSH_TEST_TOKEN; if (!token || req.headers['x-push-test-token'] !== token) { res.writeHead(403, { 'Content-Type': 'application/json' }); res.end(JSON.stringify({ error: 'Valid PUSH_TEST_TOKEN required.' })); return; } const result = await sendPushNotificationToAll({ title: payload.title || 'Housekeeping Stock Test', body: payload.body || 'Web Push notifications are working.', url: payload.url || '/' }); res.writeHead(200, { 'Content-Type': 'application/json' }); res.end(JSON.stringify({ success: true, ...result })); }).catch(e => { if (!res.headersSent) { res.writeHead(e.statusCode || 500, { 'Content-Type': 'application/json' }); res.end(JSON.stringify({ error: e.message })); } }); return;
    }
    // POST /api/item-photo - save a stock photo against an inventory item
    if (pathname === '/api/item-photo' && req.method === 'POST') {
      let body = '';
      req.on('data', chunk => {
        body += chunk;
        if (body.length > 8 * 1024 * 1024) req.destroy();
      });
      req.on('end', async () => {
        try {
          const payload = JSON.parse(body || '{}');
          const id = payload.id;
          const dataUrl = payload.dataUrl || '';
          appData = loadData();
          const item = appData.items.find(entry => entry.id === id);
          if (!item) {
            res.writeHead(404, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Stock item not found.' }));
            return;
          }
          const match = /^data:image\/(jpeg|jpg|png|webp);base64,([A-Za-z0-9+/=]+)$/.exec(dataUrl);
          if (!match) {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Please upload a JPG, PNG, or WEBP image.' }));
            return;
          }
          const buffer = Buffer.from(match[2], 'base64');
          if (!buffer.length || buffer.length > 5 * 1024 * 1024) {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Image must be 5 MB or smaller.' }));
            return;
          }
          const uploadDir = path.join(PUBLIC_DIR, 'uploads');
          fs.mkdirSync(uploadDir, { recursive: true });
          const extension = match[1] === 'jpg' ? 'jpg' : match[1];
          const fileName = String(id).replace(/[^a-zA-Z0-9_-]/g, '') + '-' + crypto.randomBytes(8).toString('hex') + '.' + extension;
          fs.writeFileSync(path.join(uploadDir, fileName), buffer);
          item.photoUrl = '/uploads/' + fileName;
          await saveData(appData);
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ success: true, photoUrl: item.photoUrl }));
        } catch (error) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Image upload failed. Please try again.' }));
        }
      });
      return;
    }

    // GET /api/data
    if (pathname === '/api/data' && req.method === 'GET') {
      appData = loadData();
      const lanIps = getLocalIpAddresses();
      const response = {
        ...appData,
        network: {
          ips: lanIps,
          port: PORT,
          urls: lanIps.map(ip => `http://${ip}:${PORT}`)
        }
      };
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(response));
      return;
    }

    // POST /api/count (Update count for an item)
    if (pathname === '/api/count' && req.method === 'POST') {
      let body = '';
      req.on('data', chunk => { body += chunk; });
      req.on('end', async () => {
        try {
          const { id, count, staffName } = JSON.parse(body);
          appData = loadData();
          const item = appData.items.find(i => i.id === id);
          if (!item) {
            res.writeHead(404, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: "Item not found" }));
            return;
          }

          const numCount = parseInt(count, 10);
          if (isNaN(numCount) || numCount < 0) {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: "Invalid count value" }));
            return;
          }

          // Error if Chemical Supplies count > 5 or item has maxLimit
          const itemMax = item.maxLimit || (item.category === 'Chemical supplies' ? 5 : null);
          if (itemMax && numCount > itemMax) {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ 
              error: `⚠️ ERROR: ${item.name} count cannot exceed ${itemMax} ${item.unit}! (${item.name} ന് ${itemMax} ${item.unit}-ൽ കൂടുതൽ എണ്ണം നൽകാൻ കഴിയില്ല).` 
            }));
            return;
          }

          // Guest amenities: max limit 1200
          if (item.category === 'Guest amenities' && numCount > 1200) {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ 
              error: "Please check your stock carefully! Count cannot be more than 1200 for Guest amenities (Maximum allowed is 1200).\nനിങ്ങൾ സ്റ്റോക്ക് കൃത്യമായി പരിശോധിക്കുക! ഗസ്റ്റ് അമിനിറ്റീസിന് എണ്ണം 1200-ൽ കൂടുതൽ നൽകാൻ കഴിയില്ല (പരമാവധി 1200)." 
            }));
            return;
          }

          // Other items: max limit 999 (cannot be 1000 or more)
          if (item.category !== 'Guest amenities' && numCount >= 1000) {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ 
              error: "Please check your stock carefully! Count cannot be 1000 or more (Maximum allowed is 999).\nനിങ്ങൾ സ്റ്റോക്ക് കൃത്യമായി പരിശോധിക്കുക! എണ്ണം 1000 അല്ലെങ്കിൽ അതിൽ കൂടുതലോ നൽകാൻ കഴിയില്ല (പരമാവധി 999)." 
            }));
            return;
          }

          const previousCount = item.currentCount;
          item.currentCount = numCount;
          item.lastCountedAt = new Date().toISOString();
          item.countedBy = staffName && staffName.trim() ? staffName.trim() : (item.countedBy || "Staff");

          if (!appData.history) appData.history = [];
          appData.history.unshift({
            timestamp: item.lastCountedAt,
            itemId: item.id,
            itemName: item.name,
            previousCount: previousCount,
            newCount: numCount,
            staffName: item.countedBy
          });
          if (appData.history.length > 200) appData.history.pop();

          await saveData(appData);

          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ success: true, item, items: appData.items }));
        } catch (e) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: e.message }));
        }
      });
      return;
    }

    // POST /api/reset (Reset single item or all)
    if (pathname === '/api/reset' && req.method === 'POST') {
      let body = '';
      req.on('data', chunk => { body += chunk; });
      req.on('end', async () => {
        try {
          const { id, all } = JSON.parse(body || '{}');
          appData = loadData();
          if (all) {
            appData.items.forEach(item => {
              item.currentCount = null;
              item.lastCountedAt = null;
            });
          } else if (id) {
            const item = appData.items.find(i => i.id === id);
            if (item) {
              item.currentCount = null;
              item.lastCountedAt = null;
            }
          }
          await saveData(appData);
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ success: true, items: appData.items }));
        } catch (e) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: e.message }));
        }
      });
      return;
    }

    // POST /api/housekeeping/ai-read-image - read the rooming-sheet image with Gemini Vision + load fallback
    if (pathname === '/api/housekeeping/ai-read-image' && req.method === 'POST') {
      let body = '';
      req.on('data', chunk => {
        body += chunk;
        if (body.length > 12000000) {
          res.writeHead(413, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Image is too large. Please upload a smaller JPG or PNG.' }));
          req.destroy();
        }
      });
      req.on('end', async () => {
        try {
          const payload = JSON.parse(body || '{}');
          const imageBase64 = typeof payload.imageBase64 === 'string' ? payload.imageBase64 : '';
          const mimeType = ['image/jpeg', 'image/png', 'image/webp'].includes(payload.mimeType) ? payload.mimeType : '';
          if (!imageBase64 || !mimeType || imageBase64.length > 10000000) {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Please upload a valid JPG, PNG, or WEBP image under 7 MB.' }));
            return;
          }
          const prompt = [
            'You are an expert hotel front-office rooming-sheet reader. Read the image visually; do not use OCR software.',
            'The photo may be rotated 90 degrees sideways or upside down. Mentally rotate it until the table is upright, then follow the actual column headers, not assumed page orientation. Important headers include CK IN, CK OUT, NAME, ROOMS, Room Num, ETA, Adult, Kid, Plan and similar hotel booking fields.',
            'If one page contains multiple date tables or multiple separate tables, read EVERY table from top to bottom in page order and preserve row order within each table. Do not stop after the first date/table.',
            'HANDWRITING AND CORRECTIONS: handwritten edits override printed content. Always ignore printed room numbers that are crossed out, struck through, cancelled or overwritten; use the handwritten replacement written beside, above or next to them. Never output both the crossed-out number and its replacement.',
            'ROOM TOKENS: preserve the exact room identifiers and grouping. Expand shorthand carefully: 106-7-8 means 106,107,108; 135,36 means 135,136. A sequence such as 121-122-126 when ROOMS count is 3 means exactly 121,122,126, NOT the continuous range 121-126.',
            'RANGES AND SEPARATORS: repeated hyphens such as 131---136 mean range 131-136. A single hyphen between two full room numbers such as 123-125 is a range only when the row/count supports that interpretation. Slash and parentheses are group separators: 101/123-125/(131-136) means groups 101, 123-125 and 131-136. Do not merge separate groups or invent intermediate rooms.',
            'STRICT COLUMN MAPPING: Read each row by its printed column boundaries and headers. The Room Num column contains the actual room identifiers; copy those identifiers into roomNumber. The ROOMS column contains only the number/count of rooms for that booking; copy that value into expectedRoomCount. NEVER use the ROOMS count as a room number, and NEVER use Adult, Kid, Plan, ETA or guest count as the room count. Do not shift values from a neighboring column when a cell is blank.',
            'ROOMS COUNT VALIDATION: After reading Room Num, count the actual rooms represented and compare that count with ROOMS. Slash (/) separates room entries; a numeric range such as 131-133 means 131,132,133; letter-number IDs such as A1 are one exact room. CRITICAL EXAMPLE: ROOMS=5 and Room Num=101/131-133/A1 MUST produce expectedRoomCount=5 and roomNumber="101,131,132,133,A1". Never omit A1 and never treat the slash as decoration. Another example: ROOMS=2 and Room Num=106-107 means roomNumber="106,107". ROOMS=3 and Room Num=121-122-126 means exactly roomNumber="121,122,126" (not a continuous range). If the count conflicts, do not invent or silently add rooms: keep the clearest visible Room Num tokens, lower confidence and explain the mismatch. The ROOMS count is not Adult, Kid or meal count.',
            'DAY-USE EXCEPTION: Day-use D1/D2 may show 0.01/0.02 or 1 in ROOMS; preserve D1/D2 as room tokens and do not treat these values as normal room counts. If ETA says DAY, return status DAY. The day-use D1/D2 supply rule is 2 Soap, 1 Shampoo and 1 Moisturiser.',
            'STAY ROWS: Never omit a row because ETA says STAY. Return every STAY row with its roomNumber, status STAY, and all visible fields. ETA text DINNER is not a time and must be ignored for status; do not turn DINNER into CK IN or CK OUT.',
            'STRICT ETA OVERRIDE: ANY row with a real time in ETA (for example 10:00 AM, 9:30 AM, 12:30 PM) is ALWAYS CK IN, including D1/D2 and even when Plan or CK OUT says DAY. Only classify CK OUT when CK OUT/C Out is explicitly written in the CK OUT column; an ETA time takes precedence over DAY. Return arrivalTime with the ETA time.',
            'DATE TABLES: The image may contain multiple separate tables, each with a date heading. Return EVERY table separately as tables:[{sheetDate:"YYYY-MM-DD",displayDate:"26-Nov",rows:[...]}]. The current year is ' + new Date().getFullYear() + '. Infer that year when only DD-MMM is visible. Do not mix rows between date tables. If no table heading date is visible, set sheetDate and displayDate to empty strings.',
            'STATUS FROM ETA/COLUMN VALUES: Read ETA, CK OUT and Plan independently. Only explicit CK OUT/C Out/Check Out text in the CK OUT column means CK OUT; never infer CK OUT from ETA. A real clock time in ETA (10:00 AM, 9:30 AM, 12:30 PM, etc.) means CK IN, including D1/D2. ETA exactly DAY means status DAY (not CK IN). ETA exactly STAY means STAY. ETA exactly DINNER is a meal note, not a time or status: ignore it and determine status only from the other status columns; never classify DINNER as CK IN. Return a real ETA time as arrivalTime. Normalize 10. AM to 10:00 AM, 10.PM to 10:00 PM, and 09.30 am to 09:30 AM. Do not classify a time as a room number. If no reliable status/time is visible, use NOT CLEAR.'
            'For each row also return eta, plan and ckOut as the exact visible cell text (empty string if blank), so server-side rules can resolve DAY and checkout precedence deterministically.',
            'Return ONLY valid JSON in this exact shape: {"tables":[{"sheetDate":"2026-11-26","displayDate":"26-Nov","rows":[{"roomNumber":"101-119","expectedRoomCount":16,"eta":"C Out","plan":"","ckOut":"C Out","status":"CK OUT","arrivalTime":"","confidence":0.95,"reason":""}]}]}. If only one table, still return it inside tables. For compatibility you may also return rows for a single undated table.',
            'Allowed status values: CK OUT, STAY, STAY BACK, CK IN, DAY, NOT CLEAR. Keep roomNumber as comma-separated exact tokens and/or valid ranges; do not flatten a valid continuous range. expectedRoomCount must be a number when readable, otherwise null.',
            'Recognize room identifiers such as 101-136, A1, A2, D1, D2, Treehouse and Clubvilla. Do not infer missing data. Use NOT CLEAR and low confidence when uncertain. Do not invent room numbers or duplicate rows.',
            'Ignore headings, totals, notes, and rows without a room number. No stock calculations or deductions.'
          ].join(' ');

          const { text: modelText, model: usedModel } = await executeVisionAiWithFallback(prompt, imageBase64, mimeType);

          let aiData;
          try {
            aiData = JSON.parse(modelText || '{}');
          } catch (_) {
            throw new Error('AI response was not valid JSON. Please upload a clearer image.');
          }
          const allowedStatuses = new Set(['CK OUT', 'STAY', 'STAY BACK', 'CK IN', 'DAY', 'NOT CLEAR']);
          const roomRules = loadRoomSupplyRules();
          const today = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Kolkata', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date());
          const todayDisplayDate = new Intl.DateTimeFormat('en-GB', { timeZone: 'Asia/Kolkata', day: '2-digit', month: 'short' }).format(new Date()).replace(' ', '-');
          const inputTables = Array.isArray(aiData.tables) ? aiData.tables : [{ sheetDate: '', displayDate: '', rows: Array.isArray(aiData.rows) ? aiData.rows : [] }];
          const tables = inputTables.slice(0, 10).map(table => {
            const sheetDate = typeof table.sheetDate === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(table.sheetDate) ? table.sheetDate : '';
            const displayDate = typeof table.displayDate === 'string' ? table.displayDate.slice(0, 20) : '';
            const rows = (Array.isArray(table.rows) ? table.rows : []).slice(0, 80).map(row => {
            const rawRoomNumber = typeof row.roomNumber === 'string' ? row.roomNumber.slice(0, 120) : '';
            const expectedRoomCount = Number.isFinite(Number(row.expectedRoomCount)) && Number(row.expectedRoomCount) > 0 ? Number(row.expectedRoomCount) : null;
            const normalized = normalizeRoomingSheetRooms(rawRoomNumber, expectedRoomCount, roomRules);
            const etaText = typeof row.eta === 'string' ? row.eta.trim() : '';
            const planText = typeof row.plan === 'string' ? row.plan.trim() : '';
            const ckOutText = typeof row.ckOut === 'string' ? row.ckOut.trim() : '';
            const etaIsCheckout = /^(C\s*OUT|CK\s*OUT|CHECK\s*OUT|CHECK-OUT|CHECKOUT)$/i.test(etaText);
            const etaIsStay = /^STAY$/i.test(etaText);
            const etaIsDay = /^DAY$/i.test(etaText);
            const isDayBooking = /^DAY$/i.test(ckOutText) || /^DAY$/i.test(planText) || expectedRoomCount === 0.01 || expectedRoomCount === 0.02;
            const normalizedArrivalTime = normalizeRoomingSheetTime(typeof row.arrivalTime === 'string' ? row.arrivalTime : etaText);
            let status = String(row.status || '').toUpperCase().trim();
            if (etaIsCheckout) status = 'CK OUT';
            else if (normalizedArrivalTime) status = 'CK IN';
            else if (etaIsDay) status = 'DAY';
            else if (etaIsStay || /^STAY$/i.test(status)) status = 'STAY';
            else if (/^(CK IN|CHECK IN|CHECK-IN)$/.test(status)) status = 'CK IN';
            if (!allowedStatuses.has(status)) status = 'NOT CLEAR';
            const reasonParts = [typeof row.reason === 'string' ? row.reason.slice(0, 140) : ''];
            if (normalized.unknownRooms.length) reasonParts.push('Unknown room(s): ' + normalized.unknownRooms.join(', '));
            if (!normalized.countMatches) reasonParts.push('ROOMS count mismatch: detected ' + normalized.count + ', expected ' + normalized.expectedRoomCount);
            const validationFailed = !normalized.valid;
            return {
              roomNumber: normalized.roomNumber || rawRoomNumber,
              expectedRoomCount,
              status: status === 'CK OUT' ? 'CK OUT' : (validationFailed ? 'NOT CLEAR' : status),
              arrivalTime: status === 'CK IN' ? normalizedArrivalTime : '',
              confidence: validationFailed ? Math.min(0.59, Math.max(0, Number(row.confidence) || 0)) : Math.max(0, Math.min(1, Number(row.confidence) || 0)),
              reason: reasonParts.filter(Boolean).join('; ').slice(0, 180),
              roomValidation: { valid: normalized.valid, unknownRooms: normalized.unknownRooms, count: normalized.count, countMatches: normalized.countMatches }
            };
            }).filter(row => row.roomNumber);
            return { sheetDate, displayDate, rows };
          });
          const datedTables = tables.filter(t => t.sheetDate);
          if (!datedTables.length) {
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: true, blocked: true, message: 'Could not detect a date header on the rooming sheet. Only a clearly dated today\'s sheet can be processed.', todayDate: today, todayDisplayDate, rows: [] }));
            return;
          }
          const selected = datedTables.find(t => t.sheetDate === today);
          if (datedTables.length && !selected) {
            const nearest = datedTables.sort((a,b) => a.sheetDate.localeCompare(b.sheetDate))[0];
            const isPast = nearest.sheetDate < today;
            const dateLabel = nearest.displayDate || nearest.sheetDate;
            const message = isPast
              ? 'Stock deduction for ' + dateLabel + ' was already completed / is a past date. Only today\'s (' + todayDisplayDate + ') sheet can be submitted.'
              : 'This sheet is for ' + dateLabel + '. Only today\'s (' + todayDisplayDate + ') rooming sheet can be processed.';
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: true, blocked: true, message, todayDate: today, todayDisplayDate, tables: tables.map(t => ({sheetDate:t.sheetDate,displayDate:t.displayDate})), rows: [] }));
            return;
          }
          const chosenTable = selected || tables[0] || { sheetDate: today, displayDate: todayDisplayDate, rows: [] };
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ success: true, model: usedModel, sheetDate: chosenTable.sheetDate || today, displayDate: chosenTable.displayDate || todayDisplayDate, selectedTableDate: chosenTable.displayDate || todayDisplayDate, tables: tables.map(t => ({sheetDate:t.sheetDate,displayDate:t.displayDate})), rows: chosenTable.rows }));
        } catch (error) {
          console.error('Rooming-sheet AI vision read failed:', error.message);
          res.writeHead(502, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: error.message || 'AI image reading failed.' }));
        }
      });
      return;
    }

    // POST /api/housekeeping/ai-review - Gemini/fallback AI assists with OCR status/ETA interpretation
    if (pathname === '/api/housekeeping/ai-review' && req.method === 'POST') {
      let body = '';
      req.on('data', chunk => {
        body += chunk;
        if (body.length > 60000) req.destroy();
      });
      req.on('end', async () => {
        try {
          const payload = JSON.parse(body || '{}');
          const rawText = typeof payload.rawText === 'string' ? payload.rawText.slice(0, 15000) : '';
          const rows = Array.isArray(payload.rows) ? payload.rows.slice(0, 80) : [];
          if (!rawText || !rows.length) {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'OCR text and parsed rows are required.' }));
            return;
          }
          const prompt = [
            'You are assisting a hotel housekeeping rooming-sheet OCR review.',
            'Interpret ONLY the status and ETA time for each supplied row using the raw OCR text as context.',
            'Never invent room numbers, never add/remove rows, and never calculate or deduct inventory.',
            'Return JSON only: {"suggestions":[{"index":0,"status":"CK OUT","arrivalTime":"","confidence":0.9,"reason":"short reason"}]}.',
            'Allowed status values: CK OUT, STAY, STAY BACK, CK IN, NOT CLEAR.',
            'Use NOT CLEAR and confidence below 0.7 when evidence is ambiguous.',
            'For CK IN, arrivalTime must contain a clearly visible ETA time; otherwise use empty string.',
            'Keep the supplied row order and index. Do not infer a time from unrelated numbers.',
            'Raw OCR text:\n' + rawText,
            'Parsed rows:\n' + JSON.stringify(rows.map((r, index) => ({
              index, roomNumber: String(r.roomNumber || ''),
              status: String(r.status || 'NOT CLEAR'),
              arrivalTime: String(r.arrivalTime || '')
            })))
          ].join('\n\n');

          const { text: modelText, model: usedModel } = await executeTextAiWithFallback(prompt);

          let aiData;
          try {
            aiData = JSON.parse(modelText || '{}');
          } catch (_) {
            throw new Error('AI response was not valid JSON.');
          }
          const allowedStatuses = new Set(['CK OUT', 'STAY', 'STAY BACK', 'CK IN', 'NOT CLEAR']);
          const suggestions = (Array.isArray(aiData.suggestions) ? aiData.suggestions : [])
            .filter(s => s && Number.isInteger(s.index) && s.index >= 0 && s.index < rows.length)
            .map(s => ({
              index: s.index,
              status: allowedStatuses.has(String(s.status || '').toUpperCase()) ? String(s.status).toUpperCase() : 'NOT CLEAR',
              arrivalTime: typeof s.arrivalTime === 'string' ? s.arrivalTime.slice(0, 16) : '',
              confidence: Math.max(0, Math.min(1, Number(s.confidence) || 0)),
              reason: typeof s.reason === 'string' ? s.reason.slice(0, 180) : ''
            }));

          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ success: true, model: usedModel, suggestions }));
        } catch (error) {
          console.error('AI review failed:', error.message);
          res.writeHead(502, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: error.message || 'AI review failed.' }));
        }
      });
      return;
    }

    // GET today's deduction status (Asia/Kolkata).
    if (pathname === '/api/housekeeping/deduction-status' && req.method === 'GET') {
      try {
        await refreshDataFromSupabase();
        const todayDate = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Kolkata', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date());
        const dates = appData.housekeeping && Array.isArray(appData.housekeeping.deductedDates) ? appData.housekeeping.deductedDates : [];
        const lastDeductedDate = dates.length ? dates[dates.length - 1] : null;
        const display = value => value ? new Date(value + 'T12:00:00+05:30').toLocaleDateString('en-GB', { timeZone: 'Asia/Kolkata', day: '2-digit', month: 'short' }).replace(' ', '-') : null;
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ todayDate, todayDisplayDate: display(todayDate), isDeductedToday: dates.includes(todayDate), lastDeductedDate, lastDeductedDisplayDate: display(lastDeductedDate) }));
      } catch (error) {
        res.writeHead(503, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Could not load deduction status: ' + error.message }));
      }
      return;
    }

    // POST /api/housekeeping/deduct - apply reviewed checkout supplies exactly once
    if (pathname === '/api/housekeeping/deduct' && req.method === 'POST') {
      let body = '';
      req.on('data', chunk => { body += chunk; if (body.length > 100000) req.destroy(); });
      req.on('end', async () => {
        try {
          const payload = JSON.parse(body || '{}');
          const { batchId, rooms } = payload;
          if (!batchId || typeof batchId !== 'string' || !Array.isArray(rooms) || !rooms.length) {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'batchId and reviewed checkout rooms are required' }));
            return;
          }
          await refreshDataFromSupabase();
          appData = loadData();
          const todayDate = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Kolkata', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date());
          if (!appData.housekeeping) appData.housekeeping = { processedBatches: [], deductions: [], deductedDates: [] };
          if (!Array.isArray(appData.housekeeping.deductedDates)) appData.housekeeping.deductedDates = [];
          if (payload.sheetDate !== todayDate) {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: "Only today's rooming sheet can be submitted. Please read today's dated sheet first.", todayDate, submittedSheetDate: payload.sheetDate || null }));
            return;
          }
          if (appData.housekeeping.deductedDates.includes(todayDate)) {
            res.writeHead(409, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: "Today's rooming sheet has already been submitted and stock deduction is completed.", duplicate: true, todayDate }));
            return;
          }
          if (!appData.housekeeping) appData.housekeeping = { processedBatches: [], deductions: [] };
          if (appData.housekeeping.processedBatches.includes(batchId)) {
            res.writeHead(409, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'This room-list batch was already processed.', duplicate: true }));
            return;
          }
          const rules = JSON.parse(fs.readFileSync(path.join(__dirname, 'config', 'room-supply-rules.json'), 'utf8'));
          const known = new Map(rules.rooms.map(r => [r.roomNumber.toUpperCase(), r]));
          const totals = {};
          const reviewed = [];
          const roomDetails = [];
          for (const entry of rooms) {
            const roomNumber = String(entry.roomNumber || '').trim().toUpperCase();
            const status = String(entry.status || '').trim().toUpperCase();
            const hasEtaTime = typeof entry.arrivalTime === 'string' && entry.arrivalTime.trim().length > 0;
            const isEligible = status === 'CK OUT' || status === 'STAY BACK' || (status === 'CK IN' && hasEtaTime);
            if (!isEligible) continue;
            const room = known.get(roomNumber);
            if (!room) throw new Error('Unknown room: ' + roomNumber);
            reviewed.push(roomNumber + (status === 'STAY BACK' ? ' (STAY BACK)' : status === 'CK IN' ? ' (CHECK-IN ' + entry.arrivalTime.trim() + ')' : ' (CK OUT)'));
            const supplies = status === 'STAY BACK' ? rules.supplyRules.stayBack : rules.supplyRules[room.type];
            roomDetails.push({ roomNumber, status, arrivalTime: hasEtaTime ? entry.arrivalTime.trim() : '', items: supplies });
            for (const [id, qty] of Object.entries(supplies)) totals[id] = (totals[id] || 0) + qty;
          }
          if (!reviewed.length) throw new Error('No eligible rooms were supplied. Use CK OUT, STAY BACK, or CK IN with an ETA time.');
          const changes = [];
          const skippedItems = [];
          for (const [id, requiredQty] of Object.entries(totals)) {
            const item = appData.items.find(i => i.id === id);
            if (!item) throw new Error('Inventory item missing: ' + id);
            const available = Number.isInteger(item.currentCount) ? item.currentCount : 0;
            if (available <= 0) {
              skippedItems.push({ id, name: item.name, required: requiredQty, available: 0, reason: 'No stock available' });
              continue;
            }
            const deductQty = Math.min(available, requiredQty);
            changes.push({ item, qty: deductQty, requiredQty, previousCount: available });
            if (deductQty < requiredQty) {
              skippedItems.push({ id, name: item.name, required: requiredQty, available, deducted: deductQty, shortage: requiredQty - deductQty, reason: 'Insufficient stock' });
            }
          }
          // All-or-nothing stock validation: if ANY required item is short,
          // stop the whole batch before changing inventory or writing history.
          if (skippedItems.length > 0) {
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({
              success: false, deducted: false, partial: false,
              message: 'Stock shortage. No items were deducted.',
              rooms: reviewed, roomDetails, totals: {}, skippedItems, items: appData.items
            }));
            return;
          }
          if (!changes.length) {
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: false, deducted: false, partial: false, message: 'No available stock to deduct.', rooms: reviewed, roomDetails, totals: {}, skippedItems, items: appData.items }));
            return;
          }
          const timestamp = new Date().toISOString();
          const deductedTotals = {};
          for (const change of changes) {
            change.item.currentCount -= change.qty;
            change.item.lastCountedAt = timestamp;
            deductedTotals[change.item.id] = change.qty;
            if (!appData.history) appData.history = [];
            appData.history.unshift({
              timestamp, itemId: change.item.id, itemName: change.item.name,
              previousCount: change.previousCount, newCount: change.item.currentCount,
              action: 'room_supply_deduction',
              batchId, quantityUsed: change.qty, requiredQuantity: change.requiredQty, rooms: reviewed
            });
          }
          appData.housekeeping.processedBatches.push(batchId);
          appData.housekeeping.deductions.unshift({ batchId, timestamp, rooms: reviewed, totals: deductedTotals, skippedItems });
          appData.housekeeping.deductedDates.push(todayDate);
          appData.housekeeping.deductedDates = [...new Set(appData.housekeeping.deductedDates)].sort().slice(-730);
          appData.housekeeping.processedBatches = appData.housekeeping.processedBatches.slice(-500);
          appData.housekeeping.deductions = appData.housekeeping.deductions.slice(0, 200);
          await saveData(appData);
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ success: true, partial: skippedItems.length > 0, rooms: reviewed, roomDetails, totals: deductedTotals, skippedItems, items: appData.items }));
        } catch (e) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: e.message }));
        }
      });
      return;
    }

    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: "Endpoint not found" }));
    return;
  }

  let filePath = path.join(PUBLIC_DIR, pathname === '/' ? 'index.html' : pathname);
  const ext = path.extname(filePath).toLowerCase();
  let contentType = mimeTypes[ext] || 'application/octet-stream';
  if (pathname === '/manifest.json') contentType = 'application/manifest+json; charset=utf-8';
  if (pathname === '/sw.js') contentType = 'application/javascript; charset=utf-8';

  // The icon source files are base64-encoded PNG payloads so this server
  // returns real PNG bytes with the correct image/png content type.
  if (pathname === '/icons/icon-192.png' || pathname === '/icons/icon-512.png') {
    fs.readFile(filePath, 'utf8', (err, encoded) => {
      if (err) {
        res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
        res.end('Icon not found');
        return;
      }
      try {
        let png = Buffer.from(encoded.trim(), 'base64');
        if (pathname === '/icons/icon-512.png') png = resizeRgbPng(png, 512);
        res.writeHead(200, { 'Content-Type': 'image/png', 'Cache-Control': 'public, max-age=31536000, immutable' });
        res.end(png);
      } catch (_) {
        res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
        res.end('Icon could not be decoded');
      }
    });
    return;
  }

  fs.readFile(filePath, (err, content) => {
    if (err) {
      if (err.code === 'ENOENT') {
        fs.readFile(path.join(PUBLIC_DIR, 'index.html'), (err2, fallbackContent) => {
          if (err2) {
            res.writeHead(404, { 'Content-Type': 'text/plain' });
            res.end('404 Not Found');
          } else {
            res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
            res.end(fallbackContent);
          }
        });
      } else {
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end(`Server Error: ${err.code}`);
      }
    } else {
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(content);
    }
  });
});

if (!process.env.VERCEL) {
  server.listen(PORT, '0.0.0.0', () => {
    const lanIps = getLocalIpAddresses();
    console.log(`\n======================================================`);
    console.log(`🏠 HOUSEKEEPING STOCK COUNT SERVER RUNNING!`);
    console.log(`------------------------------------------------------`);
    console.log(`💻 Local access (This PC):    http://localhost:${PORT}`);
    if (lanIps.length > 0) {
      lanIps.forEach(ip => {
        console.log(`📱 Mobile/Staff WiFi access: http://${ip}:${PORT}`);
      });
    }
    console.log(`======================================================\n`);
  });
}

module.exports = server;
