// ==========================================
// 1. CONFIGURACIÓN DEL EFECTO MÁQUINA DE ESCRIBIR
// ==========================================
const textoEscribir = "Catapultazo";
let indiceActual = 0;

const contenedorTexto = document.getElementById("typer");
const boton = document.getElementById("btn-comenzar");

function escribirLetra() {
    if (indiceActual < textoEscribir.length) {
        contenedorTexto.textContent += textoEscribir.charAt(indiceActual);
        indiceActual++;
        
        // Genera una velocidad variable para emular un ritmo orgánico de digitación
        const velocidadFluida = Math.floor(Math.random() * (220 - 120 + 1)) + 120;
        setTimeout(escribirLetra, velocidadFluida);
    } else {
        // Muestra el punto de interacción principal (+) tras una pausa de 300ms
        setTimeout(() => {
            boton.classList.add("mostrar");
        }, 300); 
    }
}

// Inicialización de la animación tras la carga estructural de la página
window.addEventListener("DOMContentLoaded", () => {
    setTimeout(escribirLetra, 1000); 
});


// ==========================================
// 2. CONTROL UNIFICADO DE INTERACCIÓN DE SCROLL (SMART HEADER)
// ==========================================
const navbar = document.getElementById("main-navbar");
let ultimaPosicionScroll = 0; // Registro histórico del scroll previo
let navegacionPermitida = false; // Compuerta lógica: Bloquea el menú al inicio
let isForced = false; // 🚨 Nueva compuerta: Bloquea el scroll durante el aviso de 3s

// Escucha el clic en el botón "+" para dar de alta la navegación
boton.addEventListener("click", () => {
    navegacionPermitida = true;
    isForced = true;
    
    // 🚨 Activa la cabecera visible de forma forzada inmediatamente
    navbar.classList.add("activada", "forced-visible");
    
    // 🚨 Temporizador de 3 segundos antes de liberar el control cinético normal
    setTimeout(() => {
        navbar.classList.remove("forced-visible");
        
        // Espera a que termine la animación física CSS para habilitar el motor de scroll
        setTimeout(() => {
            isForced = false;
        }, 400);
    }, 3000);
});

window.addEventListener("scroll", () => {
    // Si no se ha presionado el botón "+", el código se detiene aquí y protege la inmersión
    if (!navegacionPermitida) return;
    
    // 🚨 Si la cabecera está en la muestra forzada de 3s, congela las evaluaciones de scroll
    if (isForced) return;

    const posicionActualScroll = window.scrollY;

    // Umbral de tolerancia superior (primeros 80px de la página)
    if (posicionActualScroll <= 80) {
        navbar.classList.remove("scroll-abajo", "scroll-arriba");
        ultimaPosicionScroll = posicionActualScroll;
        return; 
    }

    // Evaluación matemática del vector de movimiento (Dirección del scroll)
    if (posicionActualScroll > ultimaPosicionScroll) {
        // El usuario baja: Ocultar barra fucsia
        navbar.classList.remove("scroll-arriba");
        navbar.classList.add("scroll-abajo");
    } else {
        // El usuario sube: Revelar barra fucsia
        navbar.classList.remove("scroll-abajo");
        navbar.classList.add("scroll-arriba");
    }

    // Actualización del punto de referencia para el siguiente cuadro de renderizado
    ultimaPosicionScroll = posicionActualScroll;
});