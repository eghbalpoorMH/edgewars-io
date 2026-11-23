/**
 * EdgeWars.io — ArvanCloud Edge Worker
 * 100% Serverless Multiplayer Game Engine (HTTP State Sync + Edge KV + Static HTML)
 * Compatible with both Service Worker (`addEventListener('fetch')`) and ES Module Worker (`export default { fetch }`).
 */

const HTML_CONTENT = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover">
<title>EdgeWars.io — 2.5D Serverless Territory Warfare</title>
<style>
  :root {
    --bg-deep: #070b14;
    --bg-panel: rgba(13, 20, 36, 0.86);
    --bg-card: rgba(20, 30, 54, 0.78);
    --border-glow: rgba(0, 245, 212, 0.35);
    --accent-cyan: #00f5d4;
    --accent-pink: #ff007f;
    --accent-gold: #ffbe0b;
    --accent-purple: #9b5de5;
    --text-main: #f1f5f9;
    --text-muted: #94a3b8;
    --font-stack: 'Vazirmatn', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  }

  * {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
    user-select: none;
    -webkit-user-select: none;
    touch-action: none;
  }

  html, body {
    width: 100%;
    height: 100%;
    overflow: hidden;
    background: var(--bg-deep);
    color: var(--text-main);
    font-family: var(--font-stack);
  }

  #game-canvas {
    position: fixed;
    inset: 0;
    width: 100%;
    height: 100%;
    display: block;
    background: radial-gradient(circle at center, #0e172a 0%, #050811 100%);
  }

  /* Overlay Screens */
  .overlay-screen {
    position: fixed;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 16px;
    background: radial-gradient(circle at 50% 30%, rgba(15, 23, 42, 0.78), rgba(5, 8, 17, 0.94));
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
    z-index: 50;
    overflow-y: auto;
  }

  .overlay-screen.hidden {
    display: none !important;
  }

  .panel {
    width: 100%;
    max-width: 880px;
    background: var(--bg-panel);
    border: 1px solid var(--border-glow);
    border-radius: 20px;
    padding: 24px;
    box-shadow: 0 24px 64px rgba(0, 0, 0, 0.65), 0 0 40px rgba(0, 245, 212, 0.12);
    max-height: 94vh;
    overflow-y: auto;
  }

  .header-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    margin-bottom: 18px;
  }

  .logo-wrap h1 {
    font-size: clamp(1.8rem, 4vw, 2.7rem);
    font-weight: 900;
    letter-spacing: -0.03em;
    background: linear-gradient(135deg, #00f5d4 0%, #00bbf9 45%, #ff007f 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    line-height: 1.1;
  }

  .logo-wrap p {
    font-size: 0.85rem;
    color: var(--text-muted);
    margin-top: 4px;
  }

  .icon-btn {
    background: var(--bg-card);
    border: 1px solid rgba(255, 255, 255, 0.14);
    color: var(--text-main);
    border-radius: 12px;
    padding: 8px 12px;
    font-size: 0.85rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.15s ease;
    display: inline-flex;
    align-items: center;
    gap: 6px;
  }

  .icon-btn:hover {
    border-color: var(--accent-cyan);
    transform: translateY(-1px);
  }

  .start-grid {
    display: grid;
    grid-template-columns: 1.35fr 1fr;
    gap: 20px;
  }

  @media (max-width: 760px) {
    .start-grid {
      grid-template-columns: 1fr;
    }
    .panel {
      padding: 16px;
    }
  }

  .section-label {
    font-size: 0.78rem;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: var(--accent-cyan);
    font-weight: 700;
    margin-bottom: 8px;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .input-group {
    display: flex;
    gap: 10px;
    margin-bottom: 14px;
  }

  input[type="text"] {
    flex: 1;
    background: rgba(7, 11, 20, 0.85);
    border: 1px solid rgba(255, 255, 255, 0.18);
    border-radius: 12px;
    padding: 12px 14px;
    color: var(--text-main);
    font-size: 0.95rem;
    font-family: inherit;
    outline: none;
    transition: border-color 0.15s;
    user-select: text;
    -webkit-user-select: text;
  }

  input[type="text"]:focus {
    border-color: var(--accent-cyan);
    box-shadow: 0 0 0 3px rgba(0, 245, 212, 0.15);
  }

  /* Skin Selector */
  .skin-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 8px;
    margin-bottom: 16px;
  }

  @media (max-width: 480px) {
    .skin-grid {
      grid-template-columns: repeat(4, 1fr);
      gap: 6px;
    }
  }

  .skin-card {
    background: var(--bg-card);
    border: 2px solid rgba(255, 255, 255, 0.08);
    border-radius: 12px;
    padding: 6px 4px;
    cursor: pointer;
    text-align: center;
    transition: all 0.16s ease;
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  .skin-card:hover {
    border-color: rgba(255, 255, 255, 0.3);
    transform: translateY(-2px);
  }

  .skin-card.active {
    border-color: var(--accent-cyan);
    background: rgba(0, 245, 212, 0.12);
    box-shadow: 0 0 18px rgba(0, 245, 212, 0.25);
  }

  .skin-card canvas {
    width: 54px;
    height: 54px;
    display: block;
  }

  .skin-card span {
    font-size: 0.68rem;
    font-weight: 600;
    color: var(--text-muted);
    margin-top: 2px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 100%;
  }

  .skin-card.active span {
    color: var(--text-main);
  }

  .color-palette {
    display: grid;
    grid-template-columns: repeat(10, 1fr);
    gap: 6px;
    margin-bottom: 14px;
  }

  .color-swatch {
    width: 100%;
    aspect-ratio: 1;
    border-radius: 8px;
    border: 2px solid transparent;
    cursor: pointer;
    transition: transform 0.12s, border-color 0.12s;
  }

  .color-swatch:hover {
    transform: scale(1.12);
  }

  .color-swatch.active {
    border-color: #ffffff;
    box-shadow: 0 0 10px rgba(255, 255, 255, 0.7);
    transform: scale(1.1);
  }

  .color-swatch.taken {
    opacity: 0.22;
    pointer-events: none;
    position: relative;
  }

  /* Buttons */
  .btn {
    border: none;
    border-radius: 12px;
    padding: 12px 18px;
    font-size: 0.95rem;
    font-weight: 700;
    font-family: inherit;
    cursor: pointer;
    transition: all 0.16s ease;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
  }

  .btn-primary {
    width: 100%;
    background: linear-gradient(135deg, #00f5d4 0%, #00bbf9 100%);
    color: #041018;
    box-shadow: 0 8px 24px rgba(0, 245, 212, 0.3);
    margin-bottom: 10px;
  }

  .btn-primary:hover {
    transform: translateY(-2px);
    box-shadow: 0 12px 28px rgba(0, 245, 212, 0.45);
  }

  .btn-secondary {
    background: rgba(155, 93, 229, 0.2);
    border: 1px solid rgba(155, 93, 229, 0.55);
    color: #e9d5ff;
  }

  .btn-secondary:hover {
    background: rgba(155, 93, 229, 0.32);
    transform: translateY(-1px);
  }

  .btn-pink {
    background: rgba(255, 0, 127, 0.2);
    border: 1px solid rgba(255, 0, 127, 0.55);
    color: #ffd6e7;
  }

  .btn-pink:hover {
    background: rgba(255, 0, 127, 0.32);
  }

  .room-actions {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 10px;
    margin-bottom: 12px;
  }

  .join-row {
    display: flex;
    gap: 8px;
    margin-bottom: 12px;
  }

  .join-row input {
    text-transform: uppercase;
    letter-spacing: 0.12em;
    font-weight: 700;
    text-align: center;
  }

  .toggle-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    background: rgba(7, 11, 20, 0.55);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 10px;
    padding: 8px 12px;
    font-size: 0.82rem;
    color: var(--text-muted);
    margin-bottom: 12px;
  }

  .invite-banner {
    background: rgba(0, 245, 212, 0.1);
    border: 1px solid rgba(0, 245, 212, 0.45);
    border-radius: 12px;
    padding: 10px 12px;
    margin-bottom: 12px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
    font-size: 0.82rem;
  }

  .invite-banner.hidden {
    display: none;
  }

  .invite-code {
    font-weight: 800;
    color: var(--accent-cyan);
    letter-spacing: 0.1em;
    font-size: 0.95rem;
  }

  /* Global Leaderboard */
  .lb-box {
    background: var(--bg-card);
    border: 1px solid rgba(255, 255, 255, 0.09);
    border-radius: 14px;
    padding: 14px;
    height: 100%;
    display: flex;
    flex-direction: column;
  }

  .lb-list {
    list-style: none;
    display: flex;
    flex-direction: column;
    gap: 8px;
    margin-top: 6px;
  }

  .lb-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    background: rgba(7, 11, 20, 0.55);
    padding: 8px 10px;
    border-radius: 10px;
    font-size: 0.84rem;
  }

  .lb-rank {
    font-weight: 800;
    width: 22px;
    color: var(--accent-gold);
  }

  .lb-name {
    flex: 1;
    font-weight: 600;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    margin-right: 8px;
  }

  .lb-score {
    font-weight: 700;
    color: var(--accent-cyan);
    font-size: 0.8rem;
  }

  .controls-hint {
    margin-top: auto;
    padding-top: 12px;
    font-size: 0.76rem;
    color: var(--text-muted);
    line-height: 1.5;
    border-top: 1px solid rgba(255, 255, 255, 0.08);
  }

  /* In-Game HUD */
  #hud {
    position: fixed;
    inset: 0;
    pointer-events: none;
    z-index: 20;
  }

  #hud.hidden {
    display: none;
  }

  .hud-top-left {
    position: fixed;
    top: 12px;
    left: 12px;
    display: flex;
    flex-direction: column;
    gap: 8px;
    pointer-events: auto;
  }

  .hud-pill {
    background: rgba(10, 16, 30, 0.82);
    border: 1px solid rgba(255, 255, 255, 0.12);
    backdrop-filter: blur(8px);
    border-radius: 12px;
    padding: 8px 12px;
    display: flex;
    align-items: center;
    gap: 12px;
    font-size: 0.82rem;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
  }

  .stat-val {
    font-weight: 800;
    color: var(--accent-cyan);
  }

  .hud-top-right {
    position: fixed;
    top: 12px;
    right: 12px;
    width: 215px;
    background: rgba(10, 16, 30, 0.82);
    border: 1px solid rgba(255, 255, 255, 0.12);
    backdrop-filter: blur(8px);
    border-radius: 14px;
    padding: 10px 12px;
    pointer-events: none;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
  }

  .hud-lb-title {
    font-size: 0.72rem;
    font-weight: 800;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: var(--text-muted);
    margin-bottom: 6px;
  }

  .hud-lb-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-size: 0.78rem;
    padding: 3px 0;
    gap: 6px;
  }

  .hud-lb-row.is-me {
    color: var(--accent-cyan);
    font-weight: 800;
  }

  .swatch {
    width: 10px;
    height: 10px;
    border-radius: 3px;
    flex-shrink: 0;
  }

  .hud-lb-name {
    flex: 1;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .tag-badge {
    font-size: 0.62rem;
    padding: 1px 4px;
    border-radius: 4px;
    background: rgba(255, 255, 255, 0.1);
    color: var(--text-muted);
  }

  .tag-badge.live {
    background: rgba(0, 245, 212, 0.18);
    color: var(--accent-cyan);
  }

  #minimap-canvas {
    position: fixed;
    bottom: 14px;
    right: 14px;
    width: 144px;
    height: 144px;
    border-radius: 14px;
    background: rgba(7, 11, 20, 0.85);
    border: 1px solid rgba(0, 245, 212, 0.35);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.5);
    pointer-events: none;
  }

  @media (max-width: 600px) {
    .hud-top-left {
      max-width: calc(100vw - 178px);
    }
    .hud-top-right {
      width: 156px;
      padding: 8px 10px;
    }
    #minimap-canvas {
      width: 108px;
      height: 108px;
      bottom: 10px;
      right: 10px;
    }
    .hud-pill {
      padding: 6px 8px;
      gap: 6px;
      font-size: 0.72rem;
      flex-wrap: wrap;
    }
  }

  /* Virtual Joystick */
  #joystick-zone {
    position: fixed;
    bottom: 24px;
    left: 24px;
    width: 120px;
    height: 120px;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.06);
    border: 2px solid rgba(0, 245, 212, 0.25);
    pointer-events: auto;
    display: none;
    align-items: center;
    justify-content: center;
  }

  #joystick-knob {
    width: 48px;
    height: 48px;
    border-radius: 50%;
    background: radial-gradient(circle at 35% 35%, #00f5d4, #00bbf9);
    box-shadow: 0 4px 16px rgba(0, 245, 212, 0.45);
    transform: translate(0px, 0px);
    transition: transform 0.04s linear;
  }

  @media (pointer: coarse), (max-width: 768px) {
    #joystick-zone {
      display: flex;
    }
  }

  /* Game Over Stats */
  .gameover-panel {
    max-width: 460px;
    text-align: center;
  }

  .gameover-title {
    font-size: 2rem;
    font-weight: 900;
    color: var(--accent-pink);
    margin-bottom: 4px;
  }

  .stats-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 10px;
    margin: 18px 0;
  }

  .stat-box {
    background: var(--bg-card);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 12px;
    padding: 12px;
  }

  .stat-box .num {
    font-size: 1.4rem;
    font-weight: 800;
    color: var(--accent-cyan);
  }

  .stat-box .lbl {
    font-size: 0.74rem;
    color: var(--text-muted);
    margin-top: 2px;
  }

  .toast {
    position: fixed;
    bottom: 24px;
    left: 50%;
    transform: translateX(-50%) translateY(20px);
    background: rgba(0, 245, 212, 0.95);
    color: #041018;
    font-weight: 800;
    font-size: 0.85rem;
    padding: 10px 18px;
    border-radius: 999px;
    opacity: 0;
    pointer-events: none;
    transition: all 0.22s ease;
    z-index: 100;
  }

  .toast.show {
    opacity: 1;
    transform: translateX(-50%) translateY(0);
  }
</style>
</head>
<body>

<canvas id="game-canvas"></canvas>

<!-- In-Game HUD -->
<div id="hud" class="hidden">
  <div class="hud-top-left">
    <div class="hud-pill">
      <div>Area: <span class="stat-val" id="hud-area">0.0%</span></div>
      <div>Kills: <span class="stat-val" id="hud-kills">0</span></div>
      <div>Score: <span class="stat-val" id="hud-score">0</span></div>
      <div><span id="hud-ping" style="color:#94a3b8;font-size:0.74rem;">EDGE</span></div>
    </div>
    <div class="hud-pill" style="gap:8px;">
      <span id="hud-room-badge" style="font-weight:700;color:#ffbe0b;">PUBLIC</span>
      <button class="icon-btn" id="btn-hud-copy" style="padding:4px 8px;font-size:0.72rem;" title="Copy Invite Link">Copy Link</button>
      <button class="icon-btn" id="btn-hud-mute" style="padding:4px 8px;font-size:0.72rem;">🔊</button>
    </div>
  </div>

  <div class="hud-top-right">
    <div class="hud-lb-title">Live Arena Ranking</div>
    <div id="hud-lb-rows"></div>
  </div>

  <div id="hud-goal" style="position:fixed;top:12px;left:50%;transform:translateX(-50%);background:rgba(10,16,30,0.85);border:1px solid rgba(255,190,11,0.45);border-radius:999px;padding:6px 14px;font-size:0.78rem;font-weight:800;color:#ffbe0b;pointer-events:none;display:none;">
    🎯 GOAL: 30% Territory
  </div>

  <canvas id="minimap-canvas" width="150" height="150"></canvas>

  <div id="joystick-zone">
    <div id="joystick-knob"></div>
  </div>
</div>

<!-- Start Screen -->
<div id="start-screen" class="overlay-screen">
  <div class="panel">
    <div class="header-row">
      <div class="logo-wrap">
        <h1>EdgeWars.io</h1>
        <p>2.5D Serverless Territory Warfare • ArvanCloud Edge • <span style="color:var(--accent-cyan);font-weight:700;">v1.5.0</span></p>
      </div>
      <div style="display:flex;gap:8px;align-items:center;">
        <a class="icon-btn" id="btn-github-link" href="https://github.com/eghbalpoorMH/edgewars-io" target="_blank" rel="noopener" style="text-decoration:none;">⭐ GitHub</a>
        <button class="icon-btn" id="btn-open-feedback">💬 ثبت نظر</button>
        <button class="icon-btn" id="btn-start-mute">🔊 Sound ON</button>
      </div>
    </div>

    <div class="start-grid">
      <div>
        <div class="section-label">
          <span>Player Identity</span>
          <span style="color:var(--text-muted);font-weight:500;">نام بازیکن</span>
        </div>
        <div class="input-group">
          <input type="text" id="input-nickname" maxlength="14" placeholder="Enter Nickname (e.g. ArvanHero)" value="CyberPilot">
        </div>

        <div class="section-label">
          <span>Select 2.5D Avatar</span>
          <span id="selected-skin-name" style="color:var(--accent-gold);">Neon Cyber Cube</span>
        </div>
        <div class="skin-grid" id="skin-grid"></div>

        <div id="invite-banner" class="invite-banner hidden">
          <div>
            Room Ready: <span class="invite-code" id="banner-room-code">XXXXX</span>
          </div>
          <button class="icon-btn" id="btn-copy-invite" style="padding:6px 10px;font-size:0.76rem;">📋 Copy Invite Link</button>
        </div>

        <button class="btn btn-primary" id="btn-play-public">▶ Play Public Match</button>

        <div class="room-actions">
          <button class="btn btn-secondary" id="btn-create-private">🔒 Create Private Room</button>
          <div class="toggle-row" style="margin-bottom:0;">
            <span>AI Bots</span>
            <input type="checkbox" id="chk-bots" checked style="width:18px;height:18px;cursor:pointer;">
          </div>
        </div>

        <div class="join-row">
          <input type="text" id="input-room-code" maxlength="5" placeholder="ROOM CODE">
          <button class="btn btn-pink" id="btn-join-room">Join Room</button>
        </div>
      </div>

      <div class="lb-box">
        <div class="section-label">
          <span>🏆 Daily Top 5</span>
          <span style="color:var(--text-muted);font-size:0.7rem;">Edge KV</span>
        </div>
        <ul class="lb-list" id="global-lb-list">
          <li class="lb-item"><span class="lb-rank">#1</span><span class="lb-name">Loading...</span><span class="lb-score">--</span></li>
        </ul>
        <div class="controls-hint">
          <strong>Desktop:</strong> WASD or Arrow Keys to steer.<br>
          <strong>Mobile:</strong> Drag Virtual Joystick or Swipe.<br>
          <strong>Rule:</strong> Leave your territory to draw a trail, return to capture! Cut enemy trails to eliminate them.
        </div>
      </div>
    </div>
  </div>
