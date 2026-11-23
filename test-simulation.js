// Automated 3,600-frame (60s @ 60 FPS) Physics & Invariant Verification Suite
const GRID_SIZE = 96;
const CELL_SIZE = 28;
const WORLD_SIZE = GRID_SIZE * CELL_SIZE;
const PLAYER_SPEED = 195;

const territory = new Array(GRID_SIZE * GRID_SIZE).fill(null);
const trailGrid = new Array(GRID_SIZE * GRID_SIZE).fill(null);
const entities = new Map();

function cellIdx(gx, gy) { return gy * GRID_SIZE + gx; }
function inBounds(gx, gy) { return gx >= 0 && gx < GRID_SIZE && gy >= 0 && gy < GRID_SIZE; }

function spawnEntity(id, gx, gy) {
  const ent = {
    id, alive: true,
    x: (gx + 0.5) * CELL_SIZE, y: (gy + 0.5) * CELL_SIZE,
    dx: 1, dy: 0, nextDx: 1, nextDy: 0,
    trail: [], lastDecisionCell: -1, sameCellTime: 0
  };
  for (let y = gy - 2; y <= gy + 2; y++) {
    for (let x = gx - 2; x <= gx + 2; x++) {
      if (inBounds(x, y) && territory[cellIdx(x, y)] === null) territory[cellIdx(x, y)] = id;
    }
  }
  entities.set(id, ent);
  return ent;
}

for (let i = 0; i < 12; i++) {
  spawnEntity('bot_' + i, 8 + (i % 4) * 20, 8 + Math.floor(i / 4) * 24);
}

let violations = 0;
for (let frame = 0; frame < 3600; frame++) {
  trailGrid.fill(null);
  for (const ent of entities.values()) {
    if (!ent.alive) continue;
    for (const idx of ent.trail) trailGrid[idx] = ent.id;
  }

  for (const ent of entities.values()) {
    if (!ent.alive) continue;
    const gx = Math.floor(ent.x / CELL_SIZE);
    const gy = Math.floor(ent.y / CELL_SIZE);
    const dirs = [{ dx: 1, dy: 0 }, { dx: -1, dy: 0 }, { dx: 0, dy: 1 }, { dx: 0, dy: -1 }]
      .filter((d) => !(d.dx === -ent.dx && d.dy === -ent.dy))
      .filter((d) => {
        const nx = gx + d.dx, ny = gy + d.dy;
        return nx >= 2 && nx <= GRID_SIZE - 3 && ny >= 2 && ny <= GRID_SIZE - 3 && trailGrid[cellIdx(nx, ny)] !== ent.id;
      });
    if (dirs.length > 0 && (!dirs.some((d) => d.dx === ent.dx && d.dy === ent.dy) || Math.random() < 0.05)) {
      const p = dirs[Math.floor(Math.random() * dirs.length)];
      ent.nextDx = p.dx; ent.nextDy = p.dy;
    }

    const cx = (gx + 0.5) * CELL_SIZE;
    const cy = (gy + 0.5) * CELL_SIZE;
    if ((ent.nextDx !== ent.dx || ent.nextDy !== ent.dy) && Math.abs(ent.x - cx) < 6 && Math.abs(ent.y - cy) < 6) {
      ent.x = cx; ent.y = cy; ent.dx = ent.nextDx; ent.dy = ent.nextDy;
    }
    ent.x += ent.dx * PLAYER_SPEED * (1 / 60);
    ent.y += ent.dy * PLAYER_SPEED * (1 / 60);

    const ngx = Math.floor(ent.x / CELL_SIZE);
    const ngy = Math.floor(ent.y / CELL_SIZE);
    if (!inBounds(ngx, ngy)) { violations++; continue; }
    const nidx = cellIdx(ngx, ngy);
    if (territory[nidx] === ent.id) {
      for (const t of ent.trail) territory[t] = ent.id;
      ent.trail = [];
    } else if (ent.trail[ent.trail.length - 1] !== nidx) {
      ent.trail.push(nidx);
    }

    // Invariant 1: No entity has duplicate cells in trail
    if (new Set(ent.trail).size !== ent.trail.length) violations++;
  }
}

console.log(`3,600-frame invariant simulation complete. Violations: ${violations}`);
if (violations > 0) process.exit(1);
