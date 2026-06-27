const canvas = document.getElementById('c');
const ctx    = canvas.getContext('2d');

const COLORS = ['#c3d208', '#b8b1d8', '#e71d84', '#181818'];
const GRID   = 56;
const RADIUS = 24;
const REPEL  = 130;
const MIN_R  = 3;

const PENT_MAX_R    = 110;
const PENT_DURATION = 900;
const WAVE_STRENGTH = 65;

let W, H, circles = [], pentagons = [];
let mouse = { x: -9999, y: -9999 };

/* ── CONFIGURACIÓN DE AUDIO (Tone.js) ──────────────── */

// 1. Clic Izquierdo: Idiófono percutido (Marimba/Metalófono)
const synth = new Tone.PolySynth(Tone.Synth, {
    oscillator: { type: "triangle" },
    envelope: { attack: 0.002, decay: 0.4, sustain: 0.01, release: 0.4 }
}).toDestination();

const escalaNotas = ["C4", "D4", "E4", "G4", "A4", "C5", "D5", "E5", "G5", "A5"];

// 2. Clic Derecho: Instrumento de viento gentil (Flauta/Soplo)
const oboeSynth = new Tone.PolySynth(Tone.Synth, {
    oscillator: { type: "sine" },
    envelope: { attack: 0.25, decay: 0.3, sustain: 0.6, release: 0.8 }
}).toDestination();

oboeSynth.volume.value = -8; 
const escalaViento = ["E3", "A3", "B3", "E4", "A4", "B4"];

// Sintetizador 3: Modificado para simular burbujas acuáticas ("glup glup")
const burbujaSynth = new Tone.MembraneSynth({
    pitchDecay: 0.015,     // Qué tan rápido cae/sube la afinación del golpe
    octaves: 2,            // El rango de pitch para simular la elasticidad de la burbuja
    oscillator: {
        type: "sine"       // Onda pura para un sonido limpio y orgánico
    },
    envelope: {
        attack: 0.001,     // Ataque instantáneo (el inicio de la burbuja)
        decay: 0.08,       // Duración muy corta para que sea un "glup" seco y rápido
        sustain: 0,
        release: 0.08
    }
}).toDestination();

// Bajamos un poco el volumen para que el "glup glup" constante no sea molesto
burbujaSynth.volume.value = -6;

// Variables de control para el ritmo del scroll
let ultimoTiempoScroll = 0;
const intervaloBurbujas = 80; // Tiempo mínimo en milisegundos entre cada "glup" (evita que se sature)

// Notas agudas que, al ser percutidas muy rápido, imitan burbujas de distintos tamaños
const notasBurbujas = ["C5", "D5", "E5", "G5", "A5", "C6", "D6", "E6"];

function obtenerNotaBurbuja(progreso) {
    const indice = Math.floor(progreso * (notasBurbujas.length - 1));
    return notasBurbujas[indice];
}

/* ── FUNCIONES DEL CANVAS (Estructura Visual) ──────── */

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

// ESTA FUNCIÓN ES CRUCIAL: Dibuja los lados del pentágono
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

function spawnPentagon(x, y) {
    const shuffled = [...COLORS].sort(() => Math.random() - 0.5);
    pentagons.push({
        x, y,
        born:   performance.now(),
        rot:    Math.random() * Math.PI * 2,
        color:  shuffled[0],
        color2: shuffled[1]
    });

    reproducirSonidoIdiofono();
}

function scaleCircles(factor) {
    for (const ci of circles) {
        ci.baseR = Math.max(4, Math.min(RADIUS * 1.8, ci.baseR * factor));
    }
}

/* ── REPRODUCCIÓN DE AUDIO ─────────────────────────── */

function reproducirSonidoIdiofono() {
    if (Tone.context.state !== 'running') Tone.start();
    const notaAzar = escalaNotas[Math.floor(Math.random() * escalaNotas.length)];
    synth.triggerAttackRelease(notaAzar, "0.6");
}

function reproducirSonidoViento() {
    if (Tone.context.state !== 'running') Tone.start();
    const notaAzar = escalaViento[Math.floor(Math.random() * escalaViento.length)];
    oboeSynth.triggerAttackRelease(notaAzar, "1.2");
}

/* ── BUCLE PRINCIPAL DE ANIMACIÓN ──────────────────── */

