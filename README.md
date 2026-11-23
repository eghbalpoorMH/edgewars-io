# EdgeWars.io — 2.5D Serverless Territory Warfare

**EdgeWars.io** is a real-time multiplayer territory-capture `.io` browser game inspired by *Paper.io 2*, featuring **2.5D extruded pseudo-3D visuals**, procedural **Web Audio API** sound effects, **smart Edge AI bots**, **private friend rooms (`?room=CODE`)**, and a **Global Daily Top 5 Leaderboard**.

The entire application—frontend UI, 2.5D game engine, multiplayer room sync (`/api/sync`), and leaderboard (`/api/leaderboard`)—runs **100% serverless inside a single ArvanCloud Edge Worker (`worker.js`)** with zero external VPS/Cloud servers, zero third-party CDN assets, and zero WebSocket servers.

---

## Project Structure

- `index.html` — Complete single-file frontend (HTML5 Canvas 2.5D engine, flood-fill territory capture, 8 animated 3D skins, Web Audio synthesizer, virtual joystick, and graceful offline bot fallback).
- `worker.js` — Production **ArvanCloud Edge Worker** script serving `GET /`, `POST /api/sync`, and `GET/POST /api/leaderboard` with Edge KV (`EDGEWARS_KV`) + in-memory isolate cache.
- `build-worker.js` — Zero-dependency bundler that embeds `index.html` into `worker.js`.
- `dev-server.js` — Lightweight local Node.js Edge Worker emulator (`http://localhost:8787`).

---

## Local Development & Testing

```bash
# 1. Bundle index.html into worker.js and start the local Edge emulator
npm start
```

Open `http://localhost:8787` in two browser tabs, click **Create Private Room** in Tab 1, and open the `?room=XXXXX` invite link in Tab 2 to test real-time multiplayer sync.

You can also open `index.html` directly in any browser (`file://`)—it automatically falls back to **Offline Edge Simulator** mode with 11 AI bots.

---

## Deploying to ArvanCloud Edge Compute

1. **Bundle the latest build:**
   ```bash
   npm run build
   ```
2. **Create an Edge KV Namespace** in the **ArvanCloud Panel → Edge Compute → KV Storage**:
   - Name it `EDGEWARS_KV` (used for persisting the Daily Top 5 Global Leaderboard).
3. **Create a new Edge Worker** in **ArvanCloud Panel → Edge Compute → Workers**:
   - Paste the contents of `worker.js` into the Worker editor (or upload `worker.js`).
   - Bind your KV namespace under **Bindings / Variables** as `EDGEWARS_KV`.
4. **Deploy & Route:**
   - Attach your domain/subdomain route (e.g. `edgewars.yourdomain.ir/*`) to the Worker and click **Deploy**.
