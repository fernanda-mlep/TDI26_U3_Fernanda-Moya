// Captura del canvas y su contexto bidimensional para operaciones de renderizado continuo
const canvas = document.getElementById('lienzoCineticos');
const ctx = canvas.getContext('2d');

// Paleta cromática del sistema para la retroalimentación de estados físicos
const COLOR = {
    verde: '#c3d208',
    violeta: '#b8b1d8',
    fucsia: '#e71d84',
    blanco: '#FDFDF8',
    negro: '#181818'
};

// Ajuste dinámico del área de cálculo para mantener la precisión matemática en relación al viewport
function redimensionar() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
window.addEventListener('resize', redimensionar);
redimensionar();

// --- VARIABLES DEL ENTORNO CINÉTICO ---
const gravedad = 0.25;          // Aceleración constante hacia el límite inferior del tablero
const friccionSuperficie = 0.97; // Coeficiente que absorbe la energía cinética de los cuerpos

// --- ARQUITECTURA DE INFORMACIÓN COMO CUERPOS FÍSICOS (MASA DIFERENCIADA) ---
let nodosContenido = [
    {
        id: "portfolio",
        x: 150,
        y: canvas.height - 150,
        origX: 150,
        origY: canvas.height - 150,
        vx: 0,
        vy: 0,
        masa: 1.2,        // Masa baja: alta aceleración ante impulsos mínimos (Riesgo de desborde)
        radio: 25,        // Escala geométrica reducida
        color: COLOR.fucsia,
        activo: false,
        enMovimiento: false
    },
    {
        id: "contacto",
        x: 300,
        y: canvas.height - 150,
        origX: 300,
        origY: canvas.height - 150,
        vx: 0,
        vy: 0,
        masa: 5.5,        // Masa alta: requiere un vector de fuerza drásticamente superior
        radio: 55,        // Relación espacial macro para comunicar jerarquía física de almacenamiento
        color: COLOR.violeta,
        activo: false,
        enMovimiento: false
    }
];

// Contenedor Receptor (Zona activa que absorbe los nodos)
let zonaDestino = {
    x: canvas.width - 350,
    y: 100,
    ancho: 280,
    alto: 280
};

let nodoSeleccionado = null;
let mouse = { x: 0, y: 0, arrastrando: false };

