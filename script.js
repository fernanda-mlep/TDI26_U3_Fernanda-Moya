// ==========================================================================
// MOTOR DE INTERACCIÓN UNIFICADO - CATAPULTAZO
// ==========================================================================

// --- SELECTORES GLOBALES CONSTANTES ---
const navbar = document.getElementById("main-navbar");
const heroSection = document.querySelector(".hero");
const logoNav = document.getElementById("logo-nav");

// --- COMPUERTAS LÓGICAS (ESTADOS) ---
let ultimaPosicionScroll = 0;
let navegacionPermitida = false; // Bloqueo inicial inmersivo durante la animación
let isForced = false;             // Bloqueo temporal de 3 segundos del Smart Header


// ==========================================
// 1. ANIMACIÓN DE LOGOS/PICTOGRAMAS (PRECARGA AL CARGAR RECURSOS)
// ==========================================
// ==========================================
// 1. ANIMACIÓN DE LOGOS/PICTOGRAMAS (PRECARGA AL CARGAR RECURSOS - 2s TOTAL)
// ==========================================
function iniciarPreloader() {
    const contenedorPictos = document.getElementById("secuencia-pictogramas");
    const tituloHero = document.getElementById("titulo-hero");
    
    if (!contenedorPictos) return;
    const arrayPictos = contenedorPictos.querySelectorAll(".picto-animado");
    
    let pictoActual = 0;
    // 500ms por pictograma × 4 imágenes = 2 segundos de precarga en total
    const intervaloAnimacion = 500; 

    const cicloPictos = setInterval(() => {
        // Quitamos el estado activo al pictograma anterior
        arrayPictos[pictoActual].classList.remove("activo");
        
        pictoActual++;
        
        if (pictoActual < arrayPictos.length) {
            // Encendemos el siguiente pictograma
            arrayPictos[pictoActual].classList.add("activo");
        } else {
            // Detenemos el intervalo cuando ya se mostraron los 4
            clearInterval(cicloPictos);
            
            // Ocultamos el contenedor de pictogramas por completo
            contenedorPictos.style.display = "none";
            
            // DISPARO DE APERTURA AUTOMÁTICA DE LANDING
            activarAperturaLanding(tituloHero);
        }
    }, intervaloAnimacion);
}

// Ejecutamos cuando todo esté cargado en el navegador (incluyendo las imágenes)
if (document.readyState === "complete") {
    iniciarPreloader();
} else {
    window.addEventListener("load", iniciarPreloader);
}


// ==========================================
// 2. DISPARADOR AUTOMÁTICO DE NAVEGACIÓN Y TRANSICIÓN (SCROLL AUTOMÁTICO)
// ==========================================
function activarAperturaLanding(titulo) {
    // 1. Revelamos el título principal
    if (titulo) {
        titulo.classList.remove("oculto");
        titulo.classList.add("visible");
    }

    // 2. Transición automática tras mostrar el título 1.5 segundos
    setTimeout(() => {
        // Habilitamos el scroll del body
        document.body.style.overflow = "auto";
        navegacionPermitida = true;
        isForced = false;

        // Desplazamiento automático suave a la siguiente sección
        const siguienteSeccion = document.getElementById("marquesina-introduccion");
        if (siguienteSeccion) {
            siguienteSeccion.scrollIntoView({ behavior: "smooth" });
        }
    }, 1500); 
}
    // 4. Abrimos las compuertas lógicas de interacción inmediatamente
    navegacionPermitida = true;
    isForced = false; 
    
    // 🚨 ELIMINADO: Se removió el bloque de código que forzaba a la navbar a mostrarse
    // automáticamente con "forced-visible" al cargar.
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
    // Si el usuario no ha completado la precarga, congelamos la ejecución
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
            navbar.classList.remove("scroll-abajo");
            navbar.classList.add("scroll-arriba");
        } else {
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
        
        let progreso = (puntoInicio - rect.top) / (puntoInicio - puntoFin);
        progreso = Math.max(0, Math.min(1, progreso));

        span.style.backgroundSize = `${progreso * 100}% 100%`;

        if (progreso > 0.5) {
            span.classList.add("texto-contrastado");
        } else {
            span.classList.remove("texto-contrastado");
        }
    });

    ultimaPosicionScroll = posicionActualScroll;
});


