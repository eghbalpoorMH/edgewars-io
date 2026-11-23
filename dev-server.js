const http = require('http');
const path = require('path');
const { pathToFileURL } = require('url');

const PORT = Number(process.env.PORT) || 8787;

const kvStore = new Map();
const mockKV = {
  async get(key) { return kvStore.get(key) || null; },
  async put(key, val) { kvStore.set(key, val); }
};

let workerModule = null;

const server = http.createServer(async (req, res) => {
  try {
    if (!workerModule) {
      workerModule = (await import(pathToFileURL(path.join(__dirname, 'worker.js')).href)).default;
    }

    const chunks = [];
    for await (const chunk of req) chunks.push(chunk);
    const body = chunks.length > 0 ? Buffer.concat(chunks) : undefined;

    const fullUrl = `http://localhost:${PORT}${req.url}`;
    const request = new Request(fullUrl, {
      method: req.method,
      headers: req.headers,
      body: req.method !== 'GET' && req.method !== 'HEAD' ? body : undefined
    });

    const response = await workerModule.fetch(request, { EDGEWARS_KV: mockKV });
    res.writeHead(response.status, Object.fromEntries(response.headers.entries()));
    const ab = await response.arrayBuffer();
    res.end(Buffer.from(ab));
  } catch (err) {
    console.error('Dev server error:', err);
    res.writeHead(500, { 'Content-Type': 'text/plain' });
    res.end('Internal Server Error');
  }
});

server.listen(PORT, () => {
  console.log(`EdgeWars.io local ArvanCloud Edge emulator running at http://localhost:${PORT}`);
});
