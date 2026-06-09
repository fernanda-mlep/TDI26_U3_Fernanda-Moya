// Configuración del efecto máquina de escribir
const textoEscribir = "Catapultazo";
const velocidadEscritura = 175; 

let indiceActual = 0;
const contenedorTexto = document.getElementById("typer");
const boton = document.getElementById("btn-comenzar");

function escribirLetra() {
    if (indiceActual < textoEscribir.length) {
        contenedorTexto.textContent += textoEscribir.charAt(indiceActual);
        indiceActual++;
        setTimeout(escribirLetra, velocidadEscritura);
    } else {
        setTimeout(() => {
            boton.classList.add("mostrar");
        }, 300); 
    }
}

window.addEventListener("DOMContentLoaded", () => {
    setTimeout(escribirLetra, 1000); 
});


 // Cursor personalizado 
const cursorEspecial = document.querySelector(".custom-cursor");

window.addEventListener("mousemove", (e) => {
    cursorEspecial.style.left = e.clientX + "px";
    cursorEspecial.style.top = e.clientY + "px";
});