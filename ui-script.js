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

/* ── pentagon path ─────────────────────────────────── */
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

/* ── spawn helpers ─────────────────────────────────── */
function spawnPentagon(x, y) {
    const shuffled = [...COLORS].sort(() => Math.random() - 0.5);
    pentagons.push({
        x, y,
        born:   performance.now(),
        rot:    Math.random() * Math.PI * 2,
        color:  shuffled[0],
        color2: shuffled[1]
    });
}

function scaleCircles(factor) {
    for (const ci of circles) {
        ci.baseR = Math.max(4, Math.min(RADIUS * 1.8, ci.baseR * factor));
    }
}

/* ── main loop ─────────────────────────────────────── */

let t = 0;
function draw() {
    t += 0.018;
    ctx.clearRect(0, 0, W, H);
    const now = performance.now();
    pentagons = pentagons.filter(p => now - p.born < PENT_DURATION);
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

    ctx.globalAlpha = 1;
    for (const p of pentagons) {
        const age      = now - p.born;
        const progress = age / PENT_DURATION;
        const r        = PENT_MAX_R * progress;
        const alpha    = (1 - progress) * 0.85;
        const rot      = p.rot + progress * 0.4;
        drawPentagon(p.x, p.y, r, rot);
        ctx.strokeStyle  = p.color;
        ctx.lineWidth    = 3 * (1 - progress) + 1;
        ctx.globalAlpha  = alpha;
        ctx.stroke();
        drawPentagon(p.x, p.y, r * 0.55, rot + Math.PI / 5);
        ctx.strokeStyle  = p.color2;
        ctx.lineWidth    = 2 * (1 - progress) + 0.5;
        ctx.globalAlpha  = alpha * 0.6;
        ctx.stroke();
        ctx.globalAlpha = 1;
    }
    requestAnimationFrame(draw);
}
/* ── eventos ───────────────────────────────────────── */
window.addEventListener('mousemove', e => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
});

window.addEventListener('mouseleave', () => {
    mouse.x = -9999;
    mouse.y = -9999;
});

// Click izquierdo → pentágono + onda expansiva
window.addEventListener('click', e => {
    spawnPentagon(e.clientX, e.clientY);
});

// Click derecho → dispersar / encoger círculos
window.addEventListener('contextmenu', e => {
    e.preventDefault();
    
    for (const ci of circles) {
        ci.color = COLORS[Math.floor(Math.random() * COLORS.length)];
    }

    // Activamos el sonido de oboe/viento para el clic derecho
    reproducirSonidoViento(); 
});

// Scroll → Escalar círculos + Sonido continuo de Theremín Armónico
window.addEventListener('wheel', e => {
    e.preventDefault(); // Evita el comportamiento por defecto del navegador
    
    // 1. Asegurar que Tone.js está activo
    if (Tone.context.state !== 'running') {
        Tone.start();
    }

    // 2. Mantener tu efecto visual original en los círculos
    scaleCircles(e.deltaY > 0 ? 1.06 : 0.94);

    // 3. Calcular la posición del scroll simulada o actual
    // Usamos el movimiento del dedo/rueda (e.deltaY) para calcular una posición en la pantalla
    const maxScroll = window.innerHeight;
    const scrollActual = Math.abs(e.clientY) % maxScroll; 
    const progresoScroll = scrollActual / maxScroll; // Un valor entre 0 y 1

    // 4. Obtener la frecuencia armónica según el movimiento
    const nuevaFrecuencia = obtenerFrecuenciaPorScroll(progresoScroll);
    
    // Cambiar la frecuencia de forma suavizada (rampa de 0.05 segundos) para que no haga "clicks" rotos
    theremin.frequency.rampTo(nuevaFrecuencia, 0.05);

    // 5. SUBIR EL VOLUMEN (Hacer que suene de forma gentil mientras te mueves)
    theremin.volume.rampTo(-12, 0.05); // -12dB es un volumen suave y ambiental

    // 6. DETECTOR DE SILENCIO (Si el usuario para de hacer scroll, el sonido se desvanece)
    clearTimeout(scrollTimeout);
    scrollTimeout = setTimeout(() => {
        theremin.volume.rampTo(-Infinity, 0.4); // Se apaga suavemente en 400 milisegundos
    }, 150); // Tiempo de espera antes de empezar a desvanecerse

}, { passive: false });

window.addEventListener('resize', resize);
resize();
draw();

