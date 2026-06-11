const hero = document.getElementById('interactive-hero');
const mask = document.querySelector('.dark-mask');

// 1. EFECTO MOUSE: Revelar colores al mover el cursor
hero.addEventListener('mousemove', (e) => {
    // Obtenemos la posición del mouse respecto a la pantalla
    const rect = hero.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    /* Creamos un gradiente radial dinámico. 
      Un círculo transparente en la posición del mouse, 
      que se difumina rápidamente a negro puro (#000000).
    */
    mask.style.background = `radial-gradient(circle 150px at ${x}px ${y}px, transparent 0%, rgba(0,0,0,1) 100%)`;
});

// Resetear el fondo negro si el mouse sale de la primera pantalla
hero.addEventListener('mouseleave', () => {
    mask.style.background = '#000000';
});


// 2. EFECTO SCROLL: El negro se difumina revelando el fondo/verde
window.addEventListener('scroll', () => {
    const scrollY = window.scrollY;
    const windowHeight = window.innerHeight;

    // Calculamos el porcentaje de scroll respecto a la primera pantalla (0 a 1)
    let scrollRatio = scrollY / windowHeight;
    
    // Limitamos el valor entre 0 y 1 para evitar errores
    if (scrollRatio > 1) scrollRatio = 1;
    if (scrollRatio < 0) scrollRatio = 0;

    /* A medida que se hace scroll, reducimos la opacidad de la capa negra (mask).
      Al volverse transparente, el scroll natural revela la sección verde de abajo.
    */
    mask.style.opacity = 1 - scrollRatio;
});