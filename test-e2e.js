/**
 * EdgeWars.io — Real End-to-End Physics, Bot AI & Edge Worker Sync Test Suite
 * Executes the ACTUAL <script> from index.html against the ACTUAL worker.js fetch() handler!
 */
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const { pathToFileURL } = require('url');

function createMockElement(id = '') {
  return {
    id,
    value: id === 'sel-win-mode' ? 'territory:30' : (id === 'sel-bot-count' ? '6' : 'TestHero'),
    checked: true,
    textContent: '',
    innerHTML: '',
    title: '',
    dataset: {},
    style: {},
    classList: {
      _set: new Set(),
      add(c) { this._set.add(c); },
      remove(c) { this._set.delete(c); },
      toggle(c, f) { if (f === undefined) this._set.has(c) ? this._set.delete(c) : this._set.add(c); else if (f) this._set.add(c); else this._set.delete(c); },
      contains(c) { return this._set.has(c); }
    },
    addEventListener() {},
    appendChild() {},
    getBoundingClientRect() { return { left: 0, top: 0, width: 120, height: 120 }; },
    getContext() {
      return new Proxy({}, { get: () => () => {} });
    }
  };
}

async function runTests() {
  const workerMod = (await import(pathToFileURL(path.join(__dirname, 'worker.js')).href)).default;
  const html = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8');
  const scriptMatch = html.match(/<script>([\s\S]*?)<\/script>/);
  if (!scriptMatch) throw new Error('Could not extract <script> from index.html');

  const elements = new Map();
  const getEl = (id) => {
    if (!elements.has(id)) elements.set(id, createMockElement(id));
    return elements.get(id);
  };

  const storage = new Map();
  const sandbox = {
    console,
    Math, Date, Set, Map, Array, Object, Number, String, Boolean, JSON,
    Uint8Array, Int32Array, Float32Array, URL, URLSearchParams,
    performance: { now: () => Date.now() },
    setTimeout: () => 0,
    clearTimeout: () => {},
    setInterval: () => 0,
    clearInterval: () => {},
    requestAnimationFrame: () => 0,
    localStorage: {
      getItem: (k) => storage.has(k) ? storage.get(k) : null,
      setItem: (k, v) => storage.set(k, String(v))
    },
    navigator: {},
    document: {
      getElementById: getEl,
      createElement: () => createMockElement(),
      querySelectorAll: () => []
    },
    fetch: async (urlPath, opts = {}) => {
      const req = new Request('https://edgewars.test' + urlPath, {
        method: opts.method || 'GET',
        headers: opts.headers || {},
        body: opts.body
      });
      return workerMod.fetch(req, {});
    }
  };
  sandbox.window = sandbox;
  sandbox.window.innerWidth = 1280;
  sandbox.window.innerHeight = 720;
  sandbox.window.location = { href: 'https://edgewars.test/', pathname: '/', search: '' };
  sandbox.window.history = { replaceState() {} };
  sandbox.window.addEventListener = () => {};

  vm.createContext(sandbox);
  vm.runInContext(scriptMatch[1], sandbox);

  const E = sandbox.window.__EDGEWARS__;
  if (!E) throw new Error('window.__EDGEWARS__ hook not found!');

  const countOwned = (id) => {
    let c = 0;
    for (let i = 0; i < E.territory.length; i++) if (E.territory[i] === id) c++;
    return c;
  };

  const countComponents = (id) => {
    const owned = [];
    for (let i = 0; i < E.territory.length; i++) if (E.territory[i] === id) owned.push(i);
    if (owned.length === 0) return 0;
    const ownedSet = new Set(owned);
    const vis = new Set();
    let comps = 0;
    for (const start of owned) {
      if (vis.has(start)) continue;
      comps++;
      const q = [start];
      vis.add(start);
      let h = 0;
      while (h < q.length) {
        const curr = q[h++];
        const cx = curr % E.GRID_SIZE;
        const cy = (curr / E.GRID_SIZE) | 0;
        for (const n of [
          cx > 0 ? curr - 1 : -1,
          cx < E.GRID_SIZE - 1 ? curr + 1 : -1,
          cy > 0 ? curr - E.GRID_SIZE : -1,
          cy < E.GRID_SIZE - 1 ? curr + E.GRID_SIZE : -1
        ]) {
          if (n !== -1 && ownedSet.has(n) && !vis.has(n)) { vis.add(n); q.push(n); }
        }
      }
    }
    return comps;
  };

  // =========================================================================
  // TEST 1: Deterministic Loop Capture + 10 Real /api/sync Round-Trips
  // =========================================================================
  E.startMatch('public', 'PUBLIC');
  await E.syncWithEdge(); // receives assignedSpawn from real worker.js

  const me = E.state.me;
  const initialCells = countOwned(E.state.playerId);
  if (initialCells !== 25) throw new Error(`Test 1 FAIL: expected 25 starting cells, got ${initialCells}`);

  // Drive a clean 5x5 rectangular expansion loop outside base (East -> South -> West back into base)
  me.x = (me.baseGx + 0.5) * E.CELL_SIZE;
  me.y = (me.baseGy - 2 + 0.5) * E.CELL_SIZE;
  me.dx = 1; me.dy = 0; me.nextDx = 1; me.nextDy = 0;

  const stepFrames = (n) => {
    for (let f = 0; f < n; f++) {
      E.rebuildTrailGrid();
      E.stepEntityPhysics(me, 1 / 60);
    }
  };

  stepFrames(45); // move East ~5 cells out of base
  E.setDirection(0, 1);
  stepFrames(35); // move South ~4 cells
  E.setDirection(-1, 0);
  stepFrames(55); // move West back into base to trigger flood-fill!

  const afterCapture = countOwned(E.state.playerId);
  if (afterCapture <= initialCells + 15) {
    throw new Error(`Test 1 FAIL: loop capture gave only ${afterCapture} cells (started with ${initialCells})`);
  }

  // Now run 10 real POST /api/sync round-trips against worker.js and verify ZERO cells are lost!
  for (let t = 0; t < 10; t++) {
    await E.syncWithEdge();
    if (!me.alive) throw new Error(`Test 1 FAIL: player died mysteriously on sync tick ${t}!`);
    const curCells = countOwned(E.state.playerId);
    if (curCells < afterCapture) {
      throw new Error(`Test 1 FAIL: lost territory during sync tick ${t}! before=${afterCapture}, after=${curCells}`);
    }
  }
  console.log(`✅ Test 1 PASS: Loop capture (${initialCells} -> ${afterCapture} cells) intact across 10 real /api/sync ticks!`);

  // =========================================================================
  // TEST 2: 3,600 Frames (60s @ 60 FPS) with 11 AI Bots + Real /api/sync
  // =========================================================================
  let violations = [];
  const botStuckCounter = new Map();

  for (let frame = 0; frame < 3600; frame++) {
    E.rebuildTrailGrid();
    for (const ent of E.state.entities.values()) {
      if (!ent.alive) continue;
      if (ent.isBot) {
        E.stepLocalBot(ent, 1 / 60);
        E.stepEntityPhysics(ent, 1 / 60);
      }
    }

    if (frame % 10 === 0) {
      await E.syncWithEdge();
    }

    // Check strict invariants
    for (let i = 0; i < E.territory.length; i++) {
      const oid = E.territory[i];
      if (oid) {
        const owner = E.state.entities.get(oid);
        if (!owner || !owner.alive) {
          violations.push(`Frame ${frame}: orphan/invisible territory owner ${oid} at cell ${i}`);
          break;
        }
      }
    }

    for (const ent of E.state.entities.values()) {
      if (!ent.alive) continue;
      // Duplicate trail check
      if (new Set(ent.trail).size !== ent.trail.length) {
        violations.push(`Frame ${frame}: ${ent.id} has duplicate cells in trail!`);
      }
      // Floating outside territory without trail check
      const gx = Math.floor(ent.x / E.CELL_SIZE);
      const gy = Math.floor(ent.y / E.CELL_SIZE);
      if (E.inBounds(gx, gy)) {
        const idx = E.cellIdx(gx, gy);
        if (E.territory[idx] !== ent.id && !ent.trail.includes(idx)) {
          violations.push(`Frame ${frame}: ${ent.id} is outside own territory without trail cell!`);
        }
      }
      // Single connected component check (every 60 frames for speed)
      if (frame % 60 === 0) {
        const comps = countComponents(ent.id);
        if (comps !== 1) {
          violations.push(`Frame ${frame}: ${ent.id} has ${comps} disconnected territory components!`);
        }
      }
      // Wall-stuck check for bots
      if (ent.isBot) {
        const cellKey = `${gx},${gy}`;
        const prev = botStuckCounter.get(ent.id) || { key: '', count: 0 };
        if (prev.key === cellKey) prev.count++;
        else { prev.key = cellKey; prev.count = 1; }
        botStuckCounter.set(ent.id, prev);
        if (prev.count > 40) {
          violations.push(`Frame ${frame}: bot ${ent.id} stuck at ${cellKey} for ${prev.count} frames!`);
        }
      }
    }
    if (violations.length > 0) break;
  }

  if (violations.length > 0) {
    console.error('❌ Test 2 FAIL:', violations[0]);
    process.exit(1);
  }
  console.log('✅ Test 2 PASS: 3,600 frames (60s @ 60 FPS) with 11 bots + real /api/sync — ZERO invariant violations!');

  // =========================================================================
  // TEST 3: Private Room Lobby Host vs Guest Isolation
  // =========================================================================
  const rHost = await (await sandbox.fetch('/api/lobby', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ roomCode: 'E2E99', playerId: 'host_1', isCreator: true, name: 'HostPlayer', color: '#00f5d4' })
  })).json();
  const rGuest = await (await sandbox.fetch('/api/lobby', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ roomCode: 'E2E99', playerId: 'guest_2', isCreator: false, name: 'HostPlayer', color: '#00f5d4' })
  })).json();

  if (rGuest.hostId !== 'host_1') throw new Error(`Test 3 FAIL: guest hijacked hostId (${rGuest.hostId})`);
  const gPlayer = rGuest.players.find((p) => p.id === 'guest_2');
  if (!gPlayer || gPlayer.isHost) throw new Error('Test 3 FAIL: guest marked as isHost');
  if (gPlayer.color === '#00f5d4') throw new Error('Test 3 FAIL: guest allowed duplicate color #00f5d4');
  if (gPlayer.name === 'HostPlayer') throw new Error('Test 3 FAIL: guest allowed duplicate name HostPlayer');
  console.log(`✅ Test 3 PASS: Lobby isolation verified (guest assigned unique name="${gPlayer.name}", unique color="${gPlayer.color}", isHost=false)!`);
}

runTests().catch((err) => {
  console.error('❌ E2E Suite Failed:', err);
  process.exit(1);
});
