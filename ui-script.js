// ==========================================================================
// MOTOR CINÉTICO EXPERIMENTAL - CATAPULTAZO
// ==========================================================================

const canvas = document.getElementById("tablero-experimental");
const ctx = canvas ? canvas.getContext("2d") : null;
const contadorImpactos = document.getElementById("contador-impactos");
const estadoSistema = document.getElementById("estado-sistema");

// --- CONFIGURACIÓN DINÁMICA DEL ENTORNO ---
let anchoPantalla = window.innerWidth;
let alturaPantalla = window.innerHeight;
let impactosTotales = 0;

if (canvas && ctx) {
    canvas.width = anchoPantalla;
    canvas.height = alturaPantalla;
}

// Redimensionamiento elástico del espacio gráfico
window.addEventListener("resize", () => {
    if (!canvas) return;
    anchoPantalla = window.innerWidth;
    alturaPantalla = window.innerHeight;
    canvas.width = anchoPantalla;
    canvas.height = alturaPantalla;
});

// --- ENTIDADES DEL SISTEMA (ABSTRACCIÓN DE ELEMENTOS DEL JUEGO) ---
// El Peón Lanzable (Representa al Jugador)
const peon = {
    x: 150,
    y: alturaPantalla - 150,
    radio: 42,
    color: "#e71d84", // Fucsia Oficial
    vx: 0,
    vy: 0,
    friccion: 0.98,
    gravedad: 0.25,
    origenX: 150,
    origenY: alturaPantalla - 150,
    enLanzamiento: false,
    siendoArrastrado: false
};

const objetivos = [
    // 👈 Aumenta los radios de tus casillas/objetivos para que ocupen más espacio visual
    { x: anchoPantalla * 0.6, y: alturaPantalla * 0.3, radio: 80, color: "#c3d208", activo: true }, 
    { x: anchoPantalla * 0.75, y: alturaPantalla * 0.55, radio: 65, color: "#b8b1d8", activo: true }, 
    { x: anchoPantalla * 0.5, y: alturaPantalla * 0.7, radio: 90, color: "#c3d208", activo: true }
];

// Variables del estado del Mouse/Interactividad
let mouseX = 0;
let mouseY = 0;

// ==========================================
// DETECCIÓN DE ENTRADA DISPOSITIVO (MOUSE & CAPTURA)
// ==========================================
function calcularDistancia(x1, y1, x2, y2) {
    return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
}

canvas.addEventListener("mousedown", (e) => {
    const rect = canvas.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = (e.clientY - rect.top); 

    // Si el usuario hace clic dentro de la masa física del peón, se inicia la carga de energía
    if (calcularDistancia(clickX, clickY, peon.x, peon.y) < peon.radio && !peon.enLanzamiento) {
        peon.siendoArrastrado = true;
        // ...
    }
});

canvas.addEventListener("mousemove", (e) => {
    const rect = canvas.getBoundingClientRect();
    mouseX = e.clientX - rect.left;
    mouseY = e.clientY - rect.top;

    // Si está arrastrando, limitamos la elongación de la resortera táctil
    if (peon.siendoArrastrado) {
        const distanciaTension = calcularDistancia(mouseX, mouseY, peon.origenX, peon.origenY);
        const maxTension = 150; // Umbral límite de fuerza de la catapulta

        if (distanciaTension < maxTension) {
            peon.x = mouseX;
            peon.y = mouseY;
        } else {
            // Trigonometría analítica para mantener el vector bloqueado en el perímetro límite
            const angulo = Math.atan2(mouseY - peon.origenY, mouseX - peon.origenX);
            peon.x = peon.origenX + Math.cos(angulo) * maxTension;
            peon.y = peon.origenY + Math.sin(angulo) * maxTension;
        }
    }
});

canvas.addEventListener("mouseup", () => {
    if (peon.siendoArrastrado) {
        peon.siendoArrastrado = false;
        peon.enLanzamiento = true;

        // Vector inverso de lanzamiento proporcional a la elongación
        peon.vx = (peon.origenX - peon.x) * 0.15;
        peon.vy = (peon.origenY - peon.y) * 0.15;

        if (estadoSistema) {
            estadoSistema.textContent = "¡Impulso Liberado!";
        }
    }
});

