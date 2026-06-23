const canvas = document.getElementById('c');
const ctx = canvas.getContext('2d');

const COLORS = ['#c3d208', '#b8b1d8', '#e71d84', '#181818'];
const GRID   = 56;
const RADIUS = 24;
const REPEL  = 130;
const MIN_R  = 3;

const PENT_MAX_R     = 110;
const PENT_DURATION  = 900;
const WAVE_STRENGTH  = 65;

let W, H, circles = [], mouse = { x: -9999, y: -9999 };
let pentagons = [];

/* ── grid ──────────────────────────────────────────── */
function buildGrid() {
  circles = [];
  const cols = Math.ceil(W / GRID) + 1;
  const rows = Math.ceil(H / GRID) + 1;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const offsetX = (r % 2) * (GRID / 2);
      circles.push({
        ox:    c * GRID + offsetX,
        oy:    r * GRID,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        baseR: RADIUS * (0.55 + Math.random() * 0.55),
        phase: Math.random() * Math.PI * 2,
        vx: 0, vy: 0,
        cx: 0, cy: 0
      });
    }
  }
}

function resize() {
  W = canvas.width  = window.innerWidth;
  H = canvas.height = window.innerHeight;
  buildGrid();
}

/* ── pentagon path helper ──────────────────────────── */
function drawPentagon(cx, cy, r, rot) {
  ctx.beginPath();
  for (let i = 0; i < 5; i++) {
    const angle = rot + i * (2 * Math.PI / 5) - Math.PI / 2;
    const x = cx + r * Math.cos(angle);
    const y = cy + r * Math.sin(angle);
    i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
  }
  ctx.closePath();
}

/* ── main loop ─────────────────────────────────────── */
let t = 0;
function draw() {
  t += 0.018;
  ctx.clearRect(0, 0, W, H);

  const now = performance.now();

  // remove expired pentagons
  pentagons = pentagons.filter(p => now - p.born < PENT_DURATION);

  // update + draw circles
  for (const ci of circles) {
    // wave forces from pentagons
    let fx = 0, fy = 0;
    for (const p of pentagons) {
      const age      = now - p.born;
      const progress = age / PENT_DURATION;
      const waveR    = PENT_MAX_R * progress;
      const thickness = PENT_MAX_R * 0.35;

      const dx   = ci.ox - p.x;
      const dy   = ci.oy - p.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 1) continue;

      const diff = Math.abs(dist - waveR);
      if (diff < thickness) {
        const intensity = (1 - diff / thickness) * (1 - progress) * WAVE_STRENGTH;
        fx += (dx / dist) * intensity;
        fy += (dy / dist) * intensity;
      }
    }

    // spring physics
    ci.vx = (ci.vx + fx) * 0.78;
    ci.vy = (ci.vy + fy) * 0.78;
    ci.cx += ci.vx * 0.12;
    ci.cy += ci.vy * 0.12;
    ci.cx *= 0.88;
    ci.cy *= 0.88;

    // effective position
    const ex = ci.ox + ci.cx;
    const ey = ci.oy + ci.cy;

    // mouse repulsion
    const dx   = ex - mouse.x;
    const dy   = ey - mouse.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    let r = ci.baseR;
    if (dist < REPEL) {
      const factor = dist / REPEL;
      r = MIN_R + (ci.baseR - MIN_R) * (factor * factor);
    }
    r *= 1 + 0.04 * Math.sin(t + ci.phase);

    ctx.beginPath();
    ctx.arc(ex, ey, Math.max(r, 0), 0, Math.PI * 2);
    ctx.fillStyle  = ci.color;
    ctx.globalAlpha = 0.88;
    ctx.fill();
  }

  ctx.globalAlpha = 1;

  // draw expanding pentagons
  for (const p of pentagons) {
    const age      = now - p.born;
    const progress = age / PENT_DURATION;
    const r        = PENT_MAX_R * progress;
    const alpha    = (1 - progress) * 0.85;
    const rot      = p.rot + progress * 0.4;

    // outer pentagon
    drawPentagon(p.x, p.y, r, rot);
    ctx.strokeStyle  = p.color;
    ctx.lineWidth    = 3 * (1 - progress) + 1;
    ctx.globalAlpha  = alpha;
    ctx.stroke();

    // inner pentagon
    drawPentagon(p.x, p.y, r * 0.55, rot + Math.PI / 5);
    ctx.strokeStyle  = p.color2;
    ctx.lineWidth    = 2 * (1 - progress) + 0.5;
    ctx.globalAlpha  = alpha * 0.6;
    ctx.stroke();

    ctx.globalAlpha = 1;
  }

  requestAnimationFrame(draw);
}

/* ── events ────────────────────────────────────────── */
window.addEventListener('mousemove', e => {
  mouse.x = e.clientX;
  mouse.y = e.clientY;
});

window.addEventListener('mouseleave', () => {
  mouse.x = -9999;
  mouse.y = -9999;
});

// click → spawn pentagon + expanding wave
window.addEventListener('click', e => {
  const shuffled = [...COLORS].sort(() => Math.random() - 0.5);
  pentagons.push({
    x:    e.clientX,
    y:    e.clientY,
    born: performance.now(),
    rot:  Math.random() * Math.PI * 2,
    color:  shuffled[0],
    color2: shuffled[1]
  });
});

// scroll → resize circles
window.addEventListener('wheel', e => {
  e.preventDefault();
  const delta = e.deltaY > 0 ? 1.06 : 0.94;
  for (const ci of circles) {
    ci.baseR = Math.max(4, Math.min(RADIUS * 1.8, ci.baseR * delta));
  }
}, { passive: false });

window.addEventListener('resize', resize);

resize();
draw();