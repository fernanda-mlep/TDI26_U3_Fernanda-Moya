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

// ─── 7. VISOR TRIDIMENSIONAL DE PEONES INTERACTIVOS ───
document.addEventListener("DOMContentLoaded", () => {
    const container = document.getElementById('canvas-peones-3d');
    if (!container) return; // Si no encuentra el elemento, no ejecuta para evitar errores

    // Configuración inicial de la escena
    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#e5e0d8'); // Tono idéntico al fondo de la imagen de referencia

    // Cámara en perspectiva ajustada al contenedor
    const camera = new THREE.PerspectiveCamera(40, container.clientWidth / container.clientHeight, 0.1, 1000);
    camera.position.set(0, 1.3, 9.5); // Encuadre frontal de las 4 piezas

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(renderer.domElement);

    // Controles de órbita restringidos para interactuar solo dentro del Canvas
    const controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.maxPolarAngle = Math.PI / 2 + 0.05; // Impide que la cámara pase por debajo del plano base
    controls.minDistance = 4;
    controls.maxDistance = 14;

    // Sistema de Iluminación de Estudio para suavizar sombras y dar volumen
    const ambientLight = new THREE.AmbientLight('#ffffff', 0.65);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight('#ffffff', 0.75);
    dirLight.position.set(6, 12, 7);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 1024;
    dirLight.shadow.mapSize.height = 1024;
    dirLight.shadow.bias = -0.001;
    scene.add(dirLight);

    const fillLight = new THREE.DirectionalLight('#ffffff', 0.25);
    fillLight.position.set(-6, 4, -4);
    scene.add(fillLight);

    // Suelo invisible para proyectar y recibir sombras arrojadas
    const floorGeo = new THREE.PlaneGeometry(30, 30);
    const floorMat = new THREE.ShadowMaterial({ opacity: 0.12 });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -1.8;
    floor.receiveShadow = true;
    scene.add(floor);

    // Generación de un mapa de normales procedural (Simula micro-rugosidad mate sin cargar archivos externos)
    function createNoiseNormalTexture() {
        const size = 128;
        const canvasNoise = document.createElement('canvas');
        canvasNoise.width = size;
        canvasNoise.height = size;
        const ctxNoise = canvasNoise.getContext('2d');
        const imgData = ctxNoise.createImageData(size, size);
        
        for (let i = 0; i < imgData.data.length; i += 4) {
            const valX = Math.random() * 12 + 120;
            const valY = Math.random() * 12 + 120;
            imgData.data[i] = valX;
            imgData.data[i + 1] = valY;
            imgData.data[i + 2] = 255;
            imgData.data[i + 3] = 255;
        }
        ctxNoise.putImageData(imgData, 0, 0);
        const texture = new THREE.CanvasTexture(canvasNoise);
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        texture.repeat.set(5, 5);
        return texture;
    }

    const normalMapNoise = createNoiseNormalTexture();

    // Material plástico/resina mate unificado
    const peonMaterial = new THREE.MeshStandardMaterial({
        color: new THREE.Color('#8a8c8a'),
        roughness: 0.8,
        metalness: 0.02,
        normalMap: normalMapNoise,
        normalScale: new THREE.Vector2(0.06, 0.06)
    });

    // Construcción de la base exacta unificada para los 4 peones
    const baseGroupMaster = new THREE.Group();

    // Cono truncado de la base
    const baseGeo = new THREE.CylinderGeometry(0.18, 0.55, 2.4, 40);
    const baseMesh = new THREE.Mesh(baseGeo, peonMaterial);
    baseMesh.castShadow = true;
    baseMesh.receiveShadow = true;
    baseGroupMaster.add(baseMesh);

    // Cuello cilíndrico de unión
    const neckGeo = new THREE.CylinderGeometry(0.13, 0.13, 0.25, 40);
    const neckMesh = new THREE.Mesh(neckGeo, peonMaterial);
    neckMesh.position.y = 1.25;
    neckMesh.castShadow = true;
    baseGroupMaster.add(neckMesh);

    const peonesGroup = new THREE.Group();

    // PEÓN 1: Cabeza de Diamante Truncado (Polígono facetado angular)
    const peon1 = baseGroupMaster.clone();
    const head1Geo = new THREE.CylinderGeometry(0.38, 0.38, 0.7, 6);
    const head1 = new THREE.Mesh(head1Geo, peonMaterial);
    head1.position.y = 1.65;
    head1.castShadow = true;
    peon1.add(head1);
    peon1.position.x = -2.4;
    peonesGroup.add(peon1);

    // PEÓN 2: Cabeza de Esfera Perfecta
    const peon2 = baseGroupMaster.clone();
    const head2Geo = new THREE.SphereGeometry(0.44, 40, 40);
    const head2 = new THREE.Mesh(head2Geo, peonMaterial);
    head2.position.y = 1.69;
    head2.castShadow = true;
    peon2.add(head2);
    peon2.position.x = -0.8;
    peonesGroup.add(peon2);

    // PEÓN 3: Modificado con la misma base y Cabeza de Cono (Pirámide de base circular con punta redondeada)
    const peon3 = baseGroupMaster.clone();
    const head3Geo = new THREE.CylinderGeometry(0.01, 0.58, 0.95, 40);
    const head3 = new THREE.Mesh(head3Geo, peonMaterial);
    head3.position.y = 1.72;
    head3.castShadow = true;
    peon3.add(head3);
    peon3.position.x = 0.8;
    peonesGroup.add(peon3);

    // PEÓN 4: Cabeza de Cilindro Ancho con Superficie Plana
    const peon4 = baseGroupMaster.clone();
    const head4Geo = new THREE.CylinderGeometry(0.46, 0.46, 0.85, 40);
    const head4 = new THREE.Mesh(head4Geo, peonMaterial);
    head4.position.y = 1.67;
    head4.castShadow = true;
    peon4.add(head4);
    peon4.position.x = 2.4;
    peonesGroup.add(peon4);

    // Ajustar el grupo en el eje Y del canvas
    peonesGroup.position.y = -0.3;
    scene.add(peonesGroup);

    // Ciclo de renderizado interactivo continuo
    function animate() {
        requestAnimationFrame(animate);
        controls.update();
        renderer.render(scene, camera);
    }

    // Adaptación responsive dinámica en función de la redimensión de la pantalla
    window.addEventListener('resize', () => {
        if (!container) return;
        camera.aspect = container.clientWidth / container.clientHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(container.clientWidth, container.clientHeight);
    });

    animate();
});