// Arreglo de frecuencias en Hertz (corresponden a notas musicales reales)
const escalaFrecuencias = [261.63, 293.66, 329.63, 392.00, 440.00, 523.25, 587.33, 659.25];
document.body.addEventListener('click', () => {
    // 1. Inicializar el contexto de audio nativo
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    const audioCtx = new AudioContext();
    // 2. Crear los nodos: un oscilador (generador de onda) y un gain (control de volumen)
    const oscilador = audioCtx.createOscillator();
    const controlVolumen = audioCtx.createGain();
    // 3. Configurar el tipo de onda para que suene a idiófono percutido
    oscilador.type = 'triangle';
    // Elegir una frecuencia al azar de la escala
    const frecuenciaAzar = escalaFrecuencias[Math.floor(Math.random() * escalaFrecuencias.length)];
    oscilador.frequency.setValueAtTime(frecuenciaAzar, audioCtx.currentTime);
    // 4. Diseñar la PERCUSIÓN (Envolvente de volumen)
    const tiempoActual = audioCtx.currentTime;
    controlVolumen.gain.setValueAtTime(1, tiempoActual);
    // Decaimiento: baja el volumen a 0 en 0.6 segundos simulando la vibración del metal/madera
    controlVolumen.gain.exponentialRampToValueAtTime(0.001, tiempoActual + 0.6);
    // 5. Conectar los nodos entre sí y hacia los parlantes
    oscilador.connect(controlVolumen);
    controlVolumen.connect(audioCtx.destination);
    // 6. Encender y apagar el oscilador
    oscilador.start(tiempoActual);
    oscilador.stop(tiempoActual + 0.6);
});

window.addEventListener('contextmenu', e => {
    e.preventDefault();
    
    for (const ci of circles) {
        ci.color = COLORS[Math.floor(Math.random() * COLORS.length)];
    }

    // Esto hará que el cambio de color tenga feedback sonoro
    reproducirSonidoIdiofono(); 
});

// Sintetizador 2: Diseñado para ser un instrumento de viento muy gentil y suave (tipo flauta o soplo etéreo)
const oboeSynth = new Tone.PolySynth(Tone.Synth, {
    oscillator: {
        type: "sine" // La onda senoidal es la más pura y suave del espectro, sin armónicos estridentes
    },
    envelope: {
        attack: 0.25,    // Ataque lento (250ms): el sonido entra de forma muy sutil y gradual, como un soplo suave
        decay: 0.3,      
        sustain: 0.6,    // Mantiene una buena presencia de fondo mientras dura la nota
        release: 0.8     // Liberación larga: el sonido se desvanece lentamente en el aire de forma flotante
    }
}).toDestination();

// Bajamos un poco el volumen para que se siente como un colchón sonoro de fondo
oboeSynth.volume.value = -8;

// Notas espaciadas que transmiten calma y espacialidad al hacer click derecho
const escalaViento = ["E3", "A3", "B3", "E4", "A4", "B4"];

function reproducirSonidoViento() {
    // Intentar activar el contexto de audio por si acaso
    if (Tone.context.state !== 'running') {
        Tone.start();
    }
    
    // Elegir una nota al azar de la escala de viento
    const notaAzar = escalaViento[Math.floor(Math.random() * escalaViento.length)];
    
    // El oboe sostiene la nota un poco más (1.2 segundos) para dar sensación de aire
    oboeSynth.triggerAttackRelease(notaAzar, "1.2");
}

// Sintetizador 3: Theremín continuo y suave para el scroll
const theremin = new Tone.Oscillator({
    type: "sine",           // Onda pura, relajante y sin estridencias
    frequency: 440,         // Frecuencia inicial
    volume: -Infinity       // Empieza en silencio absoluto
}).toDestination();

// Encendemos el oscilador internamente, pero no sonará hasta que subamos el volumen
theremin.start();

// Variable para rastrear el temporizador de apagado del sonido
let scrollTimeout;

// Una lista de frecuencias bajas y medias muy relajantes (Escala de C Mayor Pentatónica)
const frecuenciasRelajantes = [130.81, 146.83, 164.81, 196.00, 220.00, 261.63, 293.66, 329.63, 392.00, 440.00];

function obtenerFrecuenciaPorScroll(progreso) {
    // Mapeamos el progreso del scroll (0 a 1) al índice del arreglo de frecuencias
    const indice = Math.floor(progreso * (frecuenciasRelajantes.length - 1));
    return frecuenciasRelajantes[indice];
}

