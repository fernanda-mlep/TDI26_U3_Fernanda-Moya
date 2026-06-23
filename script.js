// ─── SELECTORES ─────────────────────────────────────
const navbar             = document.getElementById("main-navbar");
const preloaderContainer = document.getElementById("preloader-container");
const tituloHero         = document.getElementById("titulo-hero");
const logoNav            = document.querySelector(".navbar-logo");
const heroSection        = document.getElementById("preloader-container");

// ─── ESTADO ─────────────────────────────────────────
let ultimaPosicionScroll = 0;
let navegacionPermitida  = false;

// ─── 1. PRELOADER ────────────────────────────────────
function manejarPreloader() {
    if (!preloaderContainer || !tituloHero) return;

    // Muestra el título
    setTimeout(() => {
        tituloHero.classList.remove("oculto");
        tituloHero.classList.add("visible");
    }, 100);

    // Retira el preloader y habilita la página
    setTimeout(() => {
        preloaderContainer.classList.add("retirar-preloader");
        document.body.classList.add("preloader-completado");
        navegacionPermitida = true;

        if (navbar) {
            navbar.classList.add("activada", "scroll-arriba");
        }
    }, 1600);
}

window.addEventListener("load", manejarPreloader);

// ─── 2. LOGO → VOLVER ARRIBA ─────────────────────────
if (logoNav) {
    logoNav.addEventListener("click", (e) => {
        e.preventDefault();
        window.scrollTo({ top: 0, behavior: "smooth" });
        if (navbar) {
            navbar.classList.remove("scroll-arriba", "activada", "forced-visible");
            navbar.classList.add("scroll-abajo");
        }
    });
}

// ─── 3. MOTOR DE SCROLL ──────────────────────────────
window.addEventListener("scroll", () => {
    if (!navegacionPermitida) return;

    const pos = window.scrollY;

    // Navbar hide/show según dirección
    if (navbar) {
        if (pos <= 80) {
            navbar.classList.remove("scroll-abajo", "scroll-arriba");
        } else if (pos > ultimaPosicionScroll) {
            navbar.classList.remove("scroll-arriba");
            navbar.classList.add("scroll-abajo");
        } else {
            navbar.classList.remove("scroll-abajo");
            navbar.classList.add("scroll-arriba");
        }
    }

    // Encoger título hero al hacer scroll
    if (heroSection && navbar && pos > 50) {
        heroSection.classList.add("encoger-titulo");
        navbar.classList.add("activada");
    } else if (heroSection && pos <= 50) {
        heroSection.classList.remove("encoger-titulo");
    }

    // Subrayados animados
    const subrayados   = document.querySelectorAll(".subrayado-animado");
    const h            = window.innerHeight;
    const puntoInicio  = h * 0.85;
    const puntoFin     = h * 0.35;

    subrayados.forEach(span => {
        const rect     = span.getBoundingClientRect();
        let progreso   = (puntoInicio - rect.top) / (puntoInicio - puntoFin);
        progreso       = Math.max(0, Math.min(1, progreso));
        span.style.backgroundSize = `${progreso * 100}% 100%`;
        span.classList.toggle("texto-contrastado", progreso > 0.5);
    });

    ultimaPosicionScroll = pos;
});

// ─── 4. CARRUSEL INTERACTIVO (MOUSE) ─────────────────
document.addEventListener("DOMContentLoaded", () => {
    const contenedorGaleria = document.querySelector(".galeria-interactiva-contenedor:not(.version-centrada)");
    if (!contenedorGaleria) return;

    const tiraImagenes = contenedorGaleria.querySelector(".carrusel-tira-imagenes");
    if (!tiraImagenes) return;

    const cartasOriginales = Array.from(tiraImagenes.children);
    cartasOriginales.forEach(c => tiraImagenes.appendChild(c.cloneNode(true)));
    [...cartasOriginales].reverse().forEach(c => tiraImagenes.insertBefore(c.cloneNode(true), tiraImagenes.firstChild));

    const anchoCarta      = 320 + 40;
    const anchoOriginal   = cartasOriginales.length * anchoCarta;
    let posActualX        = -anchoOriginal;
    let posDestinoX       = -anchoOriginal;
    tiraImagenes.style.transform = `translateX(${posActualX}px)`;

    contenedorGaleria.addEventListener("mousemove", (e) => {
        const rect    = contenedorGaleria.getBoundingClientRect();
        const pct     = (e.clientX - rect.left) / contenedorGaleria.offsetWidth;
        posDestinoX  -= (pct - 0.5) * 55;
    });

    function animarCarrusel() {
        posActualX += (posDestinoX - posActualX) * 0.1;
        if (posActualX <= -(anchoOriginal * 2)) { posActualX += anchoOriginal; posDestinoX += anchoOriginal; }
        if (posActualX >= 0)                    { posActualX -= anchoOriginal; posDestinoX -= anchoOriginal; }
        tiraImagenes.style.transform = `translateX(${posActualX}px)`;
        requestAnimationFrame(animarCarrusel);
    }
    animarCarrusel();
});

// ─── 5. LIGHTBOX MODAL ───────────────────────────────
document.addEventListener("DOMContentLoaded", () => {
    const modal       = document.getElementById("modal-visor");
    const imgGrande   = document.getElementById("img-grande");
    const btnCerrar   = document.querySelector(".btn-cerrar-modal");
    const imagenes    = document.querySelectorAll(".tarjeta-flotante img");

    if (!modal || !imgGrande || !btnCerrar) return;

    imagenes.forEach(img => {
        img.style.cursor = "zoom-in";
        img.addEventListener("click", () => {
            modal.style.display = "flex";
            imgGrande.src = img.src;
            imgGrande.alt = img.alt;
        });
    });

    const cerrar = () => { modal.style.display = "none"; imgGrande.src = ""; };
    btnCerrar.addEventListener("click", cerrar);
    modal.addEventListener("click", e => { if (e.target === modal) cerrar(); });
    document.addEventListener("keydown", e => { if (e.key === "Escape" && modal.style.display === "flex") cerrar(); });
});

// ─── 6. MARQUESINA DE TEXTO (MOUSE SPEED) ────────────
document.addEventListener("DOMContentLoaded", () => {
    const contenedor = document.getElementById("marquesina-introduccion");
    if (!contenedor) return;

    const cinta = contenedor.querySelector(".marquesina-texto-cinta");
    if (!cinta) return;

    let posX       = 0;
    let velActual  = -2;
    let velDestino = -2;
    const mitad    = cinta.offsetWidth / 2;

    contenedor.addEventListener("mousemove", (e) => {
        const pct = (e.clientX / window.innerWidth) - 0.5;
        velDestino = pct > 0
            ? -4 - (pct * 25)
            :  4 - (pct * 25);
    });
    contenedor.addEventListener("mouseleave", () => { velDestino = -2; });

    function animar() {
        velActual += (velDestino - velActual) * 0.08;
        posX      += velActual;
        if (posX <= -mitad) posX = 0;
        if (posX >  0)      posX = -mitad;
        cinta.style.transform = `translateX(${posX}px)`;
        requestAnimationFrame(animar);
    }
    animar();
});