// ─── 7. ANIMACIÓN EXPANSIÓN DE CÍRCULO (GSAP) ────────────
document.addEventListener("DOMContentLoaded", () => {
    // Registramos el plugin de Scroll en GSAP
    gsap.registerPlugin(ScrollTrigger);

    const contenedor = document.querySelector(".contenedor-transicion-circular");
    const circulo = document.getElementById("circulo-clip");
    const textoRevelado = document.querySelector(".contenido-nueva-pantalla");

    if (!contenedor || !circulo) return;

    // Creamos la línea de tiempo atada al scroll
    const tl = gsap.timeline({
        scrollTrigger: {
            trigger: contenedor, // Volvemos a usar el contenedor circular como disparador
            start: "top top",     // Empieza cuando el contenedor toca la parte superior
            end: "+=600",         // La distancia de scroll reducida que habías configurado
            scrub: 1,
            pin: true,            // Clava el contenedor automáticamente al usarlo como trigger
            anticipatePin: 1
        }
    });

    // Animamos el radio del círculo SVG interno
    tl.to(circulo, {
        attr: { r: 1 },           // Volvemos al radio original de 1
        ease: "power2.out"        // Genera la sensación de aceleración elíptica rápida
    })
    .to(textoRevelado, {
        // Al final del tramo, revelamos el texto con un sutil Fade-In
        onStart: () => textoRevelado.classList.add("visible"),
        onReverseComplete: () => textoRevelado.classList.remove("visible")
    }, "-=0.1"); // Se solapa ligeramente con el final de la expansión
});