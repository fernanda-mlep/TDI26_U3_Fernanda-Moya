// Configuración del efecto máquina de escribir
const textoEscribir = "Catapultazo";

let indiceActual = 0;
const contenedorTexto = document.getElementById("typer");
const boton = document.getElementById("btn-comenzar");

function escribirLetra() {
    if (indiceActual < textoEscribir.length) {
        // 1. Agrega la siguiente letra
        contenedorTexto.textContent += textoEscribir.charAt(indiceActual);
        indiceActual++;
        
        // código de fluidez de la letra
    const velocidadFluida = Math.floor(Math.random() * (220 - 120 + 1)) + 120;
        
        // 3. Llama a la función con el nuevo retraso variable
        setTimeout(escribirLetra, velocidadFluida);
    } else {
        // Al terminar de escribir, muestra el botón '+' tras una breve pausa de 300ms
        setTimeout(() => {
            boton.classList.add("mostrar");
        }, 300); 
    }
}

// Iniciar la animación automáticamente con un retraso de 1 segundo (1000ms) al abrir el sitio web
window.addEventListener("DOMContentLoaded", () => {
    setTimeout(escribirLetra, 1000); 
});


// ==========================================
// DETECTOR DE SCROLL PARA LA CABECERA
// ==========================================
const navbar = document.getElementById("main-navbar");

window.addEventListener("scroll", () => {
    // Umbral de tolerancia (80px): define el momento exacto donde el estado cambia
    if (window.scrollY > 80) {
        navbar.classList.add("contraido"); // Inyección del estado de navegación fija
    } else {
        navbar.classList.remove("contraido"); // Retorno al estado de presentación inicial
    }
});