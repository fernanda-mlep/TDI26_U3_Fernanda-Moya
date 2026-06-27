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
            navbar.classList.add("activada");
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
            navbar.classList.remove("ocultar-por-seccion");
            navbar.classList.add("activada");
        }
    });
}

// ─── 3. MOTOR DE SCROLL (PRESENCIA FIJA CON EXCEPCIÓN GEOMÉTRICA) ───
window.addEventListener("scroll", () => {
    if (!navegacionPermitida) return;

    const pos = window.scrollY;
    
    // Capturamos las secciones clave para controlar la excepción de ocultamiento permanente
    const seccionComoJugar = document.getElementById("como-jugar");
    const seccionDemoGif   = document.getElementById("demo-gif-seccion");

    if (navbar) {
        let ocultarCabecera = false;

        // Validamos si la sección de transición circular existe en el DOM
        if (seccionComoJugar && seccionDemoGif) {
            const inicioComoJugar = seccionComoJugar.offsetTop;
            const inicioDemoGif   = seccionDemoGif.offsetTop;

            // La cabecera SE OCULTA únicamente si el scroll entra a la sección de la animación (menos el alto de barra)
            // y vuelve a aparecer de forma estricta al tocar la sección del GIF demo
            if (pos >= (inicioComoJugar - 80) && pos < (inicioDemoGif - 80)) {
                ocultarCabecera = true;
            }
        }

        // Aplicamos la clase de ocultamiento absoluto según la sección geométrica
        if (ocultarCabecera) {
            navbar.classList.add("ocultar-por-seccion");
        } else {
            navbar.classList.remove("ocultar-por-seccion");
        }

        // Efecto estético: fondo translúcido/sombra si se despegó del inicio del sitio
        if (pos > 50) {
            navbar.classList.add("activada");
        } else {
            navbar.classList.remove("activada");
        }
    }

    // Control de reducción del título Hero (Mantiene tu animación original)
    if (heroSection && pos > 50) {
        heroSection.classList.add("encoger-titulo");
    } else if (heroSection && pos <= 50) {
        heroSection.classList.remove("encoger-titulo");
    }

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
    if (!container) return; 

    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#e5e0d8'); 

    const camera = new THREE.PerspectiveCamera(40, container.clientWidth / container.clientHeight, 0.1, 1000);
    camera.position.set(0, 1.3, 9.5); 

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(renderer.domElement);

    const controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.maxPolarAngle = Math.PI / 2 + 0.05; 
    controls.minDistance = 4;
    controls.maxDistance = 14;

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

    const floorGeo = new THREE.PlaneGeometry(30, 30);
    const floorMat = new THREE.ShadowMaterial({ opacity: 0.12 });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -1.8;
    floor.receiveShadow = true;
    scene.add(floor);

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

    const peonMaterial = new THREE.MeshStandardMaterial({
        color: new THREE.Color('#8a8c8a'),
        roughness: 0.8,
        metalness: 0.02,
        normalMap: normalMapNoise,
        normalScale: new THREE.Vector2(0.06, 0.06)
    });

    const baseGroupMaster = new THREE.Group();

    const baseGeo = new THREE.CylinderGeometry(0.18, 0.55, 2.4, 40);
    const baseMesh = new THREE.Mesh(baseGeo, peonMaterial);
    baseMesh.castShadow = true;
    baseMesh.receiveShadow = true;
    baseGroupMaster.add(baseMesh);

    const neckGeo = new THREE.CylinderGeometry(0.13, 0.13, 0.25, 40);
    const neckMesh = new THREE.Mesh(neckGeo, peonMaterial);
    neckMesh.position.y = 1.25;
    neckMesh.castShadow = true;
    baseGroupMaster.add(neckMesh);

    const peonesGroup = new THREE.Group();

    const peon1 = baseGroupMaster.clone();
    const head1Geo = new THREE.CylinderGeometry(0.38, 0.38, 0.7, 6);
    const head1 = new THREE.Mesh(head1Geo, peonMaterial);
    head1.position.y = 1.65;
    head1.castShadow = true;
    peon1.add(head1);
    peon1.position.x = -2.4;
    peonesGroup.add(peon1);

    const peon2 = baseGroupMaster.clone();
    const head2Geo = new THREE.SphereGeometry(0.44, 40, 40);
    const head2 = new THREE.Mesh(head2Geo, peonMaterial);
    head2.position.y = 1.69;
    head2.castShadow = true;
    peon2.add(head2);
    peon2.position.x = -0.8;
    peonesGroup.add(peon2);

    const peon3 = baseGroupMaster.clone();
    const head3Geo = new THREE.CylinderGeometry(0.01, 0.58, 0.95, 40);
    const head3 = new THREE.Mesh(head3Geo, peonMaterial);
    head3.position.y = 1.72;
    head3.castShadow = true;
    peon3.add(head3);
    peon3.position.x = 0.8;
    peonesGroup.add(peon3);

    const peon4 = baseGroupMaster.clone();
    const head4Geo = new THREE.CylinderGeometry(0.46, 0.46, 0.85, 40);
    const head4 = new THREE.Mesh(head4Geo, peonMaterial);
    head4.position.y = 1.67;
    head4.castShadow = true;
    peon4.add(head4);
    peon4.position.x = 2.4;
    peonesGroup.add(peon4);

    peonesGroup.position.y = -0.3;
    scene.add(peonesGroup);

    function animate() {
        requestAnimationFrame(animate);
        controls.update();
        renderer.render(scene, camera);
    }

    window.addEventListener('resize', () => {
        if (!container) return;
        camera.aspect = container.clientWidth / container.clientHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(container.clientWidth, container.clientHeight);
    });

    animate();
});