</div>

<!-- Private Room Waiting Lobby -->
<div id="lobby-screen" class="overlay-screen hidden">
  <div class="panel" style="max-width:740px;">
    <div class="header-row">
      <div class="logo-wrap">
        <h1 style="font-size:1.7rem;">Room Lobby: <span id="lobby-code-title" style="color:var(--accent-cyan);">XXXXX</span></h1>
        <p>اتاق انتظار دوستانه (ظرفیت ۲۰ نفر) • منتظر پیوستن دوستان بمانید</p>
      </div>
      <button class="icon-btn" id="btn-lobby-copy">📋 Copy Invite</button>
    </div>

    <div class="lb-box" style="margin-bottom:14px;">
      <div class="section-label"><span>Your Identity in Lobby (نام، آیکن و رنگ شما)</span></div>
      <div class="input-group" style="margin-bottom:10px;">
        <input type="text" id="lobby-nickname" maxlength="14" placeholder="Your Nickname">
      </div>
      <div class="skin-grid" id="lobby-skin-grid" style="margin-bottom:10px;"></div>
      <div class="color-palette" id="lobby-color-palette" style="margin-bottom:0;"></div>
    </div>

    <div class="start-grid" style="grid-template-columns:1fr 1fr;gap:16px;">
      <div class="lb-box">
        <div class="section-label"><span>Connected Players</span><span id="lobby-player-count">1 / 20</span></div>
        <ul class="lb-list" id="lobby-players-list"></ul>
      </div>

      <div class="lb-box">
        <div class="section-label"><span>Match Settings</span><span id="lobby-role-badge" style="color:var(--accent-gold);">HOST</span></div>
        <div style="display:flex;flex-direction:column;gap:10px;font-size:0.84rem;">
          <label style="display:flex;justify-content:space-between;align-items:center;">
            <span>AI Bots (تعداد ربات)</span>
            <select id="sel-bot-count" style="background:#070b14;color:#fff;border:1px solid rgba(255,255,255,0.2);border-radius:8px;padding:6px 8px;">
              <option value="0">0 (Only Friends)</option>
              <option value="2">2 Bots</option>
              <option value="4">4 Bots</option>
              <option value="6" selected>6 Bots</option>
              <option value="8">8 Bots</option>
              <option value="10">10 Bots</option>
              <option value="12">12 Bots</option>
              <option value="15">15 Bots</option>
              <option value="19">19 Bots (Fill 20)</option>
            </select>
          </label>

          <label style="display:flex;justify-content:space-between;align-items:center;">
            <span>Victory Goal (شرط برد)</span>
            <select id="sel-win-mode" style="background:#070b14;color:#fff;border:1px solid rgba(255,255,255,0.2);border-radius:8px;padding:6px 8px;">
              <option value="territory:20">🎯 20% Territory</option>
              <option value="territory:30" selected>🎯 30% Territory</option>
              <option value="territory:50">🎯 50% Territory</option>
              <option value="timed:120">⏱️ 2 Min Blitz</option>
              <option value="timed:180">⏱️ 3 Min Blitz</option>
              <option value="endless">♾️ Endless</option>
            </select>
          </label>
          <div id="win-mode-desc" style="font-size:0.76rem;color:var(--accent-cyan);background:rgba(0,245,212,0.08);border:1px solid rgba(0,245,212,0.2);border-radius:8px;padding:8px 10px;line-height:1.45;">
            اولین بازیکنی که ۳۰٪ از کل مساحت زمین را تصرف کند، بلافاصله برنده مسابقه می‌شود.
          </div>
        </div>
      </div>
    </div>

    <div style="margin-top:16px;display:flex;gap:10px;">
      <button class="btn btn-primary" id="btn-lobby-start" style="margin-bottom:0;">🚀 Start Match Now</button>
      <button class="btn btn-pink" id="btn-lobby-leave">Leave</button>
    </div>
  </div>
</div>

<!-- Match Victory Podium Screen -->
<div id="victory-screen" class="overlay-screen hidden">
  <div class="panel gameover-panel">
    <div style="font-size:2.4rem;">🏆</div>
    <div class="gameover-title" style="color:var(--accent-gold);" id="victory-winner-name">Champion!</div>
    <p id="victory-reason" style="color:var(--text-muted);font-size:0.92rem;margin-bottom:16px;">Reached 30% Territory Domination!</p>
    <div class="stats-grid">
      <div class="stat-box"><div class="num" id="vic-area">30.0%</div><div class="lbl">Territory</div></div>
      <div class="stat-box"><div class="num" id="vic-score">0</div><div class="lbl">Score</div></div>
    </div>
    <button class="btn btn-primary" id="btn-victory-lobby">🔄 Back to Room Lobby</button>
    <button class="btn btn-pink" id="btn-victory-menu" style="width:100%;">🏠 Main Menu</button>
  </div>
</div>

<!-- Quick Feedback Modal -->
<div id="feedback-modal" class="overlay-screen hidden">
  <div class="panel" style="max-width:440px;">
    <div class="header-row" style="margin-bottom:12px;">
      <div class="logo-wrap">
        <h1 style="font-size:1.35rem;">💬 ثبت نظر سریع</h1>
        <p>نظرتان مستقیماً در داشبورد سازنده نمایش داده می‌شود</p>
      </div>
      <button class="icon-btn" id="btn-close-feedback">✕</button>
    </div>
    <div style="display:flex;gap:8px;margin-bottom:12px;flex-wrap:wrap;" id="fb-tags">
      <button class="icon-btn fb-tag active" data-tag="😍 عالی">😍 عالی</button>
      <button class="icon-btn fb-tag" data-tag="🔥 جذاب">🔥 جذاب</button>
      <button class="icon-btn fb-tag" data-tag="💡 پیشنهاد">💡 پیشنهاد</button>
      <button class="icon-btn fb-tag" data-tag="🐛 باگ">🐛 باگ</button>
    </div>
    <div class="input-group" style="margin-bottom:10px;">
      <input type="text" id="fb-name" maxlength="20" placeholder="نام شما (اختیاری)">
    </div>
    <textarea id="fb-msg" rows="3" maxlength="300" placeholder="نظر، پیشنهاد یا گزارش خود را بنویسید..." style="width:100%;background:rgba(7,11,20,0.85);border:1px solid rgba(255,255,255,0.18);border-radius:12px;padding:10px 12px;color:#fff;font-family:inherit;font-size:0.9rem;margin-bottom:12px;resize:none;user-select:text;-webkit-user-select:text;"></textarea>
    <button class="btn btn-primary" id="btn-send-feedback" style="margin-bottom:0;">ارسال نظر 🚀</button>
  </div>
</div>

<!-- Game Over Screen -->
<div id="gameover-screen" class="overlay-screen hidden">
  <div class="panel gameover-panel">
    <div class="gameover-title">ELIMINATED!</div>
    <p id="gameover-reason" style="color:var(--text-muted);font-size:0.9rem;">Your trail was severed.</p>

    <div class="stats-grid">
      <div class="stat-box">
        <div class="num" id="go-peak-area">0.0%</div>
        <div class="lbl">Peak Territory</div>
      </div>
      <div class="stat-box">
        <div class="num" id="go-kills">0</div>
        <div class="lbl">Eliminations</div>
      </div>
      <div class="stat-box">
        <div class="num" id="go-score">0</div>
        <div class="lbl">Final Score</div>
      </div>
      <div class="stat-box">
        <div class="num" id="go-time">0s</div>
        <div class="lbl">Time Survived</div>
      </div>
    </div>

    <button class="btn btn-primary" id="btn-play-again">↻ Play Again (Same Room)</button>
    <div class="room-actions">
      <button class="btn btn-secondary" id="btn-gameover-invite">📋 Invite Friends</button>
      <button class="btn btn-pink" id="btn-main-menu">🏠 Main Menu</button>
    </div>
  </div>
</div>

<div id="toast" class="toast">Copied to clipboard!</div>