// ==========================================
// LOOP DE FÍSICAS Y RENDERIZADO (60 FPS)
// ==========================================
function actualizarFisicas() {
    if (peon.enLanzamiento) {
        // Inyección de aceleración gravitatoria y desaceleración por resistencia aerodinámica
        peon.vy += peon.gravedad;
        peon.vx *= peon.friccion;
        peon.vy *= peon.friccion;

        peon.x += peon.vx;
        peon.y += peon.vy;

        // --- SISTEMA DE GESTIÓN DE COLISIONES ---
        objetivos.forEach(target => {
            if (target.activo) {
                const distanciaImpacto = calcularDistancia(peon.x, peon.y, target.x, target.y);
                if (distanciaImpacto < peon.radio + target.radio) {
                    // Colisión detectada con éxito
                    target.activo = false;
                    impactosTotales++;
                    if (contadorImpactos) contadorImpactos.textContent = impactosTotales;
                    
                    // Pequeña explosión de fuerza inversa tras el impacto
                    peon.vx *= -0.5;
                    peon.vy *= -0.5;

                    // Regeneración programada del objetivo tras 2 segundos
                    setTimeout(() => { target.activo = true; }, 2000);
                }
            }
        });

        // --- MECÁNICA DE CAÍDA Y REINICIO (REGLA FUNDAMENTAL DE CATAPULTAZO) ---
        // Si el peón supera las fronteras visuales del tablero, cae al vacío y reinicia
        if (peon.x - peon.radio > anchoPantalla || peon.y - peon.radio > alturaPantalla || peon.x + peon.radio < 0) {
            reiniciarPeon("¡Caída del Tablero! Reiniciando...");
        }
    }
}

function reiniciarPeon(mensajeEstado) {
    peon.x = peon.origenX;
    peon.y = peon.origenY;
    peon.vx = 0;
    peon.vy = 0;
    peon.enLanzamiento = false;
    if (estadoSistema) {
        estadoSistema.textContent = mensajeEstado;
        estadoSistema.className = "txt-normal";
        setTimeout(() => {
            if(!peon.enLanzamiento && !peon.siendoArrastrado) estadoSistema.textContent = "Estable";
        }, 2000);
    }
}

function renderizarTablero() {
    if (!ctx) return;
    
    // Limpieza de buffer
    ctx.clearRect(0, 0, anchoPantalla, alturaPantalla);

    // Dibuja el Vector de Dirección / Guía de Trayectoria (Línea Elástica de Tensión)
    if (peon.siendoArrastrado) {
        ctx.beginPath();
        ctx.moveTo(peon.origenX, peon.origenY);
        ctx.lineTo(peon.x, peon.y);
        ctx.strokeStyle = "#b8b1d8"; // Violeta Oficial
        ctx.lineWidth = 3;
        ctx.setLineDash([5, 5]); // Línea segmentada experimental
        ctx.stroke();
        ctx.setLineDash([]); // Reset estilo de línea
    }

    // Dibuja la Zona de Base / Lanzadera Fija
    ctx.beginPath();
    ctx.arc(peon.origenX, peon.origenY, peon.radio * 1.5, 0, Math.PI * 2);
    ctx.strokeStyle = "rgba(255, 255, 255, 0.1)";
    ctx.lineWidth = 2;
    ctx.stroke();

    // Dibuja los Objetivos Activos
    objetivos.forEach(target => {
        if (target.activo) {
            ctx.beginPath();
            ctx.arc(target.x, target.y, target.radio, 0, Math.PI * 2);
            ctx.fillStyle = target.color;
            ctx.shadowBlur = 15;
            ctx.shadowColor = target.color;
            ctx.fill();
            ctx.shadowBlur = 0; // Reset sombra
        }
    });

    // Dibuja al Peón Principal del Jugador
    ctx.beginPath();
    ctx.arc(peon.x, peon.y, peon.radio, 0, Math.PI * 2);
    ctx.fillStyle = peon.color;
    ctx.fill();
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 2;
    ctx.stroke();
}

// Bucle Continuo Integrado
function loop() {
    actualizarFisicas();
    renderizarTablero();
    requestAnimationFrame(loop);
}

// Inicialización del ecosistema
if (canvas && ctx) {
    loop();
}