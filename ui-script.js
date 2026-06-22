const canvas = document.getElementById('c');
const ctx = canvas.getContext('2d');

const COLORS = ['#c3d208', '#b8b1d8', '#e71d84', '#181818'];
const GRID   = 56;
const RADIUS = 24;
const REPEL  = 130;
const MIN_R  = 3;

let W, H, circles = [], mouse = { x: -9999, y: -9999 };

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
        phase: Math.random() * Math.PI * 2
      });
    }
  }
}

function resize() {
  W = canvas.width  = window.innerWidth;
  H = canvas.height = window.innerHeight;
  buildGrid();
}

let t = 0;
function draw() {
  t += 0.018;
  ctx.clearRect(0, 0, W, H);

  for (const ci of circles) {
    const dx   = ci.ox - mouse.x;
    const dy   = ci.oy - mouse.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    let r = ci.baseR;
    if (dist < REPEL) {
      const factor = dist / REPEL;
      r = MIN_R + (ci.baseR - MIN_R) * (factor * factor);
    }
    r *= 1 + 0.04 * Math.sin(t + ci.phase);

    ctx.beginPath();
    ctx.arc(ci.ox, ci.oy, Math.max(r, 0), 0, Math.PI * 2);
    ctx.fillStyle = ci.color;
    ctx.globalAlpha = 0.88;
    ctx.fill();
  }
  ctx.globalAlpha = 1;
  requestAnimationFrame(draw);
}

window.addEventListener('mousemove', e => {
  mouse.x = e.clientX;
  mouse.y = e.clientY;
});

window.addEventListener('mouseleave', () => {
  mouse.x = -9999;
  mouse.y = -9999;
});

window.addEventListener('click', () => {
  for (const ci of circles) {
    ci.color = COLORS[Math.floor(Math.random() * COLORS.length)];
  }
});

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