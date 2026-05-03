export function mostrarFeedback(mensaje, tipo = 'success') {
    const container = document.getElementById('feedback-container');

    const alerta = document.createElement('div');
    alerta.className = `alert alert-${tipo} alert-dismissible fade show`;
    alerta.role = 'alert';

    alerta.innerHTML = `
        ${mensaje}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;

    container.appendChild(alerta);

    // Auto eliminar después de 3s
    setTimeout(() => {
        alerta.classList.remove('show');
        alerta.classList.add('hide');
        alerta.remove();
    }, 3000);
}

export function mostrarFeedbackModal(mensaje, tipo = 'success') {
    const container = document.getElementById('feedback-container-modal');

    const alerta = document.createElement('div');
    alerta.className = `alert alert-${tipo} alert-dismissible fade show`;
    alerta.role = 'alert';

    alerta.innerHTML = `
        ${mensaje}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;

    container.appendChild(alerta);

    // Auto eliminar después de 3s
    setTimeout(() => {
        alerta.classList.remove('show');
        alerta.classList.add('hide');
        alerta.remove();
    }, 3000);
}

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