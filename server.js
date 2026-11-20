const http = require('http');
const fs = require('fs');
const path = require('path');
const os = require('os');

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
