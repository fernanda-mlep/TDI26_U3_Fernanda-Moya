const canvas = document.getElementById('lienzoCineticos');
const ctx = canvas.getContext('2d');

const COLOR = {
    verde: '#c3d208',
    violeta: '#b8b1d8',
    fucsia: '#e71d84',
    blanco: '#FDFDF8',
    negro: '#181818'
};

function ajustarPantalla() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
window.addEventListener('resize', ajustarPantalla);
ajustarPantalla();

// --- CONFIGURACIÓN DE FÍSICAS ---
const gravedad = 0.2;
const friccion = 0.98;

// --- NODOS CON ESTÉTICA CONSTRUCTIVISTA (Borde cromático, relleno blanco) ---
let nodos = [
    {
        id: "ligero",
        x: 200, y: 300,
        origX: 200, origY: 300,
        vx: 1.5, vy: -1, // Velocidad inicial autónoma
        masa: 1.2, radio: 30,
        colorBorde: COLOR.fucsia,
        enMovimiento: true, activo: false
    },
    {
        id: "pesado",
        x: 400, y: 400,
        origX: 400, origY: 400,
        vx: -0.8, vy: 1.2, // Movimiento autónomo por el lienzo
        masa: 4.5, radio: 60,
        colorBorde: COLOR.violeta,
        enMovimiento: true, activo: false
    }
];

// --- ZONA DE IMPACTO CON VARIABLES DE DEFORMACIÓN ELÁSTICA ---
let zonaDestino = {
    x: canvas.width - 400,
    y: 150,
    anchoBase: 250,
    altoBase: 250,
    ancho: 250, // Dimensiones mutables por el impacto
    alto: 250,
    vxElastica: 0, // Velocidad de oscilación elástica
    vyElastica: 0,
    kElastica: 0.15, // Constante de elasticidad del resorte
    amortiguacion: 0.85 // Disipación de la vibración
};

let nodoSeleccionado = null;
let mouse = { x: 0, y: 0, arrastrando: false };

// --- CAPTURA DE INTERACCIONES (Mecánica de Catapulta) ---
canvas.addEventListener('mousedown', (e) => {
    nodos.forEach(nodo => {
        let d = Math.hypot(e.clientX - nodo.x, e.clientY - nodo.y);
        if (d < nodo.radio) {
            nodoSeleccionado = nodo;
            mouse.arrastrando = true;
            nodo.vx = 0; nodo.vy = 0;
            nodo.enMovimiento = false;
        }
    });
});

canvas.addEventListener('mousemove', (e) => {
    if (mouse.arrastrando && nodoSeleccionado) {
        mouse.x = e.clientX;
        mouse.y = e.clientY;
    }
});

canvas.addEventListener('mouseup', (e) => {
    if (mouse.arrastrando && nodoSeleccionado) {
        mouse.arrastrando = false;
        let dx = nodoSeleccionado.x - e.clientX;
        let dy = nodoSeleccionado.y - e.clientY;
        
        // F = m * a -> Aceleración resultante alterada por la masa
        nodoSeleccionado.vx = (dx * 0.22) / nodoSeleccionado.masa;
        nodoSeleccionado.vy = (dy * 0.22) / nodoSeleccionado.masa;
        nodoSeleccionado.enMovimiento = true;
        nodoSeleccionado = null;
    }
});

