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
    
    // Activa la cabecera visible de forma forzada inmediatamente
    navbar.classList.add("activada", "forced-visible");
    
    // Temporizador de 3 segundos antes de liberar el control cinético normal
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
    // Seleccionamos la sección hero para poder cambiar su estado visual
    const heroSection = document.querySelector(".hero");

    // 📐 INTERACCIÓN HERO -> NAVBAR: Al bajar los primeros 50px se encoge el título del Hero
    if (posicionActualScroll > 50) {
        heroSection.classList.add("encoger-titulo");
        navbar.classList.add("activada"); // Asegura que la navbar ya tenga permitido mostrarse
    } else {
        heroSection.classList.remove("encoger-titulo");
    }

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


// ==========================================
// 3. CONTROL VINCULADO: SUBRAYADO DINÁMICO (UP & DOWN)
// ==========================================
/* 🚨 EDICIÓN: Se eliminó el antiguo IntersectionObserver fijo y se reemplazó
   por este motor matemático que escucha el scroll en vivo dentro del viewport */
window.addEventListener("scroll", () => {
    // Si la navegación inicial no está permitida por el botón (+), congelamos la ejecución
    if (!navegacionPermitida) return;

    const subrayados = document.querySelectorAll(".subrayado-animado");
    
    subrayados.forEach(span => {
        // Medimos la ubicación exacta del fragmento de texto respecto al monitor
        const rect = span.getBoundingClientRect();
        const alturaPantalla = window.innerHeight;

        // 📐 Rangos de activación visual:
        const puntoInicio = alturaPantalla * 0.85; // Comienza a pintarse al llegar al 85% inferior
        const puntoFin = alturaPantalla * 0.35;    // Termina de llenarse al llegar al 35% superior

        // Calculamos el porcentaje de avance (región matemática entre 0 y 1)
        let progreso = (puntoInicio - rect.top) / (puntoInicio - puntoFin);
        progreso = Math.max(0, Math.min(1, progreso));

        // Inyectamos el estilo dinámico de forma directa en el atributo style del HTML
        span.style.backgroundSize = `${progreso * 100}% 100%`;

        // Si el resaltador cubrió más de la mitad de la palabra, forzamos el cambio de contraste
        if (progreso > 0.5) {
            span.classList.add("texto-contrastado");
        } else {
            span.classList.remove("texto-contrastado");
        }
    });
});