<script>
(() => {
  'use strict';

  // =========================================================================
  // 1. CONSTANTS & 2.5D SKIN DEFINITIONS
  // =========================================================================
  const GRID_SIZE = 96;
  const CELL_SIZE = 28;
  const WORLD_SIZE = GRID_SIZE * CELL_SIZE;
  const PLAYER_SPEED = 195; // px/sec
  const SYNC_INTERVAL_MS = 120;

  const PALETTE_COLORS = [
    '#00f5d4', '#ffbe0b', '#ff007f', '#9b5de5', '#00bbf9',
    '#f15bb5', '#06d6a0', '#fb5607', '#3a86ff', '#8ac926',
    '#ff595e', '#ffca3a', '#6a4c93', '#1982c4', '#2ec4b6',
    '#e71d36', '#ff9f1c', '#b5179e', '#4cc9f0', '#aacc00'
  ];

  const SKINS = [
    { id: 'cyber_cube',     name: 'Neon Cyber Cube',   color: '#00f5d4', shape: 'cube',    icon: '🧊' },
    { id: 'solar_pyramid',  name: 'Solar Pyramid',     color: '#ffbe0b', shape: 'pyramid', icon: '🔺' },
    { id: 'plasma_sphere',  name: 'Plasma Orb',        color: '#ff007f', shape: 'sphere',  icon: '🔮' },
    { id: 'royal_crown',    name: 'Yalda Crown',       color: '#9b5de5', shape: 'crown',   icon: '👑' },
    { id: 'mecha_bot',      name: 'Arvan Mecha',       color: '#00bbf9', shape: 'bot',     icon: '🤖' },
    { id: 'crimson_crystal',name: 'Pomegranate Gem',   color: '#f15bb5', shape: 'crystal', icon: '💎' },
    { id: 'emerald_prism',  name: 'Emerald Prism',     color: '#06d6a0', shape: 'prism',   icon: '⬡' },
    { id: 'void_star',      name: 'Nova Star Core',    color: '#fb5607', shape: 'star',    icon: '⭐' }
  ];

  const BOT_NAMES = [
    'Soroush_Pro', 'YaldaKing', 'Arvan_Edge', 'Kourosh_X',
    'Nazanin_GG', 'CyberDariush', 'TehranDrift', 'Aria_Bot',
    'Parsa_Viper', 'Setareh_99', 'Alborz_OP', 'Rostam_IO'
  ];

  // =========================================================================
  // 2. PROCEDURAL WEB AUDIO ENGINE
  // =========================================================================
  class SoundFX {
    constructor() {
      this.ctx = null;
      this.muted = localStorage.getItem('edgewars_muted') === '1';
      this.lastHumTime = 0;
    }

    init() {
      if (!this.ctx) {
        const AC = window.AudioContext || window.webkitAudioContext;
        if (AC) this.ctx = new AC();
      }
      if (this.ctx && this.ctx.state === 'suspended') {
        this.ctx.resume().catch(() => {});
      }
    }

    toggleMute() {
      this.muted = !this.muted;
      localStorage.setItem('edgewars_muted', this.muted ? '1' : '0');
      return this.muted;
    }

    playClick() {
      if (this.muted) return;
      this.init();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(760, now);
      osc.frequency.exponentialRampToValueAtTime(1240, now + 0.045);
      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.055);
    }

    playTurn() {
      if (this.muted) return;
      this.init();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(220, now);
      osc.frequency.exponentialRampToValueAtTime(340, now + 0.035);
      gain.gain.setValueAtTime(0.04, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.045);
    }

    playCapture(cellCount) {
      if (this.muted) return;
      this.init();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const notes = cellCount > 18 ? [523.25, 659.25, 783.99, 1046.5] : [523.25, 659.25, 783.99];
      notes.forEach((freq, idx) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        const t = now + idx * 0.055;
        osc.frequency.setValueAtTime(freq, t);
        gain.gain.setValueAtTime(0.09, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.16);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(t);
        osc.stop(t + 0.17);
      });
    }

    playKill() {
      if (this.muted) return;
      this.init();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      [330, 495, 660].forEach((freq) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(freq, now);
        osc.frequency.exponentialRampToValueAtTime(freq * 1.4, now + 0.18);
        gain.gain.setValueAtTime(0.05, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.22);
      });
    }

    playDeath() {
      if (this.muted) return;
      this.init();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(240, now);
      osc.frequency.exponentialRampToValueAtTime(45, now + 0.42);
      gain.gain.setValueAtTime(0.14, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.44);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.46);
    }
  }

  const sfx = new SoundFX();

  // =========================================================================
  // 3. COLOR HELPERS & 2.5D AVATAR RENDERER
  // =========================================================================
  function shadeColor(hex, percent) {
    const num = parseInt(hex.replace('#', ''), 16);
    const amt = Math.round(2.55 * percent);
    const R = Math.max(0, Math.min(255, (num >> 16) + amt));
    const G = Math.max(0, Math.min(255, ((num >> 8) & 0x00FF) + amt));
    const B = Math.max(0, Math.min(255, (num & 0x0000FF) + amt));
    return '#' + (0x1000000 + R * 0x10000 + G * 0x100 + B).toString(16).slice(1);
  }

  function draw25DAvatar(ctx, x, y, size, skin, angle, bobOffset, squashX = 1, squashY = 1) {
    const color = skin.color;
    const dark = shadeColor(color, -32);
    const darker = shadeColor(color, -48);
    const light = shadeColor(color, 26);

    ctx.save();
    ctx.translate(x, y + bobOffset);

    // Drop shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.42)';
    ctx.beginPath();
    ctx.ellipse(0, size * 0.48 - bobOffset, size * 0.62, size * 0.34, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.scale(squashX, squashY);
    const tilt = Math.sin(angle) * 0.14;
    ctx.rotate(tilt);

    const r = size * 0.55;
    const h = size * 0.52; // 3D extrusion height

    if (skin.shape === 'cube' || skin.shape === 'bot') {
      // Extruded 3D Cube
      ctx.fillStyle = darker;
      ctx.fillRect(-r, -r + h * 0.4, r * 2, r * 1.4);
      ctx.fillStyle = dark;
      ctx.beginPath();
      ctx.moveTo(r, -r);
      ctx.lineTo(r + 6, -r - 6);
      ctx.lineTo(r + 6, r * 0.7);
      ctx.lineTo(r, r * 0.8);
      ctx.closePath();
      ctx.fill();

      // Top glossy face
      ctx.fillStyle = color;
      ctx.fillRect(-r, -r - h * 0.25, r * 2, r * 1.5);
      ctx.strokeStyle = light;
      ctx.lineWidth = 2;
      ctx.strokeRect(-r + 2, -r - h * 0.25 + 2, r * 2 - 4, r * 1.5 - 4);

      // Visor / Core
      ctx.fillStyle = '#070b14';
      ctx.fillRect(-r * 0.55, -r * 0.45, r * 1.1, r * 0.42);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(-r * 0.35 + Math.cos(angle) * 3, -r * 0.35, r * 0.25, r * 0.22);
      ctx.fillRect(r * 0.12 + Math.cos(angle) * 3, -r * 0.35, r * 0.25, r * 0.22);

      if (skin.shape === 'bot') {
        ctx.strokeStyle = light;
        ctx.beginPath();
        ctx.moveTo(0, -r - h * 0.25);
        ctx.lineTo(0, -r - h * 0.75);
        ctx.stroke();
        ctx.fillStyle = '#ff007f';
        ctx.beginPath();
        ctx.arc(0, -r - h * 0.8, 3.5, 0, Math.PI * 2);
        ctx.fill();
      }
    } else if (skin.shape === 'pyramid' || skin.shape === 'crystal') {
      const topY = -r * 1.35;
      // Left shaded face
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.moveTo(0, topY);
      ctx.lineTo(-r, r * 0.45);
      ctx.lineTo(0, r * 0.75);
      ctx.closePath();
      ctx.fill();
      // Right darker face
      ctx.fillStyle = dark;
      ctx.beginPath();
      ctx.moveTo(0, topY);
      ctx.lineTo(r, r * 0.45);
      ctx.lineTo(0, r * 0.75);
      ctx.closePath();
      ctx.fill();
      // Highlight edge
      ctx.strokeStyle = light;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, topY);
      ctx.lineTo(0, r * 0.75);
      ctx.stroke();
    } else if (skin.shape === 'sphere') {
      const grad = ctx.createRadialGradient(-r * 0.3, -r * 0.5, r * 0.15, 0, -r * 0.2, r * 1.1);
      grad.addColorStop(0, '#ffffff');
      grad.addColorStop(0.28, color);
      grad.addColorStop(1, darker);
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(0, -r * 0.2, r * 0.95, 0, Math.PI * 2);
      ctx.fill();

      // Orbiting ring
      ctx.strokeStyle = light;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.ellipse(0, -r * 0.15, r * 1.25, r * 0.35, 0.3, 0, Math.PI * 2);
      ctx.stroke();
    } else if (skin.shape === 'crown') {
      ctx.fillStyle = darker;
      ctx.fillRect(-r, -r * 0.1, r * 2, r * 0.7);
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.moveTo(-r, r * 0.3);
      ctx.lineTo(-r, -r * 0.9);
      ctx.lineTo(-r * 0.4, -r * 0.3);
      ctx.lineTo(0, -r * 1.15);
      ctx.lineTo(r * 0.4, -r * 0.3);
      ctx.lineTo(r, -r * 0.9);
      ctx.lineTo(r, r * 0.3);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = '#ffbe0b';
      ctx.lineWidth = 2;
      ctx.stroke();
    } else {
      // Prism / Star
      const sides = skin.shape === 'prism' ? 6 : 5;
      ctx.fillStyle = darker;
      ctx.beginPath();
      for (let i = 0; i < sides; i++) {
        const a = (i * Math.PI * 2) / sides - Math.PI / 2;
        const px = Math.cos(a) * r;
        const py = Math.sin(a) * r * 0.7 + 7;
        i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
      }
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = color;
      ctx.beginPath();
      for (let i = 0; i < sides; i++) {
        const a = (i * Math.PI * 2) / sides - Math.PI / 2;
        const px = Math.cos(a) * r;
        const py = Math.sin(a) * r * 0.7 - 5;
        i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
      }
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = light;
      ctx.lineWidth = 2;
      ctx.stroke();
    }

    ctx.restore();
  }

  // =========================================================================
  // 4. GAME STATE & TERRITORY GRID
  // =========================================================================
  const canvas = document.getElementById('game-canvas');
  const ctx = canvas.getContext('2d');
  const miniCanvas = document.getElementById('minimap-canvas');
  const miniCtx = miniCanvas.getContext('2d');

  let width = window.innerWidth;
  let height = window.innerHeight;
  function resize() {
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;
  }
  window.addEventListener('resize', resize);
  resize();

  // Territory grid: null or ownerId
  let territory = new Array(GRID_SIZE * GRID_SIZE).fill(null);
  let trailGrid = new Array(GRID_SIZE * GRID_SIZE).fill(null);
  let capturePulse = new Float32Array(GRID_SIZE * GRID_SIZE);

  const particles = [];
  const popups = [];

  function generateRandomNick() {
    const p = ['Cyber', 'Neon', 'Quantum', 'Apex', 'Shadow', 'Solar', 'Turbo', 'Nova', 'Storm', 'Hyper', 'Astra', 'Vortex'];
    const s = ['Wolf', 'Falcon', 'Knight', 'Rider', 'Ghost', 'Titan', 'Viper', 'Blade', 'Spark', 'Hawk', 'Hunter', 'Fox'];
    return p[Math.floor(Math.random() * p.length)] + s[Math.floor(Math.random() * s.length)] + Math.floor(Math.random() * 90 + 10);
  }

  const cachedNick = localStorage.getItem('edgewars_nickname') || generateRandomNick();
  localStorage.setItem('edgewars_nickname', cachedNick);
  document.getElementById('input-nickname').value = cachedNick;

  const cachedSkinId = localStorage.getItem('edgewars_skin_id') || SKINS[0].id;
  const cachedColor = localStorage.getItem('edgewars_color') || PALETTE_COLORS[0];
  const initialSkin = SKINS.find((s) => s.id === cachedSkinId) || SKINS[0];

  let state = {
    running: false,
    mode: 'public', // 'public' | 'private'
    roomCode: 'PUBLIC',
    isLobbyHost: false,
    botsEnabled: true,
    offlineMode: false,
    playerId: 'p_' + Math.random().toString(36).slice(2, 9),
    selectedSkin: { ...initialSkin, color: cachedColor },
    selectedColor: cachedColor,
    me: null,
    entities: new Map(), // id -> entity
    camera: { x: WORLD_SIZE / 2, y: WORLD_SIZE / 2 },
    startTime: 0,
    peakArea: 0,
    lastSyncTime: 0,
    syncPending: false,
    pingMs: 0,
    pendingNewCells: [],
    pendingClearedVictims: [],
    pendingKills: []
  };

  function cellIdx(gx, gy) {
    return gy * GRID_SIZE + gx;
  }

  function inBounds(gx, gy) {
    return gx >= 0 && gx < GRID_SIZE && gy >= 0 && gy < GRID_SIZE;
  }

  function spawnParticles(wx, wy, color, count = 14) {
    for (let i = 0; i < count; i++) {
      const a = Math.random() * Math.PI * 2;
      const sp = 50 + Math.random() * 170;
      particles.push({
        x: wx,
        y: wy,
        vx: Math.cos(a) * sp,
        vy: Math.sin(a) * sp,
        vz: 80 + Math.random() * 120,
        z: 4,
        life: 0.45 + Math.random() * 0.35,
        maxLife: 0.8,
        color,
        size: 4 + Math.random() * 5
      });
    }
  }

  function spawnPopup(wx, wy, text, color = '#00f5d4') {
    popups.push({ x: wx, y: wy, text, color, life: 1.1 });
  }

  function findSafeLocalSpawn() {
    let best = { gx: 40, gy: 40, score: -1e9 };
    for (let attempt = 0; attempt < 60; attempt++) {
      const gx = 6 + Math.floor(Math.random() * (GRID_SIZE - 12));
      const gy = 6 + Math.floor(Math.random() * (GRID_SIZE - 12));
      let occ = 0;
      for (let y = gy - 3; y <= gy + 3; y++) {
        for (let x = gx - 3; x <= gx + 3; x++) {
          const idx = cellIdx(x, y);
          if (territory[idx] || trailGrid[idx]) occ++;
        }
      }
      const score = -occ * 200;
      if (score > best.score) best = { gx, gy, score };
      if (occ === 0) break;
    }
    return best;
  }

  function createEntity(id, name, skin, isBot = false) {
    const safe = findSafeLocalSpawn();
    const gx = safe.gx;
    const gy = safe.gy;
    const dirs = [
      { dx: 1, dy: 0 },
      { dx: -1, dy: 0 },
      { dx: 0, dy: 1 },
      { dx: 0, dy: -1 }
    ];
    const d = dirs[Math.floor(Math.random() * dirs.length)];
    const ent = {
      id,
      name,
      skin,
      isBot,
      alive: true,
      x: (gx + 0.5) * CELL_SIZE,
      y: (gy + 0.5) * CELL_SIZE,
      targetX: (gx + 0.5) * CELL_SIZE,
      targetY: (gy + 0.5) * CELL_SIZE,
      dx: d.dx,
      dy: d.dy,
      nextDx: d.dx,
      nextDy: d.dy,
      trail: [],
      score: 250,
      kills: 0,
      areaPct: 0,
      squash: 0,
      botTimer: 0
    };
    claimStartingBlock(ent, gx, gy);
    return ent;
  }

  function claimStartingBlock(ent, cx, cy, pushToServer = false) {
    ent.baseGx = cx;
    ent.baseGy = cy;
    for (let y = cy - 2; y <= cy + 2; y++) {
      for (let x = cx - 2; x <= cx + 2; x++) {
        if (inBounds(x, y)) {
          const idx = cellIdx(x, y);
          if (territory[idx] === null || territory[idx] === ent.id) {
            territory[idx] = ent.id;
            capturePulse[idx] = 1.0;
            if (pushToServer && ent.id === state.playerId) {
              state.pendingNewCells.push(idx);
            }
          }
        }
      }
    }
  }

  // Exact 2D Flood-Fill Territory Capture
  function captureTerritory(ent) {
    if (ent.trail.length === 0) return 0;
    const newlyClaimed = [];

    for (const idx of ent.trail) {
      if (territory[idx] !== ent.id) {
        territory[idx] = ent.id;
        capturePulse[idx] = 1.0;
        newlyClaimed.push(idx);
      }
      if (trailGrid[idx] === ent.id) trailGrid[idx] = null;
    }
    ent.trail = [];

    // BFS from arena borders to find all cells NOT enclosed by ent.id
    const visited = new Uint8Array(GRID_SIZE * GRID_SIZE);
    const queue = new Int32Array(GRID_SIZE * GRID_SIZE);
    let head = 0;
    let tail = 0;

    for (let x = 0; x < GRID_SIZE; x++) {
      const top = cellIdx(x, 0);
      const bot = cellIdx(x, GRID_SIZE - 1);
      if (territory[top] !== ent.id && !visited[top]) {
        visited[top] = 1;
        queue[tail++] = top;
      }
      if (territory[bot] !== ent.id && !visited[bot]) {
        visited[bot] = 1;
        queue[tail++] = bot;
      }
    }
    for (let y = 0; y < GRID_SIZE; y++) {
      const left = cellIdx(0, y);
      const right = cellIdx(GRID_SIZE - 1, y);
      if (territory[left] !== ent.id && !visited[left]) {
        visited[left] = 1;
        queue[tail++] = left;
      }
      if (territory[right] !== ent.id && !visited[right]) {
        visited[right] = 1;
        queue[tail++] = right;
      }
    }

    while (head < tail) {
      const curr = queue[head++];
      const cx = curr % GRID_SIZE;
      const cy = (curr / GRID_SIZE) | 0;
      const neighbors = [
        cx > 0 ? curr - 1 : -1,
        cx < GRID_SIZE - 1 ? curr + 1 : -1,
        cy > 0 ? curr - GRID_SIZE : -1,
        cy < GRID_SIZE - 1 ? curr + GRID_SIZE : -1
      ];
      for (const n of neighbors) {
        if (n !== -1 && !visited[n] && territory[n] !== ent.id) {
          visited[n] = 1;
          queue[tail++] = n;
        }
      }
    }

    for (let i = 0; i < GRID_SIZE * GRID_SIZE; i++) {
      if (!visited[i] && territory[i] !== ent.id) {
        territory[i] = ent.id;
        capturePulse[i] = 1.0;
        newlyClaimed.push(i);
      }
    }

    if (newlyClaimed.length > 0) {
      ent.score += newlyClaimed.length * 10;
      ent.squash = 1.0;
      if (ent.id === state.playerId) {
        state.pendingNewCells.push(...newlyClaimed);
        sfx.playCapture(newlyClaimed.length);
        spawnPopup(ent.x, ent.y - 24, \`+\${newlyClaimed.length} TILES!\`, ent.skin.color);
      }
      // Enforce single connected territory component for all entities
      for (const other of state.entities.values()) {
        if (!other.alive) continue;
        const ogx = Math.floor(other.x / CELL_SIZE);
        const ogy = Math.floor(other.y / CELL_SIZE);
        const oIdx = inBounds(ogx, ogy) ? cellIdx(ogx, ogy) : -1;
        pruneLocalDisconnectedTerritory(other.id, oIdx);
      }
    }
    return newlyClaimed.length;
  }

  function pruneLocalDisconnectedTerritory(ownerId, anchorIdx = -1) {
    const owned = [];
    for (let i = 0; i < GRID_SIZE * GRID_SIZE; i++) {
      if (territory[i] === ownerId) owned.push(i);
    }
    if (owned.length <= 1) return;

    const ownedSet = new Set(owned);
    const visited = new Set();
    const components = [];

    for (const start of owned) {
      if (visited.has(start)) continue;
      const comp = [];
      const queue = [start];
      visited.add(start);
      let head = 0;
      while (head < queue.length) {
        const curr = queue[head++];
        comp.push(curr);
        const cx = curr % GRID_SIZE;
        const cy = (curr / GRID_SIZE) | 0;
        const neighbors = [
          cx > 0 ? curr - 1 : -1,
          cx < GRID_SIZE - 1 ? curr + 1 : -1,
          cy > 0 ? curr - GRID_SIZE : -1,
          cy < GRID_SIZE - 1 ? curr + GRID_SIZE : -1
        ];
        for (const n of neighbors) {
          if (n !== -1 && ownedSet.has(n) && !visited.has(n)) {
            visited.add(n);
            queue.push(n);
          }
        }
      }
      components.push(comp);
    }

    if (components.length <= 1) return;
    let keepComp = components[0];
    if (anchorIdx !== -1) {
      const anchored = components.find((c) => c.includes(anchorIdx));
      if (anchored) keepComp = anchored;
      else for (const c of components) if (c.length > keepComp.length) keepComp = c;
    } else {
      for (const c of components) if (c.length > keepComp.length) keepComp = c;
    }
    const keepSet = new Set(keepComp);
    for (const idx of owned) {
      if (!keepSet.has(idx)) territory[idx] = null;
    }
  }

  function eliminateEntity(victim, killer, reason) {
    if (!victim.alive) return;
    victim.alive = false;
    spawnParticles(victim.x, victim.y, victim.skin.color, 26);

    for (let i = 0; i < GRID_SIZE * GRID_SIZE; i++) {
      if (territory[i] === victim.id) territory[i] = null;
      if (trailGrid[i] === victim.id) trailGrid[i] = null;
    }
    victim.trail = [];

    if (killer && killer.id !== victim.id) {
      killer.kills += 1;
      killer.score += 500;
      if (killer.id === state.playerId) {
        sfx.playKill();
        spawnPopup(victim.x, victim.y - 30, \`ELIMINATED \${victim.name}! +500\`, '#ffbe0b');
        state.pendingKills.push(victim.id);
      }
    }

    if (victim.id === state.playerId) {
      sfx.playDeath();
      state.pendingClearedVictims.push(victim.id);
      showGameOver(reason);
    } else {
      victim.killCooldown = performance.now() + 2000;
      state.pendingClearedVictims.push(victim.id);
      if (state.offlineMode && victim.isBot) {
        setTimeout(() => {
          if (!state.running || !state.offlineMode) return;
          const respawned = createEntity(victim.id, victim.name, victim.skin, true);
          state.entities.set(victim.id, respawned);
        }, 2500);
      }
    }
  }

  // =========================================================================
  // 5. INPUT HANDLING (KEYBOARD + VIRTUAL JOYSTICK + SWIPE)
  // =========================================================================
  function setDirection(dx, dy) {
    const me = state.me;
    if (!me || !me.alive) return;
    // Prevent 180-degree instant reversal
    if (me.dx === -dx && me.dy === -dy) return;
    if (me.nextDx !== dx || me.nextDy !== dy) {
      me.nextDx = dx;
      me.nextDy = dy;
      me.squash = 0.65;
      sfx.playTurn();
    }
  }

  window.addEventListener('keydown', (e) => {
    if (!state.running) return;
    switch (e.key) {
      case 'ArrowUp': case 'w': case 'W': setDirection(0, -1); break;
      case 'ArrowDown': case 's': case 'S': setDirection(0, 1); break;
      case 'ArrowLeft': case 'a': case 'A': setDirection(-1, 0); break;
      case 'ArrowRight': case 'd': case 'D': setDirection(1, 0); break;
    }
  });

  // Virtual Joystick
  const joyZone = document.getElementById('joystick-zone');
  const joyKnob = document.getElementById('joystick-knob');
  let joyActive = false;

  function handleJoystick(clientX, clientY) {
    const rect = joyZone.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const dx = clientX - cx;
    const dy = clientY - cy;
    const dist = Math.hypot(dx, dy);
    const maxR = 36;
    const clamped = Math.min(dist, maxR);
    const angle = Math.atan2(dy, dx);
    joyKnob.style.transform = \`translate(\${Math.cos(angle) * clamped}px, \${Math.sin(angle) * clamped}px)\`;
    if (dist > 10) {
      if (Math.abs(dx) > Math.abs(dy)) setDirection(dx > 0 ? 1 : -1, 0);
      else setDirection(0, dy > 0 ? 1 : -1);
    }
  }

  joyZone.addEventListener('touchstart', (e) => {
    joyActive = true;
    handleJoystick(e.touches[0].clientX, e.touches[0].clientY);
  }, { passive: true });
  joyZone.addEventListener('touchmove', (e) => {
    if (joyActive) handleJoystick(e.touches[0].clientX, e.touches[0].clientY);
  }, { passive: true });
  joyZone.addEventListener('touchend', () => {
    joyActive = false;
    joyKnob.style.transform = 'translate(0px, 0px)';
  });

  // =========================================================================
  // 6. SIMULATION STEP & EDGE SYNC
  // =========================================================================
  function rebuildTrailGrid() {
    trailGrid.fill(null);
    for (const ent of state.entities.values()) {
      if (!ent.alive) continue;
      for (const idx of ent.trail) {
        if (idx >= 0 && idx < GRID_SIZE * GRID_SIZE) {
          trailGrid[idx] = ent.id;
        }
      }
    }
    for (let i = 0; i < GRID_SIZE * GRID_SIZE; i++) {
      const oid = territory[i];
      if (oid) {
        const owner = state.entities.get(oid);
        if (!owner || !owner.alive) {
          territory[i] = null;
        }
      }
    }
  }

  function stepLocalBot(bot, dt) {
    if (!bot.alive) return;
    bot.botTimer -= dt;
    const gx = Math.floor(bot.x / CELL_SIZE);
    const gy = Math.floor(bot.y / CELL_SIZE);

    if (bot.botTimer <= 0 || gx < 4 || gx > GRID_SIZE - 5 || gy < 4 || gy > GRID_SIZE - 5) {
      if (gx < 5) { bot.nextDx = 1; bot.nextDy = 0; bot.botTimer = 0.5; return; }
      if (gx > GRID_SIZE - 6) { bot.nextDx = -1; bot.nextDy = 0; bot.botTimer = 0.5; return; }
      if (gy < 5) { bot.nextDx = 0; bot.nextDy = 1; bot.botTimer = 0.5; return; }
      if (gy > GRID_SIZE - 6) { bot.nextDx = 0; bot.nextDy = -1; bot.botTimer = 0.5; return; }

      if (!bot.planDirs || bot.planDirs.length === 0) {
        const dirs = [
          { dx: 1, dy: 0 }, { dx: -1, dy: 0 },
          { dx: 0, dy: 1 }, { dx: 0, dy: -1 }
        ].filter((d) => !(d.dx === -bot.dx && d.dy === -bot.dy));
        const d1 = dirs[Math.floor(Math.random() * dirs.length)];
        const perp = d1.dx !== 0
          ? [{ dx: 0, dy: 1 }, { dx: 0, dy: -1 }]
          : [{ dx: 1, dy: 0 }, { dx: -1, dy: 0 }];
        const d2 = perp[Math.floor(Math.random() * 2)];
        const d3 = { dx: -d1.dx, dy: -d1.dy };
        const d4 = { dx: -d2.dx, dy: -d2.dy };
        bot.planDirs = [d1, d2, d3, d4];
      }
      const next = bot.planDirs.shift();
      if (!(next.dx === -bot.dx && next.dy === -bot.dy)) {
        bot.nextDx = next.dx;
        bot.nextDy = next.dy;
      }
      bot.botTimer = 0.45 + Math.random() * 0.55;
    }
  }

  function stepEntityPhysics(ent, dt) {
    if (!ent.alive) return;

    // Align turns cleanly to cell centers
    const cx = (Math.floor(ent.x / CELL_SIZE) + 0.5) * CELL_SIZE;
    const cy = (Math.floor(ent.y / CELL_SIZE) + 0.5) * CELL_SIZE;
    if (ent.nextDx !== ent.dx || ent.nextDy !== ent.dy) {
      if (Math.abs(ent.x - cx) < 6 && Math.abs(ent.y - cy) < 6) {
        ent.x = cx;
        ent.y = cy;
        ent.dx = ent.nextDx;
        ent.dy = ent.nextDy;
      }
    }

    ent.x += ent.dx * PLAYER_SPEED * dt;
    ent.y += ent.dy * PLAYER_SPEED * dt;
    ent.squash = Math.max(0, ent.squash - dt * 3.5);

    const gx = Math.floor(ent.x / CELL_SIZE);
    const gy = Math.floor(ent.y / CELL_SIZE);

    if (!inBounds(gx, gy)) {
      eliminateEntity(ent, null, 'Crashed into the Arena Cyber-Wall.');
      return;
    }

    const idx = cellIdx(gx, gy);

    // Trail collision check
    const trailOwnerId = trailGrid[idx];
    if (trailOwnerId) {
      if (trailOwnerId === ent.id) {
        // Self-collision only if we moved at least 3 cells away
        const lastIdx = ent.trail[ent.trail.length - 1];
        if (lastIdx !== idx && ent.trail.length > 3) {
          eliminateEntity(ent, null, 'Crossed your own laser trail!');
          return;
        }
      } else {
        const victim = state.entities.get(trailOwnerId);
        if (victim && victim.alive) {
          eliminateEntity(victim, ent, \`Trail severed by \${ent.name}!\`);
        }
      }
    }

    // Territory capture or trail laying
    if (territory[idx] === ent.id) {
      if (ent.trail.length > 0) {
        captureTerritory(ent);
      }
    } else {
      if (trailGrid[idx] !== ent.id) {
        trailGrid[idx] = ent.id;
        ent.trail.push(idx);
      }
    }
  }

  async function syncWithEdge() {
    if (!state.running || state.offlineMode || state.syncPending) return;
    state.syncPending = true;
    const seq = state.matchSeq || 0;
    const t0 = performance.now();
    const me = state.me;

    const payload = {
      roomCode: state.mode === 'private' ? state.roomCode : (state.roomCode.startsWith('PUBLIC-') ? state.roomCode : 'PUBLIC'),
      mode: state.mode,
      botsEnabled: state.botsEnabled,
      spawnRequest: !!state.needsSpawnSync,
      player: {
        id: state.playerId,
        name: me.name,
        skinId: me.skin.id,
        color: state.selectedColor,
        baseGx: me.baseGx,
        baseGy: me.baseGy,
        x: Math.round(me.x),
        y: Math.round(me.y),
        dx: me.dx,
        dy: me.dy,
        score: me.score,
        kills: me.kills,
        alive: me.alive,
        trail: me.trail.slice(-80)
      },
      newCells: state.pendingNewCells.splice(0, 400),
      clearedVictims: state.pendingClearedVictims.splice(0, 10),
      kills: state.pendingKills.splice(0, 10)
    };

    try {
      const res = await fetch('/api/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (!res.ok) throw new Error('Sync HTTP ' + res.status);
      const data = await res.json();
      if (seq !== state.matchSeq || !state.running) return;
      state.pingMs = Math.round(performance.now() - t0);
      document.getElementById('hud-ping').textContent = \`\${state.pingMs}ms\`;

      if (data.roomCode && state.mode === 'public') {
        state.roomCode = data.roomCode;
        document.getElementById('hud-room-badge').textContent = data.roomCode;
      }

      if (state.needsSpawnSync && data.assignedSpawn && state.me) {
        state.needsSpawnSync = false;
        territory.fill(null);
        state.me.x = data.assignedSpawn.x;
        state.me.y = data.assignedSpawn.y;
        state.me.trail = [];
        state.camera.x = data.assignedSpawn.x;
        state.camera.y = data.assignedSpawn.y;
        claimStartingBlock(state.me, data.assignedSpawn.gx, data.assignedSpawn.gy, true);
      }

      if (data.status === 'finished' && data.winner) {
        state.running = false;
        document.getElementById('hud').classList.add('hidden');
        document.getElementById('victory-winner-name').textContent = data.winner.name + ' Wins!';
        document.getElementById('victory-reason').textContent = data.winner.reason || 'Match Complete!';
        document.getElementById('vic-area').textContent = (data.winner.areaPct || 0).toFixed(1) + '%';
        document.getElementById('vic-score').textContent = data.winner.score || 0;
        document.getElementById('victory-screen').classList.remove('hidden');
        return;
      }

      const goalEl = document.getElementById('hud-goal');
      if (data.settings && data.settings.winMode && data.settings.winMode !== 'endless') {
        goalEl.style.display = 'block';
        if (data.settings.winMode === 'territory') {
          goalEl.textContent = \`🎯 GOAL: \${data.settings.targetPct}% Territory\`;
        } else if (data.settings.winMode === 'timed' && data.startedAt) {
          const rem = Math.max(0, Math.ceil(data.settings.timeLimitSec - (Date.now() - data.startedAt) / 1000));
          const m = Math.floor(rem / 60);
          const s = String(rem % 60).padStart(2, '0');
          goalEl.textContent = \`⏱️ \${m}:\${s} Left\`;
        }
      } else {
        goalEl.style.display = 'none';
      }

      // Reconcile remote players & server bots
      const activeIds = new Set([state.playerId]);
      const nowMs = performance.now();
      for (const rp of data.players || []) {
        if (rp.id === state.playerId) {
          if (rp.color && state.me) {
            state.selectedColor = rp.color;
            state.me.skin = { ...state.me.skin, color: rp.color };
          }
          if (rp.alive === false && state.me && state.me.alive) {
            eliminateEntity(state.me, null, rp.killedBy ? \`Trail severed by \${rp.killedBy}!\` : 'Your trail was severed!');
          }
          continue;
        }
        activeIds.add(rp.id);
        let ent = state.entities.get(rp.id);
        const baseSkin = SKINS.find((s) => s.id === rp.skinId) || SKINS[0];
        const skin = { ...baseSkin, color: rp.color || baseSkin.color };
        if (!ent) {
          ent = {
            id: rp.id,
            name: rp.name,
            skin,
            isBot: !!rp.isBot,
            alive: rp.alive,
            x: rp.x,
            y: rp.y,
            targetX: rp.x,
            targetY: rp.y,
            dx: rp.dx,
            dy: rp.dy,
            nextDx: rp.dx,
            nextDy: rp.dy,
            trail: rp.trail || [],
            score: rp.score || 0,
            kills: rp.kills || 0,
            areaPct: 0,
            squash: 0,
            killCooldown: 0
          };
          state.entities.set(rp.id, ent);
        } else {
          ent.name = rp.name;
          if (!ent.killCooldown || nowMs > ent.killCooldown) {
            ent.alive = rp.alive;
          }
          ent.targetX = rp.x;
          ent.targetY = rp.y;
          ent.dx = rp.dx;
          ent.dy = rp.dy;
          ent.score = rp.score;
          ent.kills = rp.kills;
          ent.trail = rp.trail || [];
        }
      }

      for (const [id] of state.entities) {
        if (!activeIds.has(id)) {
          state.entities.delete(id);
        }
      }

      rebuildTrailGrid();

      // Apply full authoritative territory snapshot from server
      if (Array.isArray(data.territoryOwners)) {
        const pendingSet = new Set(state.pendingNewCells);
        for (let i = 0; i < GRID_SIZE * GRID_SIZE; i++) {
          if (!pendingSet.has(i)) territory[i] = null;
        }
        for (const [cellIndex, ownerId] of data.territoryOwners) {
          if (inBounds(cellIndex % GRID_SIZE, (cellIndex / GRID_SIZE) | 0)) {
            territory[cellIndex] = ownerId;
          }
        }
      }
      // Client invariant guard: alive player must always own at least their 5x5 base
      if (state.me && state.me.alive) {
        let myCells = 0;
        for (let i = 0; i < GRID_SIZE * GRID_SIZE; i++) {
          if (territory[i] === state.playerId) { myCells++; break; }
        }
        if (myCells === 0) {
          const bx = state.me.baseGx !== undefined ? state.me.baseGx : Math.floor(state.me.x / CELL_SIZE);
          const by = state.me.baseGy !== undefined ? state.me.baseGy : Math.floor(state.me.y / CELL_SIZE);
          claimStartingBlock(state.me, bx, by, true);
        }
      }
    } catch (_err) {
      // Graceful offline fallback
      if (!state.offlineMode) {
        state.offlineMode = true;
        document.getElementById('hud-ping').textContent = 'OFFLINE';
        spawnOfflineBots();
      }
    } finally {
      state.syncPending = false;
    }
  }

  function spawnOfflineBots() {
    const needed = state.botsEnabled ? 11 : 0;
    for (let i = 0; i < needed; i++) {
      const id = 'bot_' + i;
      if (!state.entities.has(id)) {
        const skin = SKINS[(i + 1) % SKINS.length];
        state.entities.set(id, createEntity(id, BOT_NAMES[i % BOT_NAMES.length], skin, true));
      }
    }
  }

  // =========================================================================
  // 7. 2.5D RENDERING PIPELINE
  // =========================================================================
  function renderFrame(now) {
    ctx.clearRect(0, 0, width, height);

    const cam = state.camera;
    const viewLeft = cam.x - width / 2 - CELL_SIZE * 2;
    const viewRight = cam.x + width / 2 + CELL_SIZE * 2;
    const viewTop = cam.y - height / 2 - CELL_SIZE * 2;
    const viewBottom = cam.y + height / 2 + CELL_SIZE * 2;

    const startGx = Math.max(0, Math.floor(viewLeft / CELL_SIZE));
    const endGx = Math.min(GRID_SIZE - 1, Math.ceil(viewRight / CELL_SIZE));
    const startGy = Math.max(0, Math.floor(viewTop / CELL_SIZE));
    const endGy = Math.min(GRID_SIZE - 1, Math.ceil(viewBottom / CELL_SIZE));

    ctx.save();
    ctx.translate(Math.round(width / 2 - cam.x), Math.round(height / 2 - cam.y));

    // Arena floor & cyber grid
    ctx.fillStyle = '#0b1220';
    ctx.fillRect(0, 0, WORLD_SIZE, WORLD_SIZE);

    ctx.strokeStyle = 'rgba(0, 245, 212, 0.06)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (let gx = startGx; gx <= endGx + 1; gx++) {
      const px = gx * CELL_SIZE;
      ctx.moveTo(px, startGy * CELL_SIZE);
      ctx.lineTo(px, (endGy + 1) * CELL_SIZE);
    }
    for (let gy = startGy; gy <= endGy + 1; gy++) {
      const py = gy * CELL_SIZE;
      ctx.moveTo(startGx * CELL_SIZE, py);
      ctx.lineTo((endGx + 1) * CELL_SIZE, py);
    }
    ctx.stroke();

    // Arena 3D neon border
    ctx.strokeStyle = '#ff007f';
    ctx.lineWidth = 6;
    ctx.strokeRect(-3, -3, WORLD_SIZE + 6, WORLD_SIZE + 6);

    // 2.5D Extruded Territory Blocks
    const extrude = 10;
    for (let gy = startGy; gy <= endGy; gy++) {
      for (let gx = startGx; gx <= endGx; gx++) {
        const idx = cellIdx(gx, gy);
        const ownerId = territory[idx];
        if (!ownerId) continue;
        const owner = state.entities.get(ownerId);
        if (!owner || !owner.alive) continue;
        const baseColor = owner.skin.color;
        const px = gx * CELL_SIZE;
        const py = gy * CELL_SIZE;

        // South extruded 3D wall if southern neighbor is not same owner
        const southSame = gy + 1 < GRID_SIZE && territory[cellIdx(gx, gy + 1)] === ownerId;
        if (!southSame) {
          ctx.fillStyle = shadeColor(baseColor, -36);
          ctx.fillRect(px, py + CELL_SIZE - extrude + 4, CELL_SIZE + 0.6, extrude);
        }

        // Top glossy face
        ctx.fillStyle = baseColor;
        ctx.fillRect(px, py - 4, CELL_SIZE + 0.6, CELL_SIZE + 0.6);

        if (capturePulse[idx] > 0) {
          ctx.fillStyle = \`rgba(255, 255, 255, \${capturePulse[idx] * 0.45})\`;
          ctx.fillRect(px, py - 4, CELL_SIZE, CELL_SIZE);
          capturePulse[idx] = Math.max(0, capturePulse[idx] - 0.04);
        }
      }
    }

    // Active Glowing Trails
    for (const ent of state.entities.values()) {
      if (!ent.alive || ent.trail.length === 0) continue;
      ctx.fillStyle = shadeColor(ent.skin.color, 18);
      ctx.globalAlpha = 0.72;
      for (const idx of ent.trail) {
        const gx = idx % GRID_SIZE;
        const gy = (idx / GRID_SIZE) | 0;
        if (gx < startGx || gx > endGx || gy < startGy || gy > endGy) continue;
        ctx.fillRect(gx * CELL_SIZE + 4, gy * CELL_SIZE + 4, CELL_SIZE - 8, CELL_SIZE - 8);
      }
      ctx.globalAlpha = 1;
    }

    // 2.5D Avatars sorted by Y for proper depth
    const sorted = Array.from(state.entities.values())
      .filter((e) => e.alive)
      .sort((a, b) => a.y - b.y);

    for (const ent of sorted) {
      const bob = Math.sin(now * 0.007 + ent.x * 0.02) * 3;
      const sx = 1 + ent.squash * 0.22;
      const sy = 1 - ent.squash * 0.18;
      const angle = Math.atan2(ent.dy, ent.dx);
      draw25DAvatar(ctx, ent.x, ent.y, CELL_SIZE * 0.95, ent.skin, angle, bob, sx, sy);

      // Nameplate
      ctx.font = '700 12px system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillStyle = 'rgba(0,0,0,0.65)';
      ctx.fillText(ent.name, ent.x + 1, ent.y - 29);
      ctx.fillStyle = ent.id === state.playerId ? '#00f5d4' : '#ffffff';
      ctx.fillText(ent.name, ent.x, ent.y - 30);
    }

    // Particles
    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      ctx.fillStyle = p.color;
      ctx.globalAlpha = Math.max(0, p.life / p.maxLife);
      ctx.fillRect(p.x - p.size / 2, p.y - p.z - p.size / 2, p.size, p.size);
      ctx.globalAlpha = 1;
    }

    // Floating Popups
    for (let i = popups.length - 1; i >= 0; i--) {
      const pop = popups[i];
      ctx.font = '800 15px system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.globalAlpha = Math.min(1, pop.life);
      ctx.fillStyle = pop.color;
      ctx.fillText(pop.text, pop.x, pop.y);
      ctx.globalAlpha = 1;
    }

    ctx.restore();
  }

  function renderMinimap() {
    miniCtx.clearRect(0, 0, 150, 150);
    const scale = 150 / GRID_SIZE;
    for (let y = 0; y < GRID_SIZE; y += 2) {
      for (let x = 0; x < GRID_SIZE; x += 2) {
        const ownerId = territory[cellIdx(x, y)];
        if (ownerId) {
          const owner = state.entities.get(ownerId);
          if (!owner || !owner.alive) continue;
          miniCtx.fillStyle = owner.skin.color;
          miniCtx.fillRect(x * scale, y * scale, scale * 2, scale * 2);
        }
      }
    }
    if (state.me && state.me.alive) {
      const mx = (state.me.x / WORLD_SIZE) * 150;
      const my = (state.me.y / WORLD_SIZE) * 150;
      miniCtx.fillStyle = '#ffffff';
      miniCtx.beginPath();
      miniCtx.arc(mx, my, 4, 0, Math.PI * 2);
      miniCtx.fill();
    }
  }

  function updateHUD() {
    const counts = new Map();
    const totalCells = GRID_SIZE * GRID_SIZE;
    for (let i = 0; i < totalCells; i++) {
      const o = territory[i];
      if (o) counts.set(o, (counts.get(o) || 0) + 1);
    }

    const list = [];
    for (const ent of state.entities.values()) {
      if (!ent.alive) continue;
      const c = counts.get(ent.id) || 0;
      ent.areaPct = (c / totalCells) * 100;
      list.push(ent);
    }
    list.sort((a, b) => b.areaPct - a.areaPct);

    if (state.me) {
      if (state.me.areaPct > state.peakArea) state.peakArea = state.me.areaPct;
      document.getElementById('hud-area').textContent = state.me.areaPct.toFixed(1) + '%';
      document.getElementById('hud-kills').textContent = state.me.kills;
      document.getElementById('hud-score').textContent = state.me.score;
    }

    const topList = list.slice(0, 6);
    if (state.me && state.me.alive && !topList.some((e) => e.id === state.playerId)) {
      topList[5] = state.me;
    }

    const lbRows = document.getElementById('hud-lb-rows');
    lbRows.innerHTML = topList.map((ent) => {
      const isMe = ent.id === state.playerId;
      const badge = isMe ? '<span class="tag-badge live">YOU</span>' : (ent.isBot ? '<span class="tag-badge">BOT</span>' : '<span class="tag-badge live">LIVE</span>');
      return \`<div class="hud-lb-row \${isMe ? 'is-me' : ''}">
        <span class="swatch" style="background:\${ent.skin.color}"></span>
        <span class="hud-lb-name">\${ent.name}</span>
        \${badge}
        <span>\${ent.areaPct.toFixed(1)}%</span>
      </div>\`;
    }).join('');
  }

  // =========================================================================
  // 8. MAIN GAME LOOP
  // =========================================================================
  let lastTime = performance.now();
  let hudTick = 0;

  function loop(now) {
    const dt = Math.min(0.05, (now - lastTime) / 1000);
    lastTime = now;

    if (state.running) {
      rebuildTrailGrid();
      if (state.me && state.me.alive) {
        stepEntityPhysics(state.me, dt);
        state.camera.x += (state.me.x - state.camera.x) * Math.min(1, dt * 8);
        state.camera.y += (state.me.y - state.camera.y) * Math.min(1, dt * 8);
      }

      for (const ent of state.entities.values()) {
        if (ent.id === state.playerId || !ent.alive) continue;
        if (state.offlineMode && ent.isBot) {
          stepLocalBot(ent, dt);
          stepEntityPhysics(ent, dt);
        } else {
          // Smooth dead-reckoning interpolation for remote players & server bots
          ent.targetX += ent.dx * PLAYER_SPEED * dt;
          ent.targetY += ent.dy * PLAYER_SPEED * dt;
          ent.x += (ent.targetX - ent.x) * Math.min(1, dt * 12);
          ent.y += (ent.targetY - ent.y) * Math.min(1, dt * 12);
        }
      }

      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        p.vz -= 320 * dt;
        p.z = Math.max(0, p.z + p.vz * dt);
        p.life -= dt;
        if (p.life <= 0) particles.splice(i, 1);
      }

      for (let i = popups.length - 1; i >= 0; i--) {
        const pop = popups[i];
        pop.y -= 28 * dt;
        pop.life -= dt;
        if (pop.life <= 0) popups.splice(i, 1);
      }

      if (now - state.lastSyncTime >= SYNC_INTERVAL_MS) {
        state.lastSyncTime = now;
        syncWithEdge();
      }

      hudTick += dt;
      if (hudTick >= 0.25) {
        hudTick = 0;
        updateHUD();
        renderMinimap();
      }

      renderFrame(now);
    }

    requestAnimationFrame(loop);
  }
  requestAnimationFrame(loop);

  // =========================================================================
  // 9. UI, SKINS PREVIEW, ROOMS & LEADERBOARD
  // =========================================================================
  const skinGrid = document.getElementById('skin-grid');
  const skinCanvases = [];

  SKINS.forEach((skin) => {
    const card = document.createElement('div');
    card.className = 'skin-card' + (skin.id === state.selectedSkin.id ? ' active' : '');
    const c = document.createElement('canvas');
    c.width = 64;
    c.height = 64;
    const label = document.createElement('span');
    label.textContent = skin.name.split(' ')[0];
    card.appendChild(c);
    card.appendChild(label);
    card.addEventListener('click', () => {
      sfx.playClick();
      document.querySelectorAll('.skin-card').forEach((el) => el.classList.remove('active'));
      card.classList.add('active');
      state.selectedSkin = { ...skin, color: state.selectedColor };
      localStorage.setItem('edgewars_skin_id', skin.id);
      document.getElementById('selected-skin-name').textContent = skin.name;
    });
    skinGrid.appendChild(card);
    skinCanvases.push({ ctx: c.getContext('2d'), skin });
  });
  document.getElementById('selected-skin-name').textContent = state.selectedSkin.name;
  document.getElementById('input-nickname').addEventListener('input', (e) => {
    const v = e.target.value.trim();
    if (v) localStorage.setItem('edgewars_nickname', v);
  });

  function animateSkinPreviews(t) {
    if (!document.getElementById('start-screen').classList.contains('hidden')) {
      skinCanvases.forEach(({ ctx: sctx, skin }, i) => {
        sctx.clearRect(0, 0, 64, 64);
        draw25DAvatar(sctx, 32, 36, 26, skin, t * 0.002 + i, Math.sin(t * 0.004 + i) * 2);
      });
    }
    requestAnimationFrame(animateSkinPreviews);
  }
  requestAnimationFrame(animateSkinPreviews);

  function showToast(msg) {
    const toast = document.getElementById('toast');
    toast.textContent = msg;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 2200);
  }

  function getInviteUrl() {
    const url = new URL(window.location.href);
    url.searchParams.set('room', state.roomCode);
    return url.toString();
  }

  function copyInviteLink() {
    sfx.playClick();
    const link = getInviteUrl();
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(link).catch(() => {});
    }
    showToast('Invite link copied: ' + state.roomCode);
  }

  async function loadGlobalLeaderboard() {
    const ul = document.getElementById('global-lb-list');
    try {
      const res = await fetch('/api/leaderboard');
      if (!res.ok) throw new Error('LB error');
      const data = await res.json();
      const rows = (data.top || []).slice(0, 5);
      if (rows.length === 0) {
        ul.innerHTML = '<li class="lb-item"><span class="lb-name">Be the first champion today!</span></li>';
        return;
      }
      ul.innerHTML = rows.map((r, i) => \`
        <li class="lb-item">
          <span class="lb-rank">#\${i + 1}</span>
          <span class="lb-name">\${r.name}</span>
          <span class="lb-score">\${r.score} pts (\${(r.area || 0).toFixed(1)}%)</span>
        </li>
      \`).join('');
    } catch (_e) {
      ul.innerHTML = '<li class="lb-item"><span class="lb-rank">#1</span><span class="lb-name">Arvan_Edge (Local)</span><span class="lb-score">2450 pts</span></li>';
    }
  }

  async function submitLeaderboard(score, area) {
    if (state.offlineMode || score <= 0) return;
    try {
      await fetch('/api/leaderboard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: state.me ? state.me.name : 'CyberPilot',
          score,
          area
        })
      });
    } catch (_e) {}
  }

  function startMatch(mode, roomCode) {
    sfx.playClick();
    const nick = (document.getElementById('input-nickname').value || 'CyberPilot').trim().slice(0, 14);
    state.mode = mode;
    state.roomCode = roomCode || 'PUBLIC';
    state.matchSeq = (state.matchSeq || 0) + 1;
    state.syncPending = false;
    state.needsSpawnSync = true;
    state.botsEnabled = document.getElementById('chk-bots').checked;
    state.offlineMode = false;
    state.entities.clear();
    territory.fill(null);
    trailGrid.fill(null);
    capturePulse.fill(0);
    state.pendingNewCells = [];
    state.pendingClearedVictims = [];
    state.pendingKills = [];
    state.peakArea = 0;
    state.startTime = performance.now();

    const me = createEntity(state.playerId, nick, state.selectedSkin, false);
    state.me = me;
    state.entities.set(state.playerId, me);
    state.camera.x = me.x;
    state.camera.y = me.y;

    document.getElementById('hud-room-badge').textContent = mode === 'private' ? \`PRIVATE: \${state.roomCode}\` : 'PUBLIC';
    document.getElementById('start-screen').classList.add('hidden');
    document.getElementById('gameover-screen').classList.add('hidden');
    document.getElementById('hud').classList.remove('hidden');

    state.running = true;
    syncWithEdge();
  }

  function showGameOver(reason) {
    state.running = false;
    const survived = Math.round((performance.now() - state.startTime) / 1000);
    const score = state.me ? state.me.score : 0;
    const kills = state.me ? state.me.kills : 0;

    document.getElementById('gameover-reason').textContent = reason;
    document.getElementById('go-peak-area').textContent = state.peakArea.toFixed(1) + '%';
    document.getElementById('go-kills').textContent = kills;
    document.getElementById('go-score').textContent = score;
    document.getElementById('go-time').textContent = survived + 's';

    document.getElementById('hud').classList.add('hidden');
    document.getElementById('gameover-screen').classList.remove('hidden');

    submitLeaderboard(score, state.peakArea);
  }

  // Button bindings
  document.getElementById('btn-play-public').addEventListener('click', () => startMatch('public', 'PUBLIC'));

  function renderColorPalette(containerId, onPick) {
    const el = document.getElementById(containerId);
    if (!el) return;
    el.innerHTML = '';
    PALETTE_COLORS.forEach((col, idx) => {
      const sw = document.createElement('div');
      sw.className = 'color-swatch' + (col === state.selectedColor ? ' active' : '');
      sw.style.background = col;
      sw.title = col;
      sw.addEventListener('click', () => {
        if (sw.classList.contains('taken')) {
          showToast('این رنگ توسط بازیکن دیگری انتخاب شده است! 🔒');
          return;
        }
        sfx.playClick();
        state.selectedColor = col;
        localStorage.setItem('edgewars_color', col);
        state.selectedSkin = { ...state.selectedSkin, color: col };
        document.querySelectorAll('.color-swatch').forEach((s) => s.classList.toggle('active', s.title === col));
        if (onPick) onPick(col);
      });
      el.appendChild(sw);
    });
  }

  renderColorPalette('lobby-color-palette', () => pollLobby());

  const lobbySkinGrid = document.getElementById('lobby-skin-grid');
  SKINS.forEach((skin, idx) => {
    const card = document.createElement('div');
    card.className = 'skin-card' + (idx === 0 ? ' active' : '');
    card.dataset.skinId = skin.id;
    card.innerHTML = \`<div style="font-size:1.5rem;line-height:1.4;">\${skin.icon}</div><span>\${skin.name.split(' ')[0]}</span>\`;
    card.addEventListener('click', () => {
      sfx.playClick();
      state.selectedSkin = { ...skin, color: state.selectedColor };
      localStorage.setItem('edgewars_skin_id', skin.id);
      document.querySelectorAll('#lobby-skin-grid .skin-card').forEach((el) => el.classList.remove('active'));
      card.classList.add('active');
      pollLobby();
    });
    lobbySkinGrid.appendChild(card);
  });

  document.getElementById('lobby-nickname').addEventListener('input', (e) => {
    document.getElementById('input-nickname').value = e.target.value;
    const v = e.target.value.trim();
    if (v) localStorage.setItem('edgewars_nickname', v);
  });

  const WIN_DESC = {
    'territory:20': 'اولین بازیکنی که ۲۰٪ از کل مساحت زمین را تصرف کند، بلافاصله برنده مسابقه می‌شود.',
    'territory:30': 'اولین بازیکنی که ۳۰٪ از کل مساحت زمین را تصرف کند، بلافاصله برنده مسابقه می‌شود.',
    'territory:50': 'اولین بازیکنی که ۵۰٪ از کل مساحت زمین را تصرف کند، بلافاصله برنده مسابقه می‌شود.',
    'timed:120': 'مسابقه ۲ دقیقه طول می‌کشد و در پایان زمان، بازیکنی که بیشترین درصد زمین را دارد برنده است.',
    'timed:180': 'مسابقه ۳ دقیقه طول می‌کشد و در پایان زمان، بازیکنی که بیشترین درصد زمین را دارد برنده است.',
    'endless': 'بازی محدودیت زمانی یا درصدی ندارد و رقابت آزادانه ادامه پیدا می‌کند.'
  };

  function updateWinDesc() {
    const val = document.getElementById('sel-win-mode').value;
    document.getElementById('win-mode-desc').textContent = WIN_DESC[val] || '';
  }
  document.getElementById('sel-win-mode').addEventListener('change', () => {
    updateWinDesc();
    pollLobby();
  });
  document.getElementById('sel-bot-count').addEventListener('change', () => pollLobby());

  let lobbyTimer = null;

  function getLobbySettings() {
    const [winMode, winVal] = document.getElementById('sel-win-mode').value.split(':');
    return {
      botCount: Number(document.getElementById('sel-bot-count').value),
      winMode,
      targetPct: winMode === 'territory' ? Number(winVal) : 30,
      timeLimitSec: winMode === 'timed' ? Number(winVal) : 120
    };
  }

  async function pollLobby(action = null) {
    const nick = (document.getElementById('lobby-nickname').value || document.getElementById('input-nickname').value || 'CyberPilot').trim().slice(0, 14);
    try {
      const res = await fetch('/api/lobby', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          roomCode: state.roomCode,
          playerId: state.playerId,
          isCreator: state.isLobbyHost,
          name: nick,
          skinId: state.selectedSkin.id,
          color: state.selectedColor,
          settings: getLobbySettings(),
          action
        })
      });
      if (!res.ok) return;
      const data = await res.json();
      const isHost = state.isLobbyHost && data.hostId === state.playerId;
      document.getElementById('lobby-role-badge').textContent = isHost ? 'HOST' : 'GUEST';
      document.getElementById('btn-lobby-start').style.display = isHost ? 'inline-flex' : 'none';
      document.getElementById('sel-bot-count').disabled = !isHost;
      document.getElementById('sel-win-mode').disabled = !isHost;

      const meInLobby = (data.players || []).find((p) => p.id === state.playerId);
      if (meInLobby && meInLobby.color && meInLobby.color !== state.selectedColor) {
        state.selectedColor = meInLobby.color;
        state.selectedSkin = { ...state.selectedSkin, color: meInLobby.color };
        document.querySelectorAll('#lobby-color-palette .color-swatch').forEach((s) => s.classList.toggle('active', s.title === meInLobby.color));
      }

      if (!isHost && data.settings) {
        document.getElementById('sel-bot-count').value = String(data.settings.botCount ?? 6);
        const wmVal = data.settings.winMode === 'endless' ? 'endless'
          : (data.settings.winMode === 'timed' ? \`timed:\${data.settings.timeLimitSec}\` : \`territory:\${data.settings.targetPct}\`);
        document.getElementById('sel-win-mode').value = wmVal;
        updateWinDesc();
      }

      const takenColors = new Set(
        (data.players || []).filter((p) => p.id !== state.playerId && p.color).map((p) => p.color)
      );
      document.querySelectorAll('#lobby-color-palette .color-swatch').forEach((sw) => {
        sw.classList.toggle('taken', takenColors.has(sw.title));
      });

      document.getElementById('lobby-player-count').textContent = \`\${(data.players || []).length} / 20\`;
      document.getElementById('lobby-players-list').innerHTML = (data.players || []).map((p) => {
        const sk = SKINS.find((s) => s.id === p.skinId) || SKINS[0];
        return \`<li class="lb-item">
          <span class="swatch" style="background:\${p.color || sk.color};margin-right:8px;"></span>
          <span style="margin-right:6px;">\${sk.icon}</span>
          <span class="lb-name">\${p.name}</span>
          <span class="tag-badge live">\${p.isHost ? 'HOST' : 'READY'}</span>
        </li>\`;
      }).join('');

      if (data.status === 'playing') {
        clearInterval(lobbyTimer);
        lobbyTimer = null;
        document.getElementById('lobby-screen').classList.add('hidden');
        startMatch('private', state.roomCode);
      }
    } catch (_e) {}
  }

  function openLobby(code, isCreator = false) {
    state.roomCode = code;
    state.isLobbyHost = isCreator;
    document.getElementById('lobby-role-badge').textContent = isCreator ? 'HOST' : 'GUEST';
    document.getElementById('btn-lobby-start').style.display = isCreator ? 'inline-flex' : 'none';
    document.getElementById('sel-bot-count').disabled = !isCreator;
    document.getElementById('sel-win-mode').disabled = !isCreator;
    document.getElementById('lobby-nickname').value = document.getElementById('input-nickname').value || 'CyberPilot';
    document.getElementById('lobby-code-title').textContent = code;
    document.getElementById('start-screen').classList.add('hidden');
    document.getElementById('victory-screen').classList.add('hidden');
    document.getElementById('lobby-screen').classList.remove('hidden');
    pollLobby();
    if (lobbyTimer) clearInterval(lobbyTimer);
    lobbyTimer = setInterval(() => pollLobby(), 600);
  }

  document.getElementById('btn-create-private').addEventListener('click', () => {
    const code = Math.random().toString(36).substring(2, 7).toUpperCase();
    const url = new URL(window.location.href);
    url.searchParams.set('room', code);
    window.history.replaceState({}, '', url.toString());
    document.getElementById('banner-room-code').textContent = code;
    document.getElementById('invite-banner').classList.remove('hidden');
    openLobby(code, true);
  });

  document.getElementById('btn-join-room').addEventListener('click', () => {
    const code = document.getElementById('input-room-code').value.trim().toUpperCase();
    if (code.length < 3) {
      showToast('Enter a valid room code!');
      return;
    }
    openLobby(code, false);
  });

  document.getElementById('btn-lobby-start').addEventListener('click', () => pollLobby('start'));
  document.getElementById('btn-lobby-copy').addEventListener('click', copyInviteLink);
  document.getElementById('btn-lobby-leave').addEventListener('click', () => {
    clearInterval(lobbyTimer);
    lobbyTimer = null;
    document.getElementById('lobby-screen').classList.add('hidden');
    document.getElementById('start-screen').classList.remove('hidden');
  });

  document.getElementById('btn-victory-lobby').addEventListener('click', async () => {
    await pollLobby('reset');
    openLobby(state.roomCode);
  });
  document.getElementById('btn-victory-menu').addEventListener('click', () => {
    document.getElementById('victory-screen').classList.add('hidden');
    document.getElementById('start-screen').classList.remove('hidden');
  });

  document.getElementById('btn-copy-invite').addEventListener('click', copyInviteLink);
  document.getElementById('btn-hud-copy').addEventListener('click', copyInviteLink);
  document.getElementById('btn-gameover-invite').addEventListener('click', copyInviteLink);

  document.getElementById('btn-play-again').addEventListener('click', () => {
    startMatch(state.mode, state.roomCode);
  });

  document.getElementById('btn-main-menu').addEventListener('click', () => {
    sfx.playClick();
    document.getElementById('gameover-screen').classList.add('hidden');
    document.getElementById('start-screen').classList.remove('hidden');
    let selectedFbTag = '😍 عالی';
  document.querySelectorAll('.fb-tag').forEach((btn) => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.fb-tag').forEach((b) => b.style.borderColor = 'rgba(255,255,255,0.14)');
      btn.style.borderColor = 'var(--accent-cyan)';
      selectedFbTag = btn.dataset.tag;
    });
  });

  document.getElementById('btn-open-feedback').addEventListener('click', () => {
    sfx.playClick();
    document.getElementById('fb-name').value = document.getElementById('input-nickname').value || '';
    document.getElementById('feedback-modal').classList.remove('hidden');
  });
  document.getElementById('btn-close-feedback').addEventListener('click', () => {
    document.getElementById('feedback-modal').classList.add('hidden');
  });
  document.getElementById('btn-send-feedback').addEventListener('click', async () => {
    const msg = document.getElementById('fb-msg').value.trim();
    if (!msg) { showToast('لطفاً متن نظر را بنویسید'); return; }
    const name = (document.getElementById('fb-name').value || 'ناشناس').trim().slice(0, 20);
    try {
      await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, tag: selectedFbTag, message: msg })
      });
      document.getElementById('fb-msg').value = '';
      document.getElementById('feedback-modal').classList.add('hidden');
      showToast('نظر شما با موفقیت ثبت شد! 🙏');
    } catch (_e) {
      showToast('خطا در ارسال نظر');
    }
  });

  loadGlobalLeaderboard();
  });

  function updateMuteButtons() {
    const m = sfx.muted;
    document.getElementById('btn-start-mute').textContent = m ? '🔇 Sound OFF' : '🔊 Sound ON';
    document.getElementById('btn-hud-mute').textContent = m ? '🔇' : '🔊';
  }
  updateMuteButtons();

  document.getElementById('btn-start-mute').addEventListener('click', () => {
    sfx.toggleMute();
    updateMuteButtons();
  });
  document.getElementById('btn-hud-mute').addEventListener('click', () => {
    sfx.toggleMute();
    updateMuteButtons();
  });

  // Auto-detect ?room=CODE from URL
  const urlParams = new URLSearchParams(window.location.search);
  const urlRoom = urlParams.get('room');
  if (urlRoom && urlRoom.trim().length >= 3) {
    const clean = urlRoom.trim().toUpperCase().slice(0, 5);
    state.roomCode = clean;
    document.getElementById('input-room-code').value = clean;
    document.getElementById('banner-room-code').textContent = clean;
    document.getElementById('invite-banner').classList.remove('hidden');
    openLobby(clean);
  }

  let selectedFbTag = '😍 عالی';
  document.querySelectorAll('.fb-tag').forEach((btn) => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.fb-tag').forEach((b) => b.style.borderColor = 'rgba(255,255,255,0.14)');
      btn.style.borderColor = 'var(--accent-cyan)';
      selectedFbTag = btn.dataset.tag;
    });
  });

  document.getElementById('btn-open-feedback').addEventListener('click', () => {
    sfx.playClick();
    document.getElementById('fb-name').value = document.getElementById('input-nickname').value || '';
    document.getElementById('feedback-modal').classList.remove('hidden');
  });
  document.getElementById('btn-close-feedback').addEventListener('click', () => {
    document.getElementById('feedback-modal').classList.add('hidden');
  });
  document.getElementById('btn-send-feedback').addEventListener('click', async () => {
    const msg = document.getElementById('fb-msg').value.trim();
    if (!msg) { showToast('لطفاً متن نظر را بنویسید'); return; }
    const name = (document.getElementById('fb-name').value || 'ناشناس').trim().slice(0, 20);
    try {
      await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, tag: selectedFbTag, message: msg })
      });
      document.getElementById('fb-msg').value = '';
      document.getElementById('feedback-modal').classList.add('hidden');
      showToast('نظر شما با موفقیت ثبت شد! 🙏');
    } catch (_e) {
      showToast('خطا در ارسال نظر');
    }
  });

  loadGlobalLeaderboard();
})();
</script>
</body>
</html>
`;

const GRID_SIZE = 96;
const CELL_SIZE = 28;
const WORLD_SIZE = GRID_SIZE * CELL_SIZE;
const PLAYER_SPEED = 195;
const MAX_ROOM_ENTITIES = 12;
const MAX_PRIVATE_ROOM_ENTITIES = 20;
const PLAYER_TIMEOUT_MS = 5000;
const LOBBY_PLAYER_TIMEOUT_MS = 45000;

const PALETTE_COLORS = [
  '#00f5d4', '#ffbe0b', '#ff007f', '#9b5de5', '#00bbf9',
  '#f15bb5', '#06d6a0', '#fb5607', '#3a86ff', '#8ac926',
  '#ff595e', '#ffca3a', '#6a4c93', '#1982c4', '#2ec4b6',
  '#e71d36', '#ff9f1c', '#b5179e', '#4cc9f0', '#aacc00'
];

const BOT_NAMES = [
  'Soroush_Pro', 'YaldaKing', 'Arvan_Edge', 'Kourosh_X',
  'Nazanin_GG', 'CyberDariush', 'TehranDrift', 'Aria_Bot',
  'Parsa_Viper', 'Setareh_99', 'Alborz_OP', 'Rostam_IO'
];

const BOT_SKINS = [
  'cyber_cube', 'solar_pyramid', 'plasma_sphere', 'royal_crown',
  'mecha_bot', 'crimson_crystal', 'emerald_prism', 'void_star'
];

// In-memory isolate cache for ultra-low latency
const rooms = new Map();
let memoryLeaderboard = [];
let memoryFeedback = [];

const APP_VERSION = 'v1.5.0';

const telemetry = {
  dayKey: new Date().toISOString().slice(0, 10),
  bootedAt: Date.now(),
  uniquePlayers: new Set(),
  peakConcurrentToday: 0,
  totalMatchesToday: 0,
  totalKillsToday: 0,
  totalCellsCapturedToday: 0,
  history: []
};

function resetTelemetryIfNewDay() {
  const today = new Date().toISOString().slice(0, 10);
  if (telemetry.dayKey !== today) {
    telemetry.dayKey = today;
    telemetry.uniquePlayers.clear();
    telemetry.peakConcurrentToday = 0;
    telemetry.totalMatchesToday = 0;
    telemetry.totalKillsToday = 0;
    telemetry.totalCellsCapturedToday = 0;
    telemetry.history = [];
  }
}

function getTodayKey() {
  return 'lb_' + new Date().toISOString().slice(0, 10);
}

function getKV(env) {
  if (env && env.EDGEWARS_KV) return env.EDGEWARS_KV;
  if (typeof globalThis !== 'undefined' && globalThis.EDGEWARS_KV) return globalThis.EDGEWARS_KV;
  return null;
}

const BOT_ARCHETYPES = ['HUNTER', 'DAREDEVIL', 'TURTLE', 'CORNER_BARON', 'OPPORTUNIST'];

function createBot(index, aggression = 'mixed') {
  const gx = 8 + Math.floor(Math.random() * (GRID_SIZE - 16));
  const gy = 8 + Math.floor(Math.random() * (GRID_SIZE - 16));
  const dirs = [
    { dx: 1, dy: 0 }, { dx: -1, dy: 0 },
    { dx: 0, dy: 1 }, { dx: 0, dy: -1 }
  ];
  const d = dirs[index % dirs.length];
  const archetype = BOT_ARCHETYPES[Math.floor(Math.random() * BOT_ARCHETYPES.length)];

  return {
    id: 'bot_' + index + '_' + Math.random().toString(36).slice(2, 6),
    name: BOT_NAMES[index % BOT_NAMES.length],
    skinId: BOT_SKINS[index % BOT_SKINS.length],
    color: PALETTE_COLORS[(index + 2) % PALETTE_COLORS.length],
    archetype,
    isBot: true,
    alive: true,
    x: (gx + 0.5) * CELL_SIZE,
    y: (gy + 0.5) * CELL_SIZE,
    dx: d.dx,
    dy: d.dy,
    score: 250,
    kills: 0,
    trail: [],
    turnTimer: 0.25 + Math.random() * 0.4,
    legSteps: 0,
    planDirs: []
  };
}

function captureBotTerritory(room, bot) {
  if (bot.trail.length === 0) return;
  for (const tIdx of bot.trail) {
    room.territory.set(tIdx, bot.id);
  }
  bot.trail = [];

  const total = GRID_SIZE * GRID_SIZE;
  const visited = new Uint8Array(total);
  const queue = new Int32Array(total);
  let head = 0;
  let tail = 0;

  for (let x = 0; x < GRID_SIZE; x++) {
    const top = x;
    const bottom = (GRID_SIZE - 1) * GRID_SIZE + x;
    if (room.territory.get(top) !== bot.id && !visited[top]) {
      visited[top] = 1;
      queue[tail++] = top;
    }
    if (room.territory.get(bottom) !== bot.id && !visited[bottom]) {
      visited[bottom] = 1;
      queue[tail++] = bottom;
    }
  }
  for (let y = 0; y < GRID_SIZE; y++) {
    const left = y * GRID_SIZE;
    const right = y * GRID_SIZE + (GRID_SIZE - 1);
    if (room.territory.get(left) !== bot.id && !visited[left]) {
      visited[left] = 1;
      queue[tail++] = left;
    }
    if (room.territory.get(right) !== bot.id && !visited[right]) {
      visited[right] = 1;
      queue[tail++] = right;
    }
  }

  while (head < tail) {
    const curr = queue[head++];
    const cx = curr % GRID_SIZE;
    const cy = (curr / GRID_SIZE) | 0;
    const neighbors = [
      cx > 0 ? curr - 1 : -1,
      cx < GRID_SIZE - 1 ? curr + 1 : -1,
      cy > 0 ? curr - GRID_SIZE : -1,
      cy < GRID_SIZE - 1 ? curr + GRID_SIZE : -1
    ];
    for (const n of neighbors) {
      if (n !== -1 && !visited[n] && room.territory.get(n) !== bot.id) {
        visited[n] = 1;
        queue[tail++] = n;
      }
    }
  }

  let captured = 0;
  for (let i = 0; i < total; i++) {
    if (!visited[i] && room.territory.get(i) !== bot.id) {
      room.territory.set(i, bot.id);
      captured++;
    }
  }
  bot.score += captured * 10;
}

function respawnBot(room, bot, index) {
  for (const [k, v] of room.territory) {
    if (v === bot.id) room.territory.delete(k);
  }
  const safe = findSafeSpawnInRoom(room);
  const fresh = createBot(index, room.settings ? room.settings.aggression : 'mixed');
  fresh.x = (safe.gx + 0.5) * CELL_SIZE;
  fresh.y = (safe.gy + 0.5) * CELL_SIZE;
  Object.assign(bot, fresh);
  claimSafeBaseInRoom(room, bot.id, safe.gx, safe.gy);
}

function findSafeSpawnInRoom(room) {
  const occupiedMask = new Uint8Array(GRID_SIZE * GRID_SIZE);
  for (const cellIdx of room.territory.keys()) {
    if (cellIdx >= 0 && cellIdx < occupiedMask.length) occupiedMask[cellIdx] = 1;
  }
  for (const p of room.players.values()) {
    if (!p.alive) continue;
    for (const tIdx of p.trail) {
      if (tIdx >= 0 && tIdx < occupiedMask.length) occupiedMask[tIdx] = 1;
    }
  }
  for (const b of room.bots) {
    if (!b.alive) continue;
    for (const tIdx of b.trail) {
      if (tIdx >= 0 && tIdx < occupiedMask.length) occupiedMask[tIdx] = 1;
    }
  }

  const allHeads = [...Array.from(room.players.values()), ...room.bots].filter((e) => e.alive);
  let best = { gx: 40, gy: 40, score: -1e9 };

  const evalCandidate = (gx, gy) => {
    let occ = 0;
    for (let y = gy - 3; y <= gy + 3; y++) {
      for (let x = gx - 3; x <= gx + 3; x++) {
        if (occupiedMask[y * GRID_SIZE + x]) occ++;
      }
    }
    let minHeadDist = 999;
    for (const h of allHeads) {
      const d = Math.abs(Math.floor(h.x / CELL_SIZE) - gx) + Math.abs(Math.floor(h.y / CELL_SIZE) - gy);
      if (d < minHeadDist) minHeadDist = d;
    }
    const score = minHeadDist * 3 - occ * 200;
    if (score > best.score) best = { gx, gy, score };
    return occ === 0;
  };

  let foundZero = false;
  for (let attempt = 0; attempt < 80; attempt++) {
    const gx = 6 + Math.floor(Math.random() * (GRID_SIZE - 12));
    const gy = 6 + Math.floor(Math.random() * (GRID_SIZE - 12));
    if (evalCandidate(gx, gy)) {
      foundZero = true;
      break;
    }
  }

  if (!foundZero) {
    for (let gy = 5; gy <= GRID_SIZE - 6; gy += 2) {
      for (let gx = 5; gx <= GRID_SIZE - 6; gx += 2) {
        if (evalCandidate(gx, gy)) break;
      }
    }
  }
  return best;
}

function claimSafeBaseInRoom(room, ownerId, cx, cy) {
  for (let y = cy - 2; y <= cy + 2; y++) {
    for (let x = cx - 2; x <= cx + 2; x++) {
      if (x >= 0 && x < GRID_SIZE && y >= 0 && y < GRID_SIZE) {
        const idx = y * GRID_SIZE + x;
        if (!room.territory.has(idx)) {
          room.territory.set(idx, ownerId);
        }
      }
    }
  }
}

function getPublicRoomForPlayer(playerId, botsEnabled) {
  for (const [code, room] of rooms) {
    if (code.startsWith('PUBLIC-') && room.players.has(playerId)) {
      return room;
    }
  }
  let idx = 1;
  while (true) {
    const code = 'PUBLIC-' + idx;
    const room = getOrCreateRoom(code, botsEnabled);
    if (room.players.size < MAX_ROOM_ENTITIES) {
      return room;
    }
    idx++;
  }
}

function getOrCreateRoom(roomCode, botsEnabled) {
  if (!rooms.has(roomCode)) {
    const isPublic = roomCode.startsWith('PUBLIC');
    const room = {
      code: roomCode,
      status: isPublic ? 'playing' : 'lobby', // 'lobby' | 'playing' | 'finished'
      hostId: null,
      settings: {
        botCount: isPublic ? 11 : 6,
        aggression: 'mixed', // 'mixed' | 'daredevils' | 'hunters'
        winMode: isPublic ? 'endless' : 'territory', // 'territory' | 'lives' | 'timed' | 'endless'
        targetPct: 30,
        lives: 3,
        timeLimitSec: 120
      },
      botsEnabled: botsEnabled !== false,
      players: new Map(),
      bots: [],
      territory: new Map(), // cellIndex -> ownerId
      winner: null,
      startedAt: isPublic ? Date.now() : 0,
      lastStep: Date.now()
    };
    rooms.set(roomCode, room);
  }
  return rooms.get(roomCode);
}

function getUnusedColorInRoom(room, excludeId = null) {
  const used = new Set();
  for (const [pid, p] of room.players) {
    if (pid !== excludeId && p.color) used.add(p.color);
  }
  for (const b of room.bots) {
    if (b.id !== excludeId && b.color) used.add(b.color);
  }
  for (const c of PALETTE_COLORS) {
    if (!used.has(c)) return c;
  }
  return PALETTE_COLORS[Math.floor(Math.random() * PALETTE_COLORS.length)];
}

function pruneDisconnectedTerritory(room, ownerId, anchorIdx = -1) {
  const owned = [];
  for (const [cellIdx, oid] of room.territory) {
    if (oid === ownerId) owned.push(cellIdx);
  }
  if (owned.length <= 1) return;

  const ownedSet = new Set(owned);
  const visited = new Set();
  const components = [];

  for (const start of owned) {
    if (visited.has(start)) continue;
    const comp = [];
    const queue = [start];
    visited.add(start);
    let head = 0;
    while (head < queue.length) {
      const curr = queue[head++];
      comp.push(curr);
      const cx = curr % GRID_SIZE;
      const cy = (curr / GRID_SIZE) | 0;
      const neighbors = [
        cx > 0 ? curr - 1 : -1,
        cx < GRID_SIZE - 1 ? curr + 1 : -1,
        cy > 0 ? curr - GRID_SIZE : -1,
        cy < GRID_SIZE - 1 ? curr + GRID_SIZE : -1
      ];
      for (const n of neighbors) {
        if (n !== -1 && ownedSet.has(n) && !visited.has(n)) {
          visited.add(n);
          queue.push(n);
        }
      }
    }
    components.push(comp);
  }

  if (components.length <= 1) return;

  let keepComp = components[0];
  if (anchorIdx !== -1) {
    const anchored = components.find((c) => c.includes(anchorIdx));
    if (anchored) keepComp = anchored;
    else {
      for (const c of components) if (c.length > keepComp.length) keepComp = c;
    }
  } else {
    for (const c of components) if (c.length > keepComp.length) keepComp = c;
  }

  const keepSet = new Set(keepComp);
  for (const idx of owned) {
    if (!keepSet.has(idx)) {
      room.territory.delete(idx);
    }
  }
}

function isSafeBotCell(room, bot, gx, gy) {
  if (gx < 1 || gx >= GRID_SIZE - 1 || gy < 1 || gy >= GRID_SIZE - 1) return false;
  const idx = gy * GRID_SIZE + gx;
  return !bot.trail.includes(idx);
}

function findNearestOwnedDir(room, bot, gx, gy) {
  let bestDist = 9999;
  let bestGx = gx;
  let bestGy = gy;
  // Sample owned cells
  let checked = 0;
  for (const [cellIdx, ownerId] of room.territory) {
    if (ownerId !== bot.id) continue;
    const cx = cellIdx % GRID_SIZE;
    const cy = (cellIdx / GRID_SIZE) | 0;
    const d = Math.abs(cx - gx) + Math.abs(cy - gy);
    if (d < bestDist) {
      bestDist = d;
      bestGx = cx;
      bestGy = cy;
    }
    if (++checked > 250 && bestDist < 12) break;
  }
  const candidates = [
    { dx: 1, dy: 0 }, { dx: -1, dy: 0 },
    { dx: 0, dy: 1 }, { dx: 0, dy: -1 }
  ].filter((d) => !(d.dx === -bot.dx && d.dy === -bot.dy) && isSafeBotCell(room, bot, gx + d.dx, gy + d.dy));

  if (candidates.length === 0) return null;
  candidates.sort((a, b) => {
    const da = Math.abs((gx + a.dx) - bestGx) + Math.abs((gy + a.dy) - bestGy);
    const db = Math.abs((gx + b.dx) - bestGx) + Math.abs((gy + b.dy) - bestGy);
    return da - db;
  });
  return candidates[0];
}

function findNearestTrailTarget(room, bot, gx, gy, maxRadius) {
  let bestDist = maxRadius + 1;
  let target = null;
  for (const p of room.players.values()) {
    if (!p.alive || p.id === bot.id) continue;
    for (const idx of p.trail) {
      const tx = idx % GRID_SIZE;
      const ty = (idx / GRID_SIZE) | 0;
      const d = Math.abs(tx - gx) + Math.abs(ty - gy);
      if (d < bestDist) { bestDist = d; target = { x: tx, y: ty }; }
    }
  }
  for (const b of room.bots) {
    if (!b.alive || b.id === bot.id) continue;
    for (const idx of b.trail) {
      const tx = idx % GRID_SIZE;
      const ty = (idx / GRID_SIZE) | 0;
      const d = Math.abs(tx - gx) + Math.abs(ty - gy);
      if (d < bestDist) { bestDist = d; target = { x: tx, y: ty }; }
    }
  }
  return target;
}

function stepRoomBots(room, now) {
  const dt = Math.min(0.25, (now - room.lastStep) / 1000);
  room.lastStep = now;
  if (dt <= 0) return;

  const realCount = room.players.size;
  const desiredBots = room.code.startsWith('PUBLIC')
    ? (room.botsEnabled ? Math.max(0, MAX_ROOM_ENTITIES - realCount) : 0)
    : Math.min(room.settings ? room.settings.botCount : 0, Math.max(0, MAX_PRIVATE_ROOM_ENTITIES - realCount));

  while (room.bots.length < desiredBots) {
    const safe = findSafeSpawnInRoom(room);
    const bot = createBot(room.bots.length, room.settings ? room.settings.aggression : 'mixed');
    bot.color = getUnusedColorInRoom(room, bot.id);
    bot.x = (safe.gx + 0.5) * CELL_SIZE;
    bot.y = (safe.gy + 0.5) * CELL_SIZE;
    claimSafeBaseInRoom(room, bot.id, safe.gx, safe.gy);
    room.bots.push(bot);
  }
  if (room.bots.length > desiredBots) {
    const removed = room.bots.splice(desiredBots);
    for (const b of removed) {
      for (const [k, v] of room.territory) {
        if (v === b.id) room.territory.delete(k);
      }
    }
  }

  for (const bot of room.bots) {
    if (!bot.alive) continue;
    bot.turnTimer -= dt;
    const gx = Math.floor(bot.x / CELL_SIZE);
    const gy = Math.floor(bot.y / CELL_SIZE);
    const onOwn = room.territory.get(gy * GRID_SIZE + gx) === bot.id;

    // Check if next cell is unsafe
    const aheadUnsafe = !isSafeBotCell(room, bot, gx + bot.dx, gy + bot.dy);

    if (bot.turnTimer <= 0 || aheadUnsafe) {
      // 1. HUNTER / OPPORTUNIST trail-hunting radar
      const radar = bot.archetype === 'HUNTER' ? 14 : (bot.archetype === 'OPPORTUNIST' ? 7 : 0);
      const prey = radar > 0 ? findNearestTrailTarget(room, bot, gx, gy, radar) : null;

      if (prey && bot.trail.length < 18) {
        const dirs = [
          { dx: 1, dy: 0 }, { dx: -1, dy: 0 },
          { dx: 0, dy: 1 }, { dx: 0, dy: -1 }
        ].filter((d) => !(d.dx === -bot.dx && d.dy === -bot.dy) && isSafeBotCell(room, bot, gx + d.dx, gy + d.dy));
        if (dirs.length > 0) {
          dirs.sort((a, b) => (Math.abs(gx + a.dx - prey.x) + Math.abs(gy + a.dy - prey.y)) - (Math.abs(gx + b.dx - prey.x) + Math.abs(gy + b.dy - prey.y)));
          bot.dx = dirs[0].dx;
          bot.dy = dirs[0].dy;
          bot.turnTimer = 0.25;
        }
      } else if (!onOwn && bot.trail.length > (bot.archetype === 'DAREDEVIL' ? 22 : (bot.archetype === 'TURTLE' ? 5 : 11))) {
        // 2. Return home to flood-fill!
        const homeDir = findNearestOwnedDir(room, bot, gx, gy);
        if (homeDir) {
          bot.dx = homeDir.dx;
          bot.dy = homeDir.dy;
          bot.turnTimer = 0.28;
        }
      } else if (!bot.planDirs || bot.planDirs.length === 0) {
        // 3. Plan expansion loop based on archetype
        const dirs = [
          { dx: 1, dy: 0 }, { dx: -1, dy: 0 },
          { dx: 0, dy: 1 }, { dx: 0, dy: -1 }
        ].filter((d) => !(d.dx === -bot.dx && d.dy === -bot.dy) && isSafeBotCell(room, bot, gx + d.dx, gy + d.dy));

        if (dirs.length > 0) {
          let d1 = dirs[Math.floor(Math.random() * dirs.length)];
          if (bot.archetype === 'CORNER_BARON') {
            // Bias toward nearest corner
            const cx = gx < GRID_SIZE / 2 ? -1 : 1;
            const cy = gy < GRID_SIZE / 2 ? -1 : 1;
            const cornerPick = dirs.find((d) => d.dx === cx || d.dy === cy);
            if (cornerPick) d1 = cornerPick;
          }
          const perp = d1.dx !== 0
            ? [{ dx: 0, dy: 1 }, { dx: 0, dy: -1 }]
            : [{ dx: 1, dy: 0 }, { dx: -1, dy: 0 }];
          const d2 = perp[Math.floor(Math.random() * 2)];
          bot.planDirs = [d1, d2, { dx: -d1.dx, dy: -d1.dy }, { dx: -d2.dx, dy: -d2.dy }];
        }
      }

      if (bot.planDirs && bot.planDirs.length > 0 && !prey) {
        const next = bot.planDirs.shift();
        if (!(next.dx === -bot.dx && next.dy === -bot.dy) && isSafeBotCell(room, bot, gx + next.dx, gy + next.dy)) {
          bot.dx = next.dx;
          bot.dy = next.dy;
        }
        const legTime = bot.archetype === 'DAREDEVIL' ? 1.15 : (bot.archetype === 'TURTLE' ? 0.35 : 0.65);
        bot.turnTimer = legTime + Math.random() * 0.45;
      }
    }

    // Sub-stepped continuous movement so bots NEVER skip intermediate trail cells
    const subSteps = Math.max(1, Math.ceil(dt / 0.04));
    const subDt = dt / subSteps;
    for (let s = 0; s < subSteps; s++) {
      bot.x = Math.max(CELL_SIZE, Math.min(WORLD_SIZE - CELL_SIZE, bot.x + bot.dx * PLAYER_SPEED * subDt));
      bot.y = Math.max(CELL_SIZE, Math.min(WORLD_SIZE - CELL_SIZE, bot.y + bot.dy * PLAYER_SPEED * subDt));

      const cgx = Math.floor(bot.x / CELL_SIZE);
      const cgy = Math.floor(bot.y / CELL_SIZE);
      const idx = cgy * GRID_SIZE + cgx;

      if (room.territory.get(idx) === bot.id) {
        if (bot.trail.length > 0) {
          captureBotTerritory(room, bot);
          pruneDisconnectedTerritory(room, bot.id, idx);
        }
      } else {
        if (bot.trail[bot.trail.length - 1] !== idx) {
          bot.trail.push(idx);
        }
      }
    }
  }

  // Server-side trail collision detection
  const trailOwnerMap = new Map();
  for (const p of room.players.values()) {
    if (!p.alive) continue;
    for (const tIdx of p.trail) trailOwnerMap.set(tIdx, p.id);
  }
  for (const b of room.bots) {
    if (!b.alive) continue;
    for (const tIdx of b.trail) trailOwnerMap.set(tIdx, b.id);
  }

  for (let i = 0; i < room.bots.length; i++) {
    const b = room.bots[i];
    if (!b.alive) continue;
    const bIdx = Math.floor(b.y / CELL_SIZE) * GRID_SIZE + Math.floor(b.x / CELL_SIZE);
    const victimId = trailOwnerMap.get(bIdx);
    if (victimId && victimId !== b.id) {
      const vp = room.players.get(victimId);
      if (vp && vp.alive) {
        vp.alive = false;
        vp.killedBy = b.name;
        vp.trail = [];
        for (const [k, v] of room.territory) {
          if (v === vp.id) room.territory.delete(k);
        }
      } else {
        const vbIdx = room.bots.findIndex((x) => x.id === victimId);
        if (vbIdx !== -1) {
          respawnBot(room, room.bots[vbIdx], vbIdx);
        }
      }
    }
  }

  // Purge any orphaned territory cells belonging to dead/disconnected entities
  const aliveIds = new Set();
  for (const p of room.players.values()) {
    if (p.alive) aliveIds.add(p.id);
  }
  for (const b of room.bots) {
    if (b.alive) aliveIds.add(b.id);
  }
  for (const [k, ownerId] of room.territory) {
    if (!aliveIds.has(ownerId)) {
      room.territory.delete(k);
    }
  }
}

function checkRoomVictory(room, now) {
  if (room.status !== 'playing' || !room.settings || room.settings.winMode === 'endless') return;

  const totalCells = GRID_SIZE * GRID_SIZE;
  const counts = new Map();
  for (const ownerId of room.territory.values()) {
    counts.set(ownerId, (counts.get(ownerId) || 0) + 1);
  }

  const all = [...Array.from(room.players.values()), ...room.bots];
  let leader = null;
  let leaderPct = 0;

  for (const ent of all) {
    const pct = ((counts.get(ent.id) || 0) / totalCells) * 100;
    if (pct > leaderPct) {
      leaderPct = pct;
      leader = { id: ent.id, name: ent.name, skinId: ent.skinId, areaPct: pct, score: ent.score || 0, kills: ent.kills || 0 };
    }
  }

  if (room.settings.winMode === 'territory' && leader && leaderPct >= room.settings.targetPct) {
    room.status = 'finished';
    room.winner = { ...leader, reason: `Reached ${room.settings.targetPct}% Territory Domination!` };
    return;
  }

  if (room.settings.winMode === 'timed' && room.startedAt > 0) {
    const elapsedSec = (now - room.startedAt) / 1000;
    if (elapsedSec >= room.settings.timeLimitSec && leader) {
      room.status = 'finished';
      room.winner = { ...leader, reason: `Time's Up! Highest Territory (${leaderPct.toFixed(1)}%)` };
    }
  }
}

function ensureUniqueNameInRoom(room, playerId, rawName) {
  const base = String(rawName || 'Player').trim().slice(0, 14) || 'Player';
  const taken = new Set();
  for (const [pid, p] of room.players) {
    if (pid !== playerId && p.name) taken.add(p.name.toLowerCase());
  }
  for (const b of room.bots) {
    if (b.id !== playerId && b.name) taken.add(b.name.toLowerCase());
  }
  if (!taken.has(base.toLowerCase())) return base;
  let n = 2;
  while (n < 99) {
    const candidate = `${base.slice(0, 11)}_${n}`;
    if (!taken.has(candidate.toLowerCase())) return candidate;
    n++;
  }
  return `${base.slice(0, 10)}_${Math.floor(Math.random() * 90 + 10)}`;
}

async function handleLobby(request) {
  let body;
  try {
    body = await request.json();
  } catch (_e) {
    return new Response(JSON.stringify({ error: 'Invalid JSON' }), { status: 400 });
  }
  const now = Date.now();
  const roomCode = (body.roomCode || 'PUBLIC').toUpperCase().slice(0, 8);
  const room = getOrCreateRoom(roomCode, true);

  for (const [pid, p] of room.players) {
    if (now - p.lastSeen > LOBBY_PLAYER_TIMEOUT_MS) room.players.delete(pid);
  }

  if (body.isCreator && body.playerId) {
    room.hostId = body.playerId;
  }

  if (body.playerId) {
    const existing = room.players.get(body.playerId);
    let chosenColor = body.color || (existing ? existing.color : getUnusedColorInRoom(room, body.playerId));
    // Enforce unique color in Private Room Lobby
    for (const [pid, other] of room.players) {
      if (pid !== body.playerId && other.color === chosenColor) {
        chosenColor = existing && existing.color !== other.color
          ? existing.color
          : getUnusedColorInRoom(room, body.playerId);
        break;
      }
    }
    const uniqueName = ensureUniqueNameInRoom(room, body.playerId, body.name);
    room.players.set(body.playerId, {
      id: body.playerId,
      name: uniqueName,
      skinId: body.skinId || 'cyber_cube',
      color: chosenColor,
      isBot: false,
      x: existing ? existing.x : 1000,
      y: existing ? existing.y : 1000,
      dx: 1,
      dy: 0,
      score: 250,
      kills: 0,
      alive: true,
      trail: [],
      lastSeen: now
    });
  }

  if (body.settings && body.playerId === room.hostId) {
    room.settings = { ...room.settings, ...body.settings };
  }

  if (body.action === 'start' && body.playerId === room.hostId) {
    room.status = 'playing';
    room.winner = null;
    room.startedAt = now;
    room.territory.clear();
    room.bots = [];
    for (let i = 0; i < 10; i++) stepRoomBots(room, room.lastStep + 200);
  } else if (body.action === 'reset' && body.playerId === room.hostId) {
    room.status = 'lobby';
    room.winner = null;
    room.territory.clear();
    room.bots = [];
  }

  return new Response(JSON.stringify({
    roomCode: room.code,
    status: room.status,
    hostId: room.hostId,
    settings: room.settings,
    winner: room.winner,
    players: Array.from(room.players.values()).map((p) => ({
      id: p.id, name: p.name, skinId: p.skinId, color: p.color || '#00f5d4', isHost: p.id === room.hostId
    }))
  }), { headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' } });
}

async function handleSync(request) {
  let body;
  try {
    body = await request.json();
  } catch (_e) {
    return new Response(JSON.stringify({ error: 'Invalid JSON' }), { status: 400 });
  }

  const now = Date.now();
  const rawCode = (body.roomCode || 'PUBLIC').toUpperCase().slice(0, 12);
  const p = body.player;
  const room = (body.mode === 'public' || rawCode === 'PUBLIC')
    ? getPublicRoomForPlayer(p && p.id ? p.id : '', body.botsEnabled)
    : getOrCreateRoom(rawCode, body.botsEnabled);

  let assignedSpawn = null;
  if (body.spawnRequest && p && p.id) {
    resetTelemetryIfNewDay();
    telemetry.uniquePlayers.add(p.id);
    telemetry.totalMatchesToday++;
    const safe = findSafeSpawnInRoom(room);
    claimSafeBaseInRoom(room, p.id, safe.gx, safe.gy);
    assignedSpawn = { x: (safe.gx + 0.5) * CELL_SIZE, y: (safe.gy + 0.5) * CELL_SIZE, gx: safe.gx, gy: safe.gy };
  }

  // Prune inactive players (> 5s silence)
  for (const [pid, p] of room.players) {
    if (now - p.lastSeen > PLAYER_TIMEOUT_MS) {
      room.players.delete(pid);
      for (const [k, v] of room.territory) {
        if (v === pid) room.territory.delete(k);
      }
    }
  }

  if (p && p.id) {
    const existing = room.players.get(p.id);
    const assignedColor = existing && existing.color
      ? existing.color
      : (body.mode === 'public' ? getUnusedColorInRoom(room, p.id) : (p.color || getUnusedColorInRoom(room, p.id)));
    const uniqueName = existing && existing.name ? existing.name : ensureUniqueNameInRoom(room, p.id, p.name);
    room.players.set(p.id, {
      id: p.id,
      name: uniqueName,
      skinId: p.skinId || 'cyber_cube',
      color: assignedColor,
      isBot: false,
      x: Number(p.x) || 1000,
      y: Number(p.y) || 1000,
      dx: Number(p.dx) || 1,
      dy: Number(p.dy) || 0,
      score: Number(p.score) || 0,
      kills: Number(p.kills) || 0,
      alive: p.alive !== false,
      trail: Array.isArray(p.trail) ? p.trail.slice(-80) : [],
      lastSeen: now
    });

    if (!body.spawnRequest && Array.isArray(body.newCells)) {
      telemetry.totalCellsCapturedToday += body.newCells.length;
      for (const idx of body.newCells) {
        if (typeof idx === 'number' && idx >= 0 && idx < GRID_SIZE * GRID_SIZE) {
          room.territory.set(idx, p.id);
        }
      }
    }

    // Server invariant guard: alive player must always own at least their 5x5 base
    if (p.alive !== false) {
      let hasAny = false;
      for (const oid of room.territory.values()) {
        if (oid === p.id) { hasAny = true; break; }
      }
      if (!hasAny) {
        const bx = typeof p.baseGx === 'number' ? p.baseGx : Math.floor((Number(p.x) || 1000) / CELL_SIZE);
        const by = typeof p.baseGy === 'number' ? p.baseGy : Math.floor((Number(p.y) || 1000) / CELL_SIZE);
        claimSafeBaseInRoom(room, p.id, bx, by);
      }
    }

    if (Array.isArray(body.clearedVictims)) {
      for (const vid of body.clearedVictims) {
        for (const [k, v] of room.territory) {
          if (v === vid) room.territory.delete(k);
        }
        const vbIdx = room.bots.findIndex((b) => b.id === vid);
        if (vbIdx !== -1) {
          respawnBot(room, room.bots[vbIdx], vbIdx);
        }
        const vp = room.players.get(vid);
        if (vp) {
          vp.alive = false;
          vp.trail = [];
          vp.killedBy = p.name;
        }
      }
    }

    if (Array.isArray(body.kills)) {
      telemetry.totalKillsToday += body.kills.length;
      for (const vid of body.kills) {
        const vbIdx = room.bots.findIndex((b) => b.id === vid);
        if (vbIdx !== -1) {
          respawnBot(room, room.bots[vbIdx], vbIdx);
        }
        const vp = room.players.get(vid);
        if (vp) {
          vp.alive = false;
          vp.trail = [];
          vp.killedBy = p.name;
          for (const [k, v] of room.territory) {
            if (v === vid) room.territory.delete(k);
          }
        }
      }
    }
  }

  stepRoomBots(room, now);
  checkRoomVictory(room, now);

  const playersOut = [
    ...Array.from(room.players.values()),
    ...room.bots
  ];

  // Full 80x80 territory snapshot (max 6400 cells)
  const territoryOwners = Array.from(room.territory.entries());

  return new Response(JSON.stringify({
    roomCode: room.code,
    assignedSpawn,
    status: room.status,
    settings: room.settings,
    winner: room.winner,
    startedAt: room.startedAt,
    players: playersOut,
    territoryOwners
  }), {
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-store'
    }
  });
}

async function handleLeaderboard(request, env) {
  const kv = getKV(env);
  const key = getTodayKey();

  if (request.method === 'GET') {
    let top = memoryLeaderboard;
    if (kv) {
      try {
        const raw = await kv.get(key);
        if (raw) top = JSON.parse(raw);
      } catch (_e) {}
    }
    return new Response(JSON.stringify({ top: top.slice(0, 5) }), {
      headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' }
    });
  }

  if (request.method === 'POST') {
    try {
      const body = await request.json();
      const entry = {
        name: String(body.name || 'Player').slice(0, 14),
        score: Number(body.score) || 0,
        area: Number(body.area) || 0
      };
      if (kv) {
        try {
          const raw = await kv.get(key);
          if (raw) memoryLeaderboard = JSON.parse(raw);
        } catch (_e) {}
      }
      memoryLeaderboard.push(entry);
      memoryLeaderboard.sort((a, b) => b.score - a.score);
      memoryLeaderboard = memoryLeaderboard.slice(0, 5);

      if (kv) {
        try {
          await kv.put(key, JSON.stringify(memoryLeaderboard), { expirationTtl: 86400 });
        } catch (_e) {}
      }
      return new Response(JSON.stringify({ ok: true, top: memoryLeaderboard }), {
        headers: { 'Content-Type': 'application/json' }
      });
    } catch (_e) {
      return new Response(JSON.stringify({ error: 'Bad request' }), { status: 400 });
    }
  }

  return new Response('Method Not Allowed', { status: 405 });
}

function handleStats(env) {
  resetTelemetryIfNewDay();
  const now = Date.now();
  let publicRoomsCount = 0;
  let privateRoomsCount = 0;
  let playingPlayersNow = 0;
  let lobbyPlayersNow = 0;
  let activeBotsNow = 0;
  const botArchetypes = {};
  const anonymizedRooms = [];
  let pubIdx = 1;
  let privIdx = 1;
  const totalCells = GRID_SIZE * GRID_SIZE;

  for (const [code, room] of rooms) {
    // Prune stale players
    for (const [pid, p] of room.players) {
      if (now - p.lastSeen > PLAYER_TIMEOUT_MS) room.players.delete(pid);
    }
    if (room.players.size === 0) continue;

    const isPublic = code.startsWith('PUBLIC');
    if (isPublic) publicRoomsCount++;
    else privateRoomsCount++;

    const humans = room.players.size;
    if (room.status === 'lobby') lobbyPlayersNow += humans;
    else playingPlayersNow += humans;

    activeBotsNow += room.bots.length;
    for (const b of room.bots) {
      botArchetypes[b.archetype] = (botArchetypes[b.archetype] || 0) + 1;
    }

    const counts = new Map();
    for (const ownerId of room.territory.values()) {
      counts.set(ownerId, (counts.get(ownerId) || 0) + 1);
    }
    let maxCount = 0;
    for (const c of counts.values()) if (c > maxCount) maxCount = c;

    const s = room.settings || {};
    const goalLabel = s.winMode === 'endless' ? '♾️ آزاد'
      : (s.winMode === 'timed' ? `⏱️ ${Math.round((s.timeLimitSec || 120) / 60)} دقیقه` : `🎯 ${s.targetPct || 30}%`);

    anonymizedRooms.push({
      isPublic,
      label: isPublic ? `Public Arena #${pubIdx++}` : `Private Room #${privIdx++}`,
      status: room.status,
      humans,
      capacity: isPublic ? MAX_ROOM_ENTITIES : MAX_PRIVATE_ROOM_ENTITIES,
      bots: room.bots.length,
      goalLabel,
      leaderPct: (maxCount / totalCells) * 100,
      occupancyPct: (room.territory.size / totalCells) * 100
    });
  }

  const onlinePlayersNow = playingPlayersNow + lobbyPlayersNow;
  if (onlinePlayersNow > telemetry.peakConcurrentToday) {
    telemetry.peakConcurrentToday = onlinePlayersNow;
  }

  telemetry.history.push({ t: now, players: onlinePlayersNow, rooms: anonymizedRooms.length });
  if (telemetry.history.length > 30) telemetry.history.shift();

  return new Response(JSON.stringify({
    version: APP_VERSION,
    bootedAt: telemetry.bootedAt,
    kvConnected: !!getKV(env),
    onlinePlayersNow,
    playingPlayersNow,
    lobbyPlayersNow,
    peakConcurrentToday: telemetry.peakConcurrentToday,
    uniquePlayersToday: telemetry.uniquePlayers.size,
    totalMatchesToday: telemetry.totalMatchesToday,
    activeRoomsTotal: anonymizedRooms.length,
    publicRoomsCount,
    privateRoomsCount,
    activeBotsNow,
    totalKillsToday: telemetry.totalKillsToday,
    totalCellsCapturedToday: telemetry.totalCellsCapturedToday,
    botArchetypes,
    history: telemetry.history,
    rooms: anonymizedRooms,
    feedbacks: memoryFeedback.slice(0, 50)
  }), {
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' }
  });
}

const DASHBOARD_HTML_CONTENT = `<!DOCTYPE html>
<html lang="fa" dir="rtl">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>EdgeWars.io — Live Edge Analytics Dashboard</title>
<style>
  :root {
    --bg: #070b14;
    --panel: rgba(13, 20, 36, 0.88);
    --card: rgba(20, 30, 54, 0.78);
    --border: rgba(0, 245, 212, 0.22);
    --cyan: #00f5d4;
    --blue: #00bbf9;
    --pink: #ff007f;
    --gold: #ffbe0b;
    --purple: #9b5de5;
    --text: #f1f5f9;
    --muted: #94a3b8;
  }
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    background: radial-gradient(circle at top right, #0f172a 0%, #050811 100%);
    color: var(--text);
    font-family: 'Vazirmatn', system-ui, -apple-system, sans-serif;
    min-height: 100vh;
    padding: 20px;
  }
  .container { max-width: 1220px; margin: 0 auto; }
  .topbar {
    display: flex; align-items: center; justify-content: space-between;
    flex-wrap: wrap; gap: 12px; margin-bottom: 22px;
    background: var(--panel); border: 1px solid var(--border);
    border-radius: 16px; padding: 16px 20px;
  }
  .title-wrap h1 {
    font-size: 1.5rem; font-weight: 900;
    background: linear-gradient(135deg, var(--cyan), var(--blue), var(--pink));
    -webkit-background-clip: text; -webkit-text-fill-color: transparent;
  }
  .title-wrap p { font-size: 0.82rem; color: var(--muted); margin-top: 3px; }
  .actions { display: flex; align-items: center; gap: 10px; }
  .live-pill {
    display: inline-flex; align-items: center; gap: 7px;
    background: rgba(0, 245, 212, 0.12); border: 1px solid rgba(0, 245, 212, 0.35);
    color: var(--cyan); padding: 6px 12px; border-radius: 999px; font-size: 0.78rem; font-weight: 700;
  }
  .dot {
    width: 8px; height: 8px; border-radius: 50%; background: var(--cyan);
    box-shadow: 0 0 10px var(--cyan); animation: pulse 1.4s infinite;
  }
  @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.35; } }
  .btn {
    background: var(--card); border: 1px solid rgba(255,255,255,0.16);
    color: var(--text); border-radius: 10px; padding: 8px 14px;
    font-size: 0.82rem; font-weight: 700; cursor: pointer; text-decoration: none;
    transition: all 0.15s;
  }
  .btn:hover { border-color: var(--cyan); transform: translateY(-1px); }

  .kpi-grid {
    display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px; margin-bottom: 18px;
  }
  @media (max-width: 900px) { .kpi-grid { grid-template-columns: repeat(2, 1fr); } }
  @media (max-width: 520px) { .kpi-grid { grid-template-columns: 1fr; } }

  .kpi-card {
    background: var(--panel); border: 1px solid var(--border);
    border-radius: 16px; padding: 16px 18px;
  }
  .kpi-label { font-size: 0.78rem; color: var(--muted); font-weight: 600; }
  .kpi-value { font-size: 2rem; font-weight: 900; color: var(--cyan); margin: 6px 0; }
  .kpi-sub { font-size: 0.76rem; color: var(--muted); line-height: 1.5; }

  .main-grid {
    display: grid; grid-template-columns: 1.45fr 1fr; gap: 16px; margin-bottom: 18px;
  }
  @media (max-width: 900px) { .main-grid { grid-template-columns: 1fr; } }

  .box {
    background: var(--panel); border: 1px solid var(--border);
    border-radius: 16px; padding: 18px;
  }
  .box-title {
    font-size: 0.92rem; font-weight: 800; color: var(--gold);
    margin-bottom: 12px; display: flex; justify-content: space-between; align-items: center;
  }

  table { width: 100%; border-collapse: collapse; font-size: 0.82rem; }
  th { text-align: right; color: var(--muted); font-weight: 700; padding: 8px 6px; border-bottom: 1px solid rgba(255,255,255,0.08); }
  td { padding: 9px 6px; border-bottom: 1px solid rgba(255,255,255,0.05); }
  .badge {
    display: inline-block; padding: 2px 8px; border-radius: 6px; font-size: 0.72rem; font-weight: 700;
  }
  .badge-pub { background: rgba(0, 187, 249, 0.18); color: var(--blue); }
  .badge-priv { background: rgba(155, 93, 229, 0.22); color: #d8b4fe; }
  .badge-play { background: rgba(0, 245, 212, 0.16); color: var(--cyan); }
  .badge-wait { background: rgba(255, 190, 11, 0.18); color: var(--gold); }

  .bar-row { margin-bottom: 10px; font-size: 0.8rem; }
  .bar-head { display: flex; justify-content: space-between; margin-bottom: 4px; }
  .bar-track { height: 8px; background: rgba(255,255,255,0.08); border-radius: 999px; overflow: hidden; }
  .bar-fill { height: 100%; background: linear-gradient(90deg, var(--cyan), var(--blue)); border-radius: 999px; }

  #traffic-canvas { width: 100%; height: 180px; display: block; }
</style>
</head>
<body>
<div class="container">
  <div class="topbar">
    <div class="title-wrap">
      <h1>EdgeWars.io — داشبورد مانیتورینگ و آمار زنده <span id="dash-version" style="font-size:0.85rem;color:var(--cyan);">v1.4.0</span></h1>
      <p id="dash-storage-status">در حال بررسی وضعیت ذخیره‌سازی...</p>
    </div>
    <div class="actions">
      <span class="live-pill"><span class="dot"></span> LIVE 2s</span>
      <button class="btn" id="btn-refresh">🔄 بروزرسانی</button>
      <a class="btn" href="https://github.com/eghbalpoorMH/edgewars-io" target="_blank" rel="noopener">⭐ GitHub</a>
      <a class="btn" href="/">🎮 ورود به بازی</a>
    </div>
  </div>

  <div class="kpi-grid">
    <div class="kpi-card">
      <div class="kpi-label">بازیکنان آنلاین الان</div>
      <div class="kpi-value" id="kpi-online">0</div>
      <div class="kpi-sub" id="kpi-online-sub">در حال بازی: 0 • در لابی: 0 • اوج امروز: 0</div>
    </div>
    <div class="kpi-card">
      <div class="kpi-label">بازیکنان یکتای امروز</div>
      <div class="kpi-value" style="color:var(--gold);" id="kpi-unique">0</div>
      <div class="kpi-sub" id="kpi-unique-sub">تعداد کل بازی‌های شروع‌شده امروز: 0</div>
    </div>
    <div class="kpi-card">
      <div class="kpi-label">اتاق‌های فعال الان</div>
      <div class="kpi-value" style="color:var(--blue);" id="kpi-rooms">0</div>
      <div class="kpi-sub" id="kpi-rooms-sub">عمومی: 0 • خصوصی: 0 • ربات‌های فعال: 0</div>
    </div>
    <div class="kpi-card">
      <div class="kpi-label">آمار نبرد امروز</div>
      <div class="kpi-value" style="color:var(--pink);" id="kpi-kills">0</div>
      <div class="kpi-sub" id="kpi-kills-sub">حذف‌ها • خانه‌های تصرف‌شده: 0</div>
    </div>
  </div>

  <div class="main-grid">
    <div class="box">
      <div class="box-title">
        <span>نمودار ترافیک زنده (بازیکنان آنلاین و اتاق‌های فعال)</span>
        <span style="font-size:0.75rem;color:var(--muted);" id="last-updated">--</span>
      </div>
      <canvas id="traffic-canvas" width="640" height="180"></canvas>
    </div>

    <div class="box">
      <div class="box-title"><span>استراتژی ربات‌های فعال و آیکن‌های محبوب</span></div>
      <div id="archetypes-bars"></div>
    </div>
  </div>

  <div class="box">
    <div class="box-title">
      <span>لیست اتاق‌های فعال (ناشناس‌شده برای حفظ حریم خصوصی)</span>
      <span style="font-size:0.75rem;color:var(--muted);">کد اتاق‌های خصوصی نمایش داده نمی‌شود</span>
    </div>
    <div style="overflow-x:auto;">
      <table>
        <thead>
          <tr>
            <th>نوع اتاق</th>
            <th>وضعیت</th>
            <th>بازیکنان واقعی</th>
            <th>ربات‌ها</th>
            <th>شرط برد</th>
            <th>بیشترین درصد</th>
            <th>اشغال نقشه</th>
          </tr>
        </thead>
        <tbody id="rooms-tbody">
          <tr><td colspan="7" style="text-align:center;color:var(--muted);">در حال بارگذاری...</td></tr>
        </tbody>
      </table>
    </div>
  </div>

  <div class="box" style="margin-top:16px;">
    <div class="box-title">
      <span>💬 نظرات و بازخوردهای بازیکنان (Player Feedback)</span>
      <span style="font-size:0.75rem;color:var(--muted);" id="fb-count">0 نظر</span>
    </div>
    <div id="fb-list" style="display:flex;flex-direction:column;gap:8px;max-height:260px;overflow-y:auto;">
      <div style="color:var(--muted);font-size:0.82rem;">هنوز نظری ثبت نشده است.</div>
    </div>
  </div>
</div>

<script>
(() => {
  const canvas = document.getElementById('traffic-canvas');
  const ctx = canvas.getContext('2d');

  function drawChart(history) {
    const w = canvas.width;
    const h = canvas.height;
    ctx.clearRect(0, 0, w, h);

    if (!history || history.length < 2) {
      ctx.fillStyle = '#94a3b8';
      ctx.font = '13px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('در حال جمع‌آوری داده...', w / 2, h / 2);
      return;
    }

    const maxVal = Math.max(5, ...history.map((d) => Math.max(d.players, d.rooms)));
    const stepX = w / (history.length - 1);

    // Grid lines
    ctx.strokeStyle = 'rgba(255,255,255,0.06)';
    ctx.lineWidth = 1;
    for (let i = 1; i <= 3; i++) {
      const y = (h / 4) * i;
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke();
    }

    // Players line
    ctx.strokeStyle = '#00f5d4';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    history.forEach((pt, i) => {
      const x = i * stepX;
      const y = h - 18 - (pt.players / maxVal) * (h - 36);
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    });
    ctx.stroke();

    // Rooms line
    ctx.strokeStyle = '#ffbe0b';
    ctx.lineWidth = 2;
    ctx.beginPath();
    history.forEach((pt, i) => {
      const x = i * stepX;
      const y = h - 18 - (pt.rooms / maxVal) * (h - 36);
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    });
    ctx.stroke();
  }

  async function fetchStats() {
    try {
      const res = await fetch('/api/stats');
      if (!res.ok) return;
      const d = await res.json();

      if (d.version) document.getElementById('dash-version').textContent = d.version;
      const sinceStr = d.bootedAt ? new Date(d.bootedAt).toLocaleString('fa-IR') : '--';
      document.getElementById('dash-storage-status').textContent = d.kvConnected
        ? \`🟢 متصل به Edge KV (پایدار) • آمار از: \${sinceStr}\`
        : \`🟡 حافظه موقت نود لبه (In-Memory — با انتشار نسخه جدید ریست می‌شود) • آمار از: \${sinceStr}\`;

      document.getElementById('kpi-online').textContent = d.onlinePlayersNow;
      document.getElementById('kpi-online-sub').textContent =
        \`در بازی: \${d.playingPlayersNow} • در لابی: \${d.lobbyPlayersNow} • اوج امروز: \${d.peakConcurrentToday}\`;

      document.getElementById('kpi-unique').textContent = d.uniquePlayersToday;
      document.getElementById('kpi-unique-sub').textContent =
        \`تعداد کل بازی‌های شروع‌شده امروز: \${d.totalMatchesToday}\`;

      document.getElementById('kpi-rooms').textContent = d.activeRoomsTotal;
      document.getElementById('kpi-rooms-sub').textContent =
        \`عمومی: \${d.publicRoomsCount} • خصوصی: \${d.privateRoomsCount} • ربات‌ها: \${d.activeBotsNow}\`;

      document.getElementById('kpi-kills').textContent = d.totalKillsToday;
      document.getElementById('kpi-kills-sub').textContent =
        \`حذف‌ها • خانه‌های تصرف‌شده: \${d.totalCellsCapturedToday}\`;

      document.getElementById('last-updated').textContent = new Date().toLocaleTimeString('fa-IR');

      drawChart(d.history || []);

      const archEl = document.getElementById('archetypes-bars');
      const archEntries = Object.entries(d.botArchetypes || {});
      const maxArch = Math.max(1, ...archEntries.map(([, v]) => v));
      archEl.innerHTML = archEntries.length === 0
        ? '<div style="color:var(--muted);font-size:0.82rem;">فعلاً رباتی در حال بازی نیست.</div>'
        : archEntries.map(([k, v]) => \`
          <div class="bar-row">
            <div class="bar-head"><span>\${k}</span><span>\${v}</span></div>
            <div class="bar-track"><div class="bar-fill" style="width:\${(v / maxArch) * 100}%"></div></div>
          </div>
        \`).join('');

      const tbody = document.getElementById('rooms-tbody');
      if (!d.rooms || d.rooms.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;color:var(--muted);">هیچ اتاق فعالی در این لحظه وجود ندارد.</td></tr>';
      } else {
        tbody.innerHTML = d.rooms.map((r) => \`
          <tr>
            <td><span class="badge \${r.isPublic ? 'badge-pub' : 'badge-priv'}">\${r.label}</span></td>
            <td><span class="badge \${r.status === 'playing' ? 'badge-play' : 'badge-wait'}">\${r.status === 'playing' ? 'در حال بازی' : (r.status === 'lobby' ? 'اتاق انتظار' : 'پایان‌یافته')}</span></td>
            <td>\${r.humans} / \${r.capacity}</td>
            <td>\${r.bots}</td>
            <td>\${r.goalLabel}</td>
            <td>\${r.leaderPct.toFixed(1)}%</td>
            <td>\${r.occupancyPct.toFixed(1)}%</td>
          </tr>
        \`).join('');
      }
      const fbList = document.getElementById('fb-list');
      const fbs = d.feedbacks || [];
      document.getElementById('fb-count').textContent = \`\${fbs.length} نظر\`;
      fbList.innerHTML = fbs.length === 0
        ? '<div style="color:var(--muted);font-size:0.82rem;">هنوز نظری ثبت نشده است.</div>'
        : fbs.map((f) => \`
          <div style="background:rgba(7,11,20,0.6);border:1px solid rgba(255,255,255,0.08);border-radius:10px;padding:10px 12px;font-size:0.82rem;">
            <div style="display:flex;justify-content:space-between;margin-bottom:4px;">
              <strong>\${f.name} <span class="badge badge-play">\${f.tag}</span></strong>
              <span style="color:var(--muted);font-size:0.72rem;">\${new Date(f.t).toLocaleTimeString('fa-IR')}</span>
            </div>
            <div style="color:#e2e8f0;line-height:1.45;">\${f.message}</div>
          </div>
        \`).join('');
    } catch (_e) {}
  }

  document.getElementById('btn-refresh').addEventListener('click', fetchStats);
  fetchStats();
  setInterval(fetchStats, 2000);
})();
</script>
</body>
</html>
`;

async function handleRequest(request, env) {
  const url = new URL(request.url);

  if (url.pathname === '/api/sync' && request.method === 'POST') {
    return handleSync(request);
  }
  if (url.pathname === '/api/lobby' && request.method === 'POST') {
    return handleLobby(request);
  }
  if (url.pathname === '/api/stats' && request.method === 'GET') {
    return handleStats(env);
  }
  if (url.pathname === '/api/feedback' && request.method === 'POST') {
    try {
      const fb = await request.json();
      memoryFeedback.unshift({
        name: String(fb.name || 'ناشناس').slice(0, 20),
        tag: String(fb.tag || '💬').slice(0, 16),
        message: String(fb.message || '').slice(0, 300),
        t: Date.now()
      });
      if (memoryFeedback.length > 200) memoryFeedback.length = 200;
      return new Response(JSON.stringify({ ok: true }), { headers: { 'Content-Type': 'application/json' } });
    } catch (_e) {
      return new Response(JSON.stringify({ error: 'Bad request' }), { status: 400 });
    }
  }
  if (url.pathname === '/dashboard') {
    return new Response(DASHBOARD_HTML_CONTENT, {
      headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' }
    });
  }
  if (url.pathname === '/api/leaderboard') {
    return handleLeaderboard(request, env);
  }
  if (url.pathname === '/' || url.pathname === '/index.html') {
    return new Response(HTML_CONTENT, {
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'public, max-age=60'
      }
    });
  }

  return new Response('Not Found', { status: 404 });
}

// Service Worker syntax (ArvanCloud Edge Compute standard)
if (typeof addEventListener === 'function') {
  addEventListener('fetch', (event) => {
    event.respondWith(handleRequest(event.request, typeof globalThis !== 'undefined' ? globalThis : {}));
  });
}

// ES Module Worker syntax
export default {
  async fetch(request, env) {
    return handleRequest(request, env);
  }
};