// --- GESTIÓN DE ENERGÍA E INPUT DEL USUARIO (MECÁNICA DE CATAPULTA) ---
canvas.addEventListener('mousedown', (e) => {
    nodosContenido.forEach(nodo => {
        if (!nodo.enMovimiento) {
            // Cálculo de distancia euclidiana para determinar colisión con el cursor
            let distancia = Math.hypot(e.clientX - nodo.x, e.clientY - nodo.y);
            if (distancia < nodo.radio) {
                nodoSeleccionado = nodo;
                mouse.arrastrando = true;
                actualizarTelemetria("Tensión", COLOR.verde);
            }
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
        
        // El vector se calcula de forma inversa al arrastre para emular la tensión elástica
        let dx = nodoSeleccionado.x - e.clientX;
        let dy = nodoSeleccionado.y - e.clientY;
        
        // TRADUCCIÓN FÍSICA: La fuerza resultante se divide por la masa del objeto (a = F / m)
        nodoSeleccionado.vx = (dx * 0.25) / nodoSeleccionado.mass || (dx * 0.25) / nodoSeleccionado.masa;
        nodoSeleccionado.vy = (dy * 0.25) / nodoSeleccionado.mass || (dy * 0.25) / nodoSeleccionado.masa;
        
        nodoSeleccionado.enMovimiento = true;
        nodoSeleccionado = null;
        actualizarTelemetria("Lanzamiento", COLOR.fucsia);
    }
});

// Función de comunicación para el panel de información técnica
function actualizarTelemetria(estado, color) {
    const elEstado = document.getElementById('val-estado');
    if (elEstado) {
        elEstado.innerText = estado;
        elEstado.style.color = color;
    }
}

// --- BUCLE DE PROCESAMIENTO GRÁFICO (60 FPS) ---
function bucleFisico() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 1. Renderizado de la Zona de Destino Estructural (Tablero Receptor)
    ctx.strokeStyle = COLOR.blanco;
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 4]); // Línea discontinua para construir relaciones espaciales cartográficas
    ctx.strokeRect(zonaDestino.x, zonaDestino.y, zonaDestino.ancho, zonaDestino.alto);
    ctx.setLineDash([]);
    
    ctx.fillStyle = 'rgba(253, 253, 248, 0.03)'; // Opacidad mínima para conservar el contraste del fondo
    ctx.fillRect(zonaDestino.x, zonaDestino.y, zonaDestino.ancho, zonaDestino.alto);

    // 2. Proyección de Trayectoria Predictiva
    if (mouse.arrastrando && nodoSeleccionado) {
        ctx.beginPath();
        ctx.moveTo(nodoSeleccionado.x, nodoSeleccionado.y);
        // Modulación visual del vector predictivo alterado por la resistencia de masa
        let fX = nodoSeleccionado.x + ((nodoSeleccionado.x - mouse.x) * 1.5) / nodoSeleccionado.masa;
        let fY = nodoSeleccionado.y + ((nodoSeleccionado.y - mouse.y) * 1.5) / nodoSeleccionado.masa;
        ctx.lineTo(fX, fY);
        ctx.strokeStyle = COLOR.verde;
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.closePath();
    }

    // 3. Procesamiento y Renderizado de Cuerpos Dinámicos
    nodosContenido.forEach(nodo => {
        if (nodo.enMovimiento) {
            nodo.vy += gravedad;           // Aplicación de aceleración vertical
            nodo.vx *= friccionSuperficie; // Disipación constante de fuerza horizontal
            nodo.vy *= friccionSuperficie; // Disipación constante de fuerza vertical

            nodo.x += nodo.vx;             // Mutación de coordenada espacial X
            nodo.y += nodo.vy;             // Mutación de coordenada espacial Y

            // Detección de Colisión e Impacto en la Zona de Destino (AABB simplificado)
            if (nodo.x + nodo.radio > zonaDestino.x && 
                nodo.x - nodo.radio < zonaDestino.x + zonaDestino.ancho &&
                nodo.y + nodo.radio > zonaDestino.y && 
                nodo.y - nodo.radio < zonaDestino.y + zonaDestino.alto) {
                
                // Absorción Cinética: fricción masiva instantánea para atrapar el nodo
                nodo.vx *= 0.1;
                nodo.vy *= 0.1;
                
                if (!nodo.activo) {
                    nodo.activo = true;
                }
            }

            // Detección de Caída fuera del Tablero (Error y Reinicio)
            if (nodo.y - nodo.radio > canvas.height || 
                nodo.x - nodo.radio > canvas.width || 
                nodo.x + nodo.radio < 0) {
                
                // Reinicio inmediato del estado del nodo desbordado
                nodo.x = nodo.origX;
                nodo.y = nodo.origY;
                nodo.vx = 0;
                nodo.vy = 0;
                nodo.enMovimiento = false;
                nodo.activo = false;
                actualizarTelemetria("Caída / Reinicio", COLOR.fucsia);
            }
        }

        // Dibujo geométrico del nodo en el lienzo
        ctx.beginPath();
        ctx.arc(nodo.x, nodo.y, nodo.radio, 0, Math.PI * 2);
        // El color Verde (#c3d208) comunica de manera objetiva el anclaje y activación exitosa
        ctx.fillStyle = nodo.activo ? COLOR.verde : nodo.color;
        ctx.fill();
        ctx.closePath();
    });

    requestAnimationFrame(bucleFisico);
}

// Inicialización del motor gráfico
bucleFisico();