function draw() {
    t += 0.018;
    ctx.clearRect(0, 0, W, H);

    const now = performance.now();
    pentagons = pentagons.filter(p => now - p.born < PENT_DURATION);

    // Dibujar la grilla de círculos
    for (const ci of circles) {
        let fx = 0, fy = 0;

        for (const p of pentagons) {
            const age       = now - p.born;
            const progress  = age / PENT_DURATION;
            const waveR     = PENT_MAX_R * progress;
            const thickness = PENT_MAX_R * 0.35;
            const dx  = ci.ox - p.x;
            const dy  = ci.oy - p.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < 1) continue;
            const diff = Math.abs(dist - waveR);
            if (diff < thickness) {
                const intensity = (1 - diff / thickness) * (1 - progress) * WAVE_STRENGTH;
                fx += (dx / dist) * intensity;
                fy += (dy / dist) * intensity;
            }
        }

        ci.vx = (ci.vx + fx) * 0.78;
        ci.vy = (ci.vy + fy) * 0.78;
        ci.cx += ci.vx * 0.12;
        ci.cy += ci.vy * 0.12;
        ci.cx *= 0.88;
        ci.cy *= 0.88;

        const ex = ci.ox + ci.cx;
        const ey = ci.oy + ci.cy;

        const dx   = ex - mouse.x;
        const dy   = ey - mouse.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        let r = ci.baseR;
        if (dist < REPEL) {
            const f = dist / REPEL;
            r = MIN_R + (ci.baseR - MIN_R) * (f * f);
        }
        r *= 1 + 0.04 * Math.sin(t + ci.phase);

        ctx.beginPath();
        ctx.arc(ex, ey, Math.max(r, 0), 0, Math.PI * 2);
        ctx.fillStyle   = ci.color;
        ctx.globalAlpha = 0.88;
        ctx.fill();
    }

    // Dibujar las 3 capas de pentágonos concéntricos
    ctx.globalAlpha = 1;

    for (const p of pentagons) {
        const age      = now - p.born;
        const progress = age / PENT_DURATION;
        const r        = PENT_MAX_R * progress;
        const alpha    = (1 - progress) * 0.85;
        const rot      = p.rot + progress * 0.4;

        // Capa A: Pentágono Gigante Exterior
        drawPentagon(p.x, p.y, r * 1.8, rot - Math.PI / 5);
        ctx.strokeStyle  = p.color;
        ctx.lineWidth    = 12 * (1 - progress) + 3; 
        ctx.globalAlpha  = alpha * 0.4; 
        ctx.stroke();

        // Capa B: Pentágono Medio (Original)
        drawPentagon(p.x, p.y, r, rot);
        ctx.strokeStyle  = p.color;
        ctx.lineWidth    = 8 * (1 - progress) + 2; 
        ctx.globalAlpha  = alpha;
        ctx.stroke();

        // Capa C: Pentágono Interior Pequeño
        drawPentagon(p.x, p.y, r * 0.55, rot + Math.PI / 5);
        ctx.strokeStyle  = p.color2;
        ctx.lineWidth    = 4 * (1 - progress) + 1;
        ctx.globalAlpha  = alpha * 0.6;
        ctx.stroke();

        ctx.globalAlpha = 1;
    }

    requestAnimationFrame(draw);
}

/* ── ESCUCHADORES DE EVENTOS ───────────────────────── */

window.addEventListener('mousemove', e => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
});

window.addEventListener('mouseleave', () => {
    mouse.x = -9999;
    mouse.y = -9999;
});

// Click izquierdo → Pentágonos + Idiófono
window.addEventListener('click', e => {
    spawnPentagon(e.clientX, e.clientY);
});

// Click derecho → Cambiar colores aleatorios + Flauta/Viento
window.addEventListener('contextmenu', e => {
    e.preventDefault();
    for (const ci of circles) {
        ci.color = COLORS[Math.floor(Math.random() * COLORS.length)];
    }
    reproducirSonidoViento(); 
});

// Scroll → Escalar círculos + Efecto rítmico de burbujas ("glup glup")
window.addEventListener('wheel', e => {
    e.preventDefault(); 
    if (Tone.context.state !== 'running') Tone.start();

    // 1. Mantener tu animación de cambiar el tamaño de los círculos
    scaleCircles(e.deltaY > 0 ? 1.06 : 0.94);

    // 2. Control de tiempo para el ritmo "glup glup"
    const ahora = performance.now();
    
    // Solo dispara una burbuja si ha pasado suficiente tiempo desde la última (intervaloBurbujas)
    if (ahora - ultimoTiempoScroll > intervaloBurbujas) {
        
        // 3. Calcular la posición del cursor para variar la afinación de la burbuja
        const maxScroll = window.innerHeight;
        const scrollActual = Math.abs(e.clientY) % maxScroll; 
        const progresoScroll = scrollActual / maxScroll; 

        // 4. Obtener la nota correspondiente
        const notaBurbuja = obtenerNotaBurbuja(progresoScroll);

        // 5. Disparar el "glup" con una duración extremadamente corta (16n = semicorchea)
        burbujaSynth.triggerAttackRelease(notaBurbuja, "16n");

        // Actualizar el marcador de tiempo
        ultimoTiempoScroll = ahora;
    }

}, { passive: false });

window.addEventListener('resize', resize);

// Inicializar el sistema
let t = 0;
resize();
draw();