// ==========================================
// 5. MARQUESINA CINEMÁTICA CON INERCIA (MOUSE MOVE - IMÁGENES)
// ==========================================
document.addEventListener("DOMContentLoaded", () => {
    const contenedorGaleria = document.querySelector(".galeria-interactiva-contenedor:not(.version-centrada)");
    if (!contenedorGaleria) return;
    
    const tiraImagenes = contenedorGaleria.querySelector(".carrusel-tira-imagenes");
    if (!tiraImagenes) return;

    const cartasOriginales = Array.from(tiraImagenes.children);
    
    cartasOriginales.forEach(carta => {
        tiraImagenes.appendChild(carta.cloneNode(true));
    });
    cartasOriginales.reverse().forEach(carta => {
        tiraImagenes.insertBefore(carta.cloneNode(true), tiraImagenes.firstChild);
    });

    const anchoUnaCarta = 320 + 40; 
    const cantidadOriginales = cartasOriginales.length;
    const anchoOriginalTotal = cantidadOriginales * anchoUnaCarta;

    let posicionActualX = -anchoOriginalTotal;
    let posicionDestinoX = -anchoOriginalTotal;
    tiraImagenes.style.transform = `translateX(${posicionActualX}px)`;

    contenedorGaleria.addEventListener("mousemove", (e) => {
        const anchoContenedor = contenedorGaleria.offsetWidth;
        const mouseX = e.clientX - contenedorGaleria.getBoundingClientRect().left;
        const porcentajeMouseX = mouseX / anchoContenedor;

        const velocidad = (porcentajeMouseX - 0.5) * 55; 
        posicionDestinoX -= velocidad;
    });

    function animarCarrusel() {
        posicionActualX += (posicionDestinoX - posicionActualX) * 0.1; 

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


// ==========================================
// 7. MOTOR CINEMÁTICO: MARQUESINA DE TEXTO INTERACTIVA POR DETECCIÓN DE CURSOR
// ==========================================
document.addEventListener("DOMContentLoaded", () => {
    const contenedorMarquesina = document.getElementById("marquesina-introduccion");
    if (!contenedorMarquesina) return;

    const cintaTexto = contenedorMarquesina.querySelector(".marquesina-texto-cinta");
    if (!cintaTexto) return;

    let posicionX = 0;
    let velocidadActual = -2; // Velocidad base por defecto (movimiento continuo inicial)
    let velocidadDestino = -2;

    const mitadAnchoCinta = cintaTexto.offsetWidth / 2;

    // Escuchador dinámico sobre el contenedor de la marquesina de texto
    contenedorMarquesina.addEventListener("mousemove", (e) => {
        const anchoVentana = window.innerWidth;
        const mouseX = e.clientX; 

        // Posición normalizada respecto al centro de la pantalla (rango de -0.5 a 0.5)
        const posicionRelativaCentro = (mouseX / anchoVentana) - 0.5;

        if (posicionRelativaCentro > 0) {
            // Mitad Derecha: Desplazamiento acelerado hacia la izquierda (valores negativos de transformación)
            velocidadDestino = -4 - (posicionRelativaCentro * 25);
        } else {
            // Mitad Izquierda: Desplazamiento invertido acelerado hacia la derecha (valores positivos)
            velocidadDestino = 4 - (posicionRelativaCentro * 25);
        }
    });

    // Restauración de velocidad constante base al retirar el mouse de la zona activa
    contenedorMarquesina.addEventListener("mouseleave", () => {
        velocidadDestino = -2; 
    });

    // Bucle continuo a 60fps independientes del CSS
    function animarMarquesinaTexto() {
        // Interpolación lineal (Efecto inercia / Suavizado cinético)
        velocidadActual += (velocidadDestino - velocidadActual) * 0.08;
        posicionX += velocidadActual;

        // Bucle estructural infinito (Reinicio invisible antes de que termine el bloque espejo)
        if (posicionX <= -mitadAnchoCinta) {
            posicionX = 0;
        }
        if (posicionX > 0) {
            posicionX = -mitadAnchoCinta;
        }

        cintaTexto.style.transform = `translateX(${posicionX}px)`;
        requestAnimationFrame(animarMarquesinaTexto);
    }

    animarMarquesinaTexto();
});