const http = require('http');
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

function loadData() {
  try {
    if (!fs.existsSync(DATA_FILE)) {
      fs.writeFileSync(DATA_FILE, JSON.stringify(defaultData, null, 2), 'utf8');
      return defaultData;
    }
    const raw = fs.readFileSync(DATA_FILE, 'utf8');
    return JSON.parse(raw);
  } catch (err) {
    console.error("Error reading data file:", err);
    return defaultData;
  }
}

function saveData(data) {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf8');
  } catch (err) {
    console.error("Error saving data file:", err);
  }
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

          // Error if count is 1000 or more
          if (numCount >= 1000) {
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
          if (!reviewed.length) throw new Error('No confirmed CK OUT rooms were supplied.');
          const changes = [];
          for (const [id, qty] of Object.entries(totals)) {
            const item = appData.items.find(i => i.id === id);
            if (!item) throw new Error('Inventory item missing: ' + id);
            if (!Number.isInteger(item.currentCount) || item.currentCount < qty) {
              throw new Error('NO STOCK - ' + item.name + '. Required: ' + qty + ', available: ' + item.currentCount);
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