// ─── 8. ANIMACIÓN EXPANSIÓN DE CÍRCULO (GSAP) ────────────
document.addEventListener("DOMContentLoaded", () => {
    gsap.registerPlugin(ScrollTrigger);

    const contenedor = document.querySelector(".contenedor-transicion-circular");
    const circuloMascara = document.getElementById("circulo-clip");
    const circuloBorde = document.getElementById("circulo-borde-visible"); 
    const textoRevelado = document.querySelector(".contenido-nueva-pantalla");

    if (!contenedor || !circuloMascara || !circuloBorde) return;

    const tl = gsap.timeline({
        scrollTrigger: {
            trigger: contenedor, 
            start: "top top",     
            end: "+=600",         
            scrub: 1,
            pin: true,            
            anticipatePin: 1
        }
    });

    tl.to(circuloMascara, {
        attr: { r: 1.2 }, 
        ease: "power2.out"
    }, "expandir") 
    
    .to(circuloBorde, {
        attr: { r: 75 },  
        ease: "power2.out"
    }, "expandir") 
    
    .to(textoRevelado, {
        onStart: () => textoRevelado.classList.add("visible"),
        onReverseComplete: () => textoRevelado.classList.remove("visible")
    }, "-=0.1"); 
});

// ─── 9. (Efecto Galería Flotante) ────────────
document.addEventListener("DOMContentLoaded", () => {
    const carruselContenedor = document.getElementById('carrusel-partes');
    if (!carruselContenedor) return;
    
    const tarjetas = carruselContenedor.querySelectorAll('.tarjeta-editorial');

    function actualizarTarjetaCentral() {
        const centroCarrusel = carruselContenedor.getBoundingClientRect().left + (carruselContenedor.offsetWidth / 2);

        tarjetas.forEach((tarjeta) => {
            const limites = tarjeta.getBoundingClientRect();
            const centroTarjeta = limites.left + (limites.width / 2);

            if (Math.abs(centroCarrusel - centroTarjeta) < limites.width / 2) {
                tarjeta.classList.add('activa');
            } else {
                tarjeta.classList.remove('activa');
            }
        });
    }

    carruselContenedor.addEventListener('scroll', actualizarTarjetaCentral);

    // Centrado inicial de la tarjeta
    const tarjetaCentral = tarjetas[2]; 
    if (tarjetaCentral) {
        const posicionX = tarjetaCentral.offsetLeft - (carruselContenedor.offsetWidth / 2) + (tarjetaCentral.offsetWidth / 2);
        carruselContenedor.scrollLeft = posicionX;
    }
    
    // Ejecutar una vez al inicio para activar la tarjeta central por defecto
    actualizarTarjetaCentral();
});