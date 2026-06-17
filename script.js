// ==========================================================================
// MOTOR DE INTERACCIÓN UNIFICADO - CATAPULTAZO
// ==========================================================================

// --- SELECTORES GLOBALES CONSTANTES ---
const contenedorTexto = document.getElementById("typer");
const botonComenzar = document.getElementById("btn-comenzar");
const navbar = document.getElementById("main-navbar");
const heroSection = document.querySelector(".hero");
const logoNav = document.getElementById("logo-nav");

// --- COMPUERTAS LÓGICAS (ESTADOS) ---
const textoEscribir = "Catapultazo";
let indiceActual = 0;
let ultimaPosicionScroll = 0;
let navegacionPermitida = false; // Bloqueo inicial inmersivo
let isForced = false;             // Bloqueo temporal de 3 segundos del Smart Header


// ==========================================
// 1. EFECTO MÁQUINA DE ESCRIBIR (HERO)
// ==========================================
function escribirLetra() {
    if (indiceActual < textoEscribir.length) {
        if (contenedorTexto) {
            contenedorTexto.textContent += textoEscribir.charAt(indiceActual);
        }
        indiceActual++;
        
        // Ritmo orgánico humano de digitación (Velocidad variable)
        const velocidadFluida = Math.floor(Math.random() * (220 - 120 + 1)) + 120;
        setTimeout(escribirLetra, velocidadFluida);
    } else {
        // Revela el botón de interacción (+) tras 300ms de pausa cinematográfica
        if (botonComenzar) {
            setTimeout(() => {
                botonComenzar.classList.add("mostrar");
            }, 300);
        }
    }
}

// Inicialización controlada del Typewriter
window.addEventListener("DOMContentLoaded", () => {
    setTimeout(escribirLetra, 1000); 
});


// ==========================================
// 2. DISPARADOR DE NAVEGACIÓN (BOTÓN CLIC "+")
// ==========================================
if (botonComenzar) {
    botonComenzar.addEventListener("click", () => {
        navegacionPermitida = true;
        isForced = true;
        
        // Muestra la Navbar de forma forzada inmediatamente
        if (navbar) navbar.classList.add("activada", "forced-visible");
        
        // Temporizador de 3s de advertencia visual antes de liberar el control inercial
        setTimeout(() => {
            if (navbar) navbar.classList.remove("forced-visible");
            
            // Espera el fin de la transición CSS (400ms) para liberar el motorcinético
            setTimeout(() => {
                isForced = false;
            }, 00);
        }, 3000);
    });
}


// ==========================================
// 3. RESET DE INTERFAZ (LOGOCLIC NAV)
// ==========================================
if (logoNav) {
    logoNav.addEventListener("click", (event) => {
        event.preventDefault(); // Evita el salto nativo brusco del navegador
        
        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });

        // Devuelve la Navbar a su estado oculto original de la portada
        if (navbar) {
            navbar.classList.remove("scroll-arriba", "activada", "forced-visible");
            navbar.classList.add("scroll-abajo");
        }
    });
}


// ==========================================
// 4. MOTOR CENTRALIZADO DE SCROLL (PERFORMANCE OPTIMIZED)
// ==========================================
window.addEventListener("scroll", () => {
    // Si el usuario no ha iniciado la experiencia con (+), congelamos la ejecución
    if (!navegacionPermitida || isForced) return;

    const posicionActualScroll = window.scrollY;

    // --- SUB-MÓDULO A: COMPORTAMIENTO HERO NAVBAR ---
    if (heroSection && navbar) {
        if (posicionActualScroll > 50) {
            heroSection.classList.add("encoger-titulo");
            navbar.classList.add("activada");
        } else {
            heroSection.classList.remove("encoger-titulo");
        }
    }

    // --- SUB-MÓDULO B: DIRECCIÓN DEL SCROLL (SMART NAVBAR) ---
    if (navbar) {
        if (posicionActualScroll <= 80) {
            navbar.classList.remove("scroll-abajo", "scroll-arriba");
        } else if (posicionActualScroll > ultimaPosicionScroll) {
            // Bajando: Ocultar barra (O Revelar según tu diseño, modificado para consistencia con tu CSS)
            navbar.classList.remove("scroll-abajo");
            navbar.classList.add("scroll-arriba");
        } else {
            // Subiendo: Mostrar barra
            navbar.classList.remove("scroll-arriba");
            navbar.classList.add("scroll-abajo");
        }
    }

    // --- SUB-MÓDULO C: SUBRAYADO DINÁMICO (UP & DOWN) ---
    const subrayados = document.querySelectorAll(".subrayado-animado");
    const alturaPantalla = window.innerHeight;
    const puntoInicio = alturaPantalla * 0.85; 
    const puntoFin = alturaPantalla * 0.35;    

    subrayados.forEach(span => {
        const rect = span.getBoundingClientRect();
        
        // Región matemática de progreso (entre 0 y 1)
        let progreso = (puntoInicio - rect.top) / (puntoInicio - puntoFin);
        progreso = Math.max(0, Math.min(1, progreso));

        // Inyección directa de estilos de renderizado
        span.style.backgroundSize = `${progreso * 100}% 100%`;

        // Umbral de contraste tipográfico
        if (progreso > 0.5) {
            span.classList.add("texto-contrastado");
        } else {
            span.classList.remove("texto-contrastado");
        }
    });

    // Actualización del registro histórico de posición
    ultimaPosicionScroll = posicionActualScroll;
});


