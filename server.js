const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');
const os = require('os');
const crypto = require('crypto');

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

function saveData(data) {
  try {
    const targetFile = getDataFilePath();
    fs.writeFileSync(targetFile, JSON.stringify(data, null, 2), 'utf8');
  } catch (err) {
    console.error("Error saving data file:", err);
  }
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

function callGeminiInteractionsApi(model, inputParts, apiKey, timeoutMs = 45000) {
  return new Promise((resolve, reject) => {
    const payload = JSON.stringify({
      model: model,
      input: inputParts,
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
    {
      type: 'image',
      mime_type: mimeType,
      data: imageBase64
    },
    {
      type: 'text',
      text: prompt
    }
  ];

  const failureLog = [];

  // Tier 1: Gemini 3.8 Flash via modern Google Interactions API
  if (geminiKey) {
    try {
      const text = await callGeminiInteractionsApi('gemini-3.8-flash', interactionsInput, geminiKey);
      if (text) return { text, model: 'gemini-3.8-flash' };
    } catch (err) {
      console.warn(`[AI Vision] gemini-3.8-flash failed (${err.message}). Trying fallback model...`);
      failureLog.push(`gemini-3.8-flash: ${err.message}`);
    }

    // Tier 2: Gemini 3.5 Flash Lite (Fast throughput fallback)
    try {
      const text = await callGeminiInteractionsApi('gemini-3.5-flash-lite', interactionsInput, geminiKey);
      if (text) return { text, model: 'gemini-3.5-flash-lite (load fallback)' };
    } catch (err) {
      console.warn(`[AI Vision] gemini-3.5-flash-lite failed (${err.message}). Trying next fallback...`);
      failureLog.push(`gemini-3.5-flash-lite: ${err.message}`);
    }

    // Tier 3: Gemini 3.6 Flash fallback
    try {
      const text = await callGeminiInteractionsApi('gemini-3.6-flash', interactionsInput, geminiKey);
      if (text) return { text, model: 'gemini-3.6-flash (fallback)' };
    } catch (err) {
      console.warn(`[AI Vision] gemini-3.6-flash failed (${err.message}).`);
      failureLog.push(`gemini-3.6-flash: ${err.message}`);
    }
  }

  // Tier 4: OpenAI GPT-4o-mini Vision (Fallback provider if configured)
  if (openAiKey) {
    try {
      const text = await callOpenAiChat({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'user',
            content: [
              { type: 'text', text: prompt },
              {
                type: 'image_url',
                image_url: { url: `data:${mimeType};base64,${imageBase64}` }
              }
            ]
          }
        ],
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

  const interactionsInput = [
    {
      type: 'text',
      text: prompt
    }
  ];

  const failureLog = [];

  // Tier 1: Gemini 3.8 Flash via modern Google Interactions API
  if (geminiKey) {
    try {
      const text = await callGeminiInteractionsApi('gemini-3.8-flash', interactionsInput, geminiKey);
      if (text) return { text, model: 'gemini-3.8-flash' };
    } catch (err) {
      console.warn(`[AI Review] gemini-3.8-flash failed (${err.message}). Trying fallback...`);
      failureLog.push(`gemini-3.8-flash: ${err.message}`);
    }

    // Tier 2: Gemini 3.5 Flash Lite
    try {
      const text = await callGeminiInteractionsApi('gemini-3.5-flash-lite', interactionsInput, geminiKey);
      if (text) return { text, model: 'gemini-3.5-flash-lite (load fallback)' };
    } catch (err) {
      console.warn(`[AI Review] gemini-3.5-flash-lite failed (${err.message}). Trying next fallback...`);
      failureLog.push(`gemini-3.5-flash-lite: ${err.message}`);
    }
  }

  // Tier 3: OpenAI GPT-4o-mini
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

let appData = loadData();

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

const mimeTypes = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon'
};

const server = http.createServer((req, res) => {
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
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');


    // POST /api/item-photo - save a stock photo against an inventory item
    if (pathname === '/api/item-photo' && req.method === 'POST') {
      let body = '';
      req.on('data', chunk => {
        body += chunk;
        if (body.length > 8 * 1024 * 1024) req.destroy();
      });
      req.on('end', () => {
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
          saveData(appData);
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
      req.on('end', () => {
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

          saveData(appData);

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
      req.on('end', () => {
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
          saveData(appData);
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
            'You are reading a hotel housekeeping rooming sheet directly from this image. Do not use OCR software.',
            'Extract every data row that has a room number. Read the room-number cell, ROOMS count, status, and ETA/check-in time from the table.',
            'Return ONLY valid JSON in this exact shape: {"rows":[{"roomNumber":"101-119","expectedRoomCount":16,"status":"CK OUT","arrivalTime":"","confidence":0.95,"reason":""}]}',
            'Allowed status values: CK OUT, STAY, STAY BACK, CK IN, NOT CLEAR.',
            'CRITICAL FOR ROOM RANGES & GROUPS: When a cell or booking covers multiple rooms or a range (e.g. 101-119, 101-112, 114-119, 123-125), YOU MUST OUTPUT THE FULL RANGE (e.g. "101-119") or all rooms in roomNumber. NEVER truncate, shorten, or replace a range like 101-119 with a single room like 114!',
            'Read the ROOMS count accurately from the ROOMS column (e.g. 16 for a group of 16 rooms). Do not confuse ROOMS count with adults, children, or meal counts.',
            'Recognize room ranges and grouped room numbers faithfully, e.g. 101-119, 101-112, 114-119, 123-125, 131-136, A1, A2, D1, D2, Treehouse, Clubvilla.',
            'For CK IN, include ETA only when a clearly printed check-in/ETA time belongs to that row. Otherwise arrivalTime must be empty.',
            'Do not infer missing data. Use NOT CLEAR and low confidence when uncertain. Do not invent room numbers or duplicate rows.',
            'Ignore headings, totals, notes, and rows without a room number. Preserve the visual row order.',
            'No stock calculations or deductions.'
          ].join(' ');

          const { text: modelText, model: usedModel } = await executeVisionAiWithFallback(prompt, imageBase64, mimeType);

          let aiData;
          try {
            aiData = JSON.parse(modelText || '{}');
          } catch (_) {
            throw new Error('AI response was not valid JSON. Please upload a clearer image.');
          }
          const allowedStatuses = new Set(['CK OUT', 'STAY', 'STAY BACK', 'CK IN', 'NOT CLEAR']);
          const rows = (Array.isArray(aiData.rows) ? aiData.rows : []).slice(0, 80).map(row => ({
            roomNumber: typeof row.roomNumber === 'string' ? row.roomNumber.slice(0, 120) : '',
            expectedRoomCount: Number.isInteger(row.expectedRoomCount) && row.expectedRoomCount > 0 ? row.expectedRoomCount : null,
            status: allowedStatuses.has(String(row.status || '').toUpperCase()) ? String(row.status).toUpperCase() : 'NOT CLEAR',
            arrivalTime: typeof row.arrivalTime === 'string' ? row.arrivalTime.slice(0, 16) : '',
            confidence: Math.max(0, Math.min(1, Number(row.confidence) || 0)),
            reason: typeof row.reason === 'string' ? row.reason.slice(0, 180) : ''
          })).filter(row => row.roomNumber);

          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ success: true, model: usedModel, rows }));
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

    // POST /api/housekeeping/deduct - apply reviewed checkout supplies exactly once
    if (pathname === '/api/housekeeping/deduct' && req.method === 'POST') {
      let body = '';
      req.on('data', chunk => { body += chunk; if (body.length > 100000) req.destroy(); });
      req.on('end', () => {
        try {
          const payload = JSON.parse(body || '{}');
          const { batchId, rooms, staffName } = payload;
          if (!batchId || typeof batchId !== 'string' || !Array.isArray(rooms) || !rooms.length) {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'batchId and reviewed checkout rooms are required' }));
            return;
          }
          appData = loadData();
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
          for (const [id, qty] of Object.entries(totals)) {
            const item = appData.items.find(i => i.id === id);
            if (!item) throw new Error('Inventory item missing: ' + id);
            if (item.currentCount === null || item.currentCount === undefined || !Number.isInteger(item.currentCount)) {
              throw new Error('STOCK NOT COUNTED - ' + item.name + '. Stock count cheythittilla. Please count this item first.');
            }
            if (item.currentCount < qty) {
              throw new Error('INSUFFICIENT STOCK - ' + item.name + '. Required: ' + qty + ', available: ' + item.currentCount);
            }
            changes.push({ item, qty, previousCount: item.currentCount });
          }
          const timestamp = new Date().toISOString();
          for (const change of changes) {
            change.item.currentCount -= change.qty;
            change.item.lastCountedAt = timestamp;
            change.item.countedBy = staffName && String(staffName).trim() ? String(staffName).trim() : 'Staff';
            if (!appData.history) appData.history = [];
            appData.history.unshift({
              timestamp, itemId: change.item.id, itemName: change.item.name,
              previousCount: change.previousCount, newCount: change.item.currentCount,
              staffName: change.item.countedBy, action: 'room_supply_deduction',
              batchId, quantityUsed: change.qty, rooms: reviewed
            });
          }
          appData.housekeeping.processedBatches.push(batchId);
          appData.housekeeping.deductions.unshift({ batchId, timestamp, rooms: reviewed, totals, staffName: staffName || 'Staff' });
          appData.housekeeping.processedBatches = appData.housekeeping.processedBatches.slice(-500);
          appData.housekeeping.deductions = appData.housekeeping.deductions.slice(0, 200);
          saveData(appData);
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ success: true, rooms: reviewed, roomDetails, totals, items: appData.items }));
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
  const contentType = mimeTypes[ext] || 'application/octet-stream';

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