// --- MOTOR DE PROCESAMIENTO GRÁFICO ---
function renderMundo() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 1. PROCESAR DEFORMACIÓN ELÁSTICA DEL CONTENEDOR DE DESTINO
    // Ley de Hooke aplicada al ancho y alto: F = -k * x
    let axElastica = -zonaDestino.kElastica * (zonaDestino.ancho - zonaDestino.anchoBase);
    zonaDestino.vxElastica += axElastica;
    zonaDestino.vxElastica *= zonaDestino.amortiguacion;
    zonaDestino.ancho += zonaDestino.vxElastica;

    let ayElastica = -zonaDestino.kElastica * (zonaDestino.alto - zonaDestino.altoBase);
    zonaDestino.vyElastica += ayElastica;
    zonaDestino.vyElastica *= zonaDestino.amortiguacion;
    zonaDestino.alto += zonaDestino.vyElastica;

    // Calcular posición centrada respecto a sus dimensiones mutadas
    let xRender = (canvas.width - 300) - zonaDestino.ancho / 2;
    let yRender = 275 - zonaDestino.alto / 2;

    // Dibujar Zona de Destino
    ctx.strokeStyle = COLOR.blanco;
    ctx.lineWidth = 2;
    ctx.setLineDash([6, 6]);
    ctx.strokeRect(xRender, yRender, zonaDestino.ancho, zonaDestino.alto);
    ctx.setLineDash([]);
    ctx.fillStyle = 'rgba(253, 253, 248, 0.02)';
    ctx.fillRect(xRender, yRender, zonaDestino.ancho, zonaDestino.alto);

    // 2. VECTOR DE PROYECCIÓN DE TRAYECTORIA
    if (mouse.arrastrando && nodoSeleccionado) {
        ctx.beginPath();
        ctx.moveTo(nodoSeleccionado.x, nodoSeleccionado.y);
        let pX = nodoSeleccionado.x + ((nodoSeleccionado.x - mouse.x) * 1.5) / nodoSeleccionado.masa;
        let pY = nodoSeleccionado.y + ((nodoSeleccionado.y - mouse.y) * 1.5) / nodoSeleccionado.masa;
        ctx.lineTo(pX, pY);
        ctx.strokeStyle = COLOR.verde;
        ctx.lineWidth = 3;
        ctx.stroke();
        ctx.closePath();
    }

    // 3. PROCESAR Y DIBUJAR GEOMETRÍAS AUTÓNOMAS
    nodos.forEach(nodo => {
        if (nodo.enMovimiento) {
            // Si el nodo vuela libre, la gravedad lo afecta, si no, mantiene inercia autónoma
            if (nodo.vx > 2 || nodo.vy > 2 || nodo.vy < -2) {
                nodo.vy += gravedad;
            }
            nodo.vx *= friccion;
            nodo.vy *= friccion;

            nodo.x += nodo.vx;
            nodo.y += nodo.vy;

            // DETECCIÓN DE COLISIÓN (Impacto sobre la caja elástica)
            if (nodo.x + nodo.radio > xRender && nodo.x - nodo.radio < xRender + zonaDestino.ancho &&
                nodo.y + nodo.radio > yRender && nodo.y - nodo.radio < yRender + zonaDestino.alto) {
                
                // Transferencia de energía del nodo a la elasticidad de la caja
                zonaDestino.vxElastica = nodo.vx * 3;
                zonaDestino.vyElastica = nodo.vy * 3;

                nodo.vx *= -0.4; // Rebote mecánico amortiguado
                nodo.vy *= -0.4;
                nodo.activo = true;
            }

            // DETECCIÓN DE CAÍDA (Reinicio de posición si sale del Viewport)
            if (nodo.y - nodo.radio > canvas.height || nodo.x - nodo.radio > canvas.width || nodo.x + nodo.radio < 0) {
                nodo.x = nodo.origX;
                nodo.y = nodo.origY;
                nodo.vx = (Math.random() - 0.5) * 3; // Re-impulso autónomo sutil
                nodo.vy = (Math.random() - 0.5) * 3;
                nodo.activo = false;
            }
        }

        // DIBUJO CON ESTÉTICA DE REFERENTES (Desfase gráfico constructivista)
        // Borde exterior desfasado 4px para emular el desfase de impresión del diseño analógico
        ctx.beginPath();
        ctx.arc(nodo.x + 4, nodo.y + 4, nodo.radio, 0, Math.PI * 2);
        ctx.strokeStyle = nodo.activo ? COLOR.verde : nodo.colorBorde;
        ctx.lineWidth = 6; // Trazo grueso rígido inspirado en el trabajo de Ben Bos
        ctx.stroke();
        ctx.closePath();

        // Relleno Blanco Sólido superpuesto
        ctx.beginPath();
        ctx.arc(nodo.x, nodo.y, nodo.radio, 0, Math.PI * 2);
        ctx.fillStyle = COLOR.blanco;
        ctx.fill();
        ctx.closePath();
    });

    requestAnimationFrame(renderMundo);
}

renderMundo();