// ==========================================
// 5. MARQUESINA CINEMÁTICA CON INERCIA (MOUSE MOVE)
// ==========================================
document.addEventListener("DOMContentLoaded", () => {
    // Seleccionamos explícitamente el carrusel móvil ignorando la versión centrada por CSS
    const contenedorGaleria = document.querySelector(".galeria-interactiva-contenedor:not(.version-centrada)");
    
    if (!contenedorGaleria) return;
    
    const tiraImagenes = contenedorGaleria.querySelector(".carrusel-tira-imagenes");
    if (!tiraImagenes) return;

    // Clonación Estructural Segura
    const cartasOriginales = Array.from(tiraImagenes.children);
    
    cartasOriginales.forEach(carta => {
        tiraImagenes.appendChild(carta.cloneNode(true));
    });
    cartasOriginales.reverse().forEach(carta => {
        tiraImagenes.insertBefore(carta.cloneNode(true), tiraImagenes.firstChild);
    });

    // Medidas Matemáticas de la Tira de cartas
    const anchoUnaCarta = 320 + 40; // Ancho + Gap configurado en CSS
    const cantidadOriginales = cartasOriginales.length;
    const anchoOriginalTotal = cantidadOriginales * anchoUnaCarta;

    // Posicionamiento Inicial
    let posicionActualX = -anchoOriginalTotal;
    let posicionDestinoX = -anchoOriginalTotal;
    tiraImagenes.style.transform = `translateX(${posicionActualX}px)`;

    // Registro de coordenadas del Mouse
    contenedorGaleria.addEventListener("mousemove", (e) => {
        const anchoContenedor = contenedorGaleria.offsetWidth;
        const mouseX = e.clientX - contenedorGaleria.getBoundingClientRect().left;
        const porcentajeMouseX = mouseX / anchoContenedor;

        // Vector de velocidad según la cercanía a los bordes de la pantalla
        const velocidad = (porcentajeMouseX - 0.5) * 55; 
        posicionDestinoX -= velocidad;
    });

    // Bucle de Renderizado Fluido (RequestAnimationFrame)
    function animarCarrusel() {
        posicionActualX += (posicionDestinoX - posicionActualX) * 0.1; // Efecto Inercia (Ease)

        // Control de límites del bucle infinito (Fronteras Matemáticas)
        if (posicionActualX <= -(anchoOriginalTotal * 2)) {
            posicionActualX += anchoOriginalTotal;
            posicionDestinoX += anchoOriginalTotal;
        }
        if (posicionActualX >= 0) {
            posicionActualX -= anchoOriginalTotal;
            posicionDestinoX -= anchoOriginalTotal;
        }

        tiraImagenes.style.transform = `translateX(${posicionActualX}px)`;
        requestAnimationFrame(animarCarrusel);
    }

    animarCarrusel();
});


// ==========================================
// 6. CONTROL LIGHTBOX VISOR MODAL
// ==========================================
document.addEventListener("DOMContentLoaded", () => {
    const modal = document.getElementById("modal-visor");
    const imagenGrande = document.getElementById("img-grande");
    const botonCerrar = document.querySelector(".btn-cerrar-modal");
    const imagenesCartas = document.querySelectorAll(".tarjeta-flotante img");

    if (!modal || !imagenGrande || !botonCerrar) return;

    imagenesCartas.forEach(img => {
        img.style.cursor = "zoom-in";
        img.addEventListener("click", () => {
            modal.style.display = "flex";
            imagenGrande.src = img.src;
            imagenGrande.alt = img.alt;
        });
    });

    const cerrarModal = () => {
        modal.style.display = "none";
        imagenGrande.src = "";
    };

    botonCerrar.addEventListener("click", cerrarModal);
    modal.addEventListener("click", (e) => { if (e.target === modal) cerrarModal(); });
    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape" && modal.style.display === "flex") cerrarModal();
    });
});