// ==========================================
// 4. MOTOR CINEMÁTICO: CARRUSEL INFINITO ESTILO MARQUESINA (MOUSE MOVE)
// ==========================================
document.addEventListener("DOMContentLoaded", () => {
    const contenedorGaleria = document.querySelector(".galeria-interactiva-contenedor");
    const tiraImagenes = document.querySelector(".carrusel-tira-imagenes");

    if (!contenedorGaleria || !tiraImagenes) return;

    // 1. CLONACIÓN STRUCTURAL: Clonamos las cartas para rellenar los extremos falsos
    const cartasOriginales = Array.from(tiraImagenes.children);
    
    // Clonamos al final
    cartasOriginales.forEach(carta => {
        const clon = carta.cloneNode(true);
        tiraImagenes.appendChild(clon);
    });
    // Clonamos al inicio (para cuando muevan el mouse al revés)
    cartasOriginales.reverse().forEach(carta => {
        const clon = carta.cloneNode(true);
        tiraImagenes.insertBefore(clon, tiraImagenes.firstChild);
    });

    // 2. CÁLCULO DE MEDIDAS MATEMÁTICAS
    // Cada carta mide 320px + 40px de gap = 360px de bloque total
    const anchoUnaCarta = 320 + 40; 
    const cantidadOriginales = cartasOriginales.length;
    
    // El "ancho real" es lo que miden las cartas antes de ser clonadas
    const anchoOriginalTotal = cantidadOriginales * anchoUnaCarta;

    // Posición inicial: Desplazamos la tira exactamente el ancho de los clones iniciales
    let posicionActualX = -anchoOriginalTotal;
    tiraImagenes.style.transform = `translateX(${posicionActualX}px)`;

    // Variables para suavizar el movimiento (Efecto Inercia/Ease)
    let posicionDestinoX = -anchoOriginalTotal;
    
    contenedorGaleria.addEventListener("mousemove", (e) => {
        const anchoContenedor = contenedorGaleria.offsetWidth;
        
        // Posición del mouse de 0 a 1
        const mouseX = e.clientX - contenedorGaleria.getBoundingClientRect().left;
        const porcentajeMouseX = mouseX / anchoContenedor;

        // Factor de velocidad: Mientras más al borde esté el mouse, más rápido corre la marquesina
        // Centro (0.5) = Quieto. Extremo derecho (1) = Camina a la izquierda. Extremo izquierdo (0) = Camina a la derecha.
        const velocidad = (porcentajeMouseX - 0.5) * 55; 
        
        // Restamos la velocidad para actualizar el destino
        posicionDestinoX -= velocidad;
    });

    // 3. BUCLE DE RENDERIZADO (Animación fluida cuadro por cuadro)
    function animarCarrusel() {
        // Suavizado cinético (Interpolación lineal)
        posicionActualX += (posicionDestinoX - posicionActualX) * 0.1;

        // 🚨 EL TRUCO INVISIBLE: Control de fronteras matemáticas
        // Si caminó tanto a la izquierda que pasó el set original, reseteamos al centro
        if (posicionActualX <= -(anchoOriginalTotal * 2)) {
            posicionActualX += anchoOriginalTotal;
            posicionDestinoX += anchoOriginalTotal;
        }
        // Si caminó tanto a la derecha que se iba a acabar, saltamos al set clonado
        if (posicionActualX >= 0) {
            posicionActualX -= anchoOriginalTotal;
            posicionDestinoX -= anchoOriginalTotal;
        }

        // Aplicamos el movimiento en la pantalla
        tiraImagenes.style.transform = `translateX(${posicionActualX}px)`;

        // Volvemos a ejecutar en el siguiente cuadro de la pantalla (60fps / 120fps)
        requestAnimationFrame(animarCarrusel);
    }

    // Encendemos el motor de renderizado
    animarCarrusel();
});


// ==========================================
// 🚨 5. INTERACCIÓN LIGHTBOX: AMPLIAR IMÁGENES AL HACER CLICK
// ==========================================
document.addEventListener("DOMContentLoaded", () => {
    const modal = document.getElementById("modal-visor");
    const imagenGrande = document.getElementById("img-grande");
    const botonCerrar = document.querySelector(".btn-cerrar-modal");
    
    // Selecciona todas las imágenes de las cartas que viven en las tarjetas flotantes
    const imagenesCartas = document.querySelectorAll(".tarjeta-flotante img");

    if (!modal || !imagenGrande || !botonCerrar) return;

    // 1. Escuchar el click en cada carta para clonarla en el visor gigante
    imagenesCartas.forEach(img => {
        img.style.cursor = "zoom-in"; // Cambia el cursor para avisar la acción

        img.addEventListener("click", () => {
            modal.style.display = "flex";
            imagenGrande.src = img.src; // Pasa la ruta de la carta clickeada
            imagenGrande.alt = img.alt;
        });
    });

    // 2. Función unificada para cerrar la vista ampliada
    const cerrarModal = () => {
        modal.style.display = "none";
        imagenGrande.src = ""; // Limpia la memoria del visor
    };

    // Cerrar al pulsar el botón X
    botonCerrar.addEventListener("click", cerrarModal);

    // Cerrar de forma intuitiva haciendo click en el espacio oscuro de fondo
    modal.addEventListener("click", (e) => {
        if (e.target === modal) {
            cerrarModal();
        }
    });

    // Cerrar mediante la tecla física de Escape (ESC)
    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape" && modal.style.display === "flex") {
            cerrarModal();
        }
    });
});

