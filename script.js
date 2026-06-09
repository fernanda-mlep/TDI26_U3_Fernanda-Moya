// Configuración del efecto máquina de escribir
const textoEscribir = "Catapultazo";
const velocidadEscritura = 175; // Tiempo en milisegundos entre cada letra (menor número = más rápido)

let indiceActual = 0;
const contenedorTexto = document.getElementById("typer");
const boton = document.getElementById("btn-comenzar");

function escribirLetra() {
    if (indiceActual < textoEscribir.length) {
        // Agrega la siguiente letra
        contenedorTexto.textContent += textoEscribir.charAt(indiceActual);
        indiceActual++;
        // Llama a la función de nuevo tras el delay configurado
        setTimeout(escribirLetra, velocidadEscritura);
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