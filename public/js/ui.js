/* FUNCIONES AQUÍ:
- FUNCION PARA ABRIR Y CERRAR UN FORMULARIO CON TOGGLE
*/

function toggleFormulario() {
    // Selecciona todos los elementos que tienen data-bs-toggle="collapse"
    const collapseHeaders = document.querySelectorAll('[data-bs-toggle="collapse"]');

    collapseHeaders.forEach(header => {
        header.addEventListener('click', function () {
            const icon = this.querySelector('i');
            if (icon) {
                icon.classList.toggle('bi-chevron-down');
                icon.classList.toggle('bi-chevron-up');
            }
        });
    });
}

document.addEventListener("DOMContentLoaded", function () {
    const path = window.location.pathname;
    
    if (path.includes("admin")) {
        toggleFormulario();
    }
    
});