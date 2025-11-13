function inicializarLanguageToggle() {
    const idiomaSeleccionado = document.getElementById("idiomaSeleccionado");
    const languageLinks = document.querySelectorAll('.dropdown-item');

    // Load previously saved language
    const savedLang = sessionStorage.getItem("lang") || "es";
    document.documentElement.lang = savedLang;
    idiomaSeleccionado.textContent = savedLang === "en" ? "English" : "Español";

    let tempSelectedLang = savedLang;

    languageLinks.forEach(link => {
        link.addEventListener("click", (e) => {
            e.preventDefault();
            tempSelectedLang = link.getAttribute("data-lang");
            idiomaSeleccionado.textContent = tempSelectedLang === "en" ? "English" : "Español";
        });
    });

    // When "Guardar cambios" is clicked
    document.getElementById("guardarCambios").addEventListener("click", () => {
        sessionStorage.setItem("lang", tempSelectedLang);
        document.documentElement.lang = tempSelectedLang;

        // Close the modal after saving
        const modal = bootstrap.Modal.getInstance(document.getElementById('ajustesModal'));
        modal.hide();
    });
}

function inicializarFormularioReservas() {
    const inicioInput = document.getElementById("inicioFecha");
    const finInput = document.getElementById("finFecha");

    const ahora = new Date();
    const fechaActual = ahora.toISOString().slice(0, 16);
    inicioInput.min = fechaActual;

    const unAnoDespues = new Date();
    unAnoDespues.setFullYear(ahora.getFullYear() + 1);
    const fechaMaxima = unAnoDespues.toISOString().slice(0, 16);
    inicioInput.max = fechaMaxima;

    inicioInput.addEventListener("change", function () {
        finInput.min = this.value;

        if (finInput.value && finInput.value < this.value) {
            finInput.value = "";
        }

        const fechaMaxFin = new Date(this.value);
        fechaMaxFin.setMonth(fechaMaxFin.getMonth() + 3);
        finInput.max = fechaMaxFin.toISOString().slice(0, 16);
    });

    const form = document.querySelector("form");
    form.addEventListener("submit", function (e) {
        const fechaInicio = new Date(inicioInput.value);
        const fechaFin = new Date(finInput.value);

        if (inicioInput.value && finInput.value) {
            if (fechaFin < fechaInicio) {
                e.preventDefault();
                alert("La fecha de devolución no puede ser anterior a la fecha de inicio.");
                return;
            }

            if (fechaInicio < ahora || fechaInicio > unAnoDespues) {
                e.preventDefault();
                alert("La fecha de inicio no puede ser anterior a la fecha actual ni posterior a un año desde hoy.");
                return;
            }

            const fechaMaxFin = new Date(fechaInicio);
            fechaMaxFin.setMonth(fechaInicio.getMonth() + 3);
            if (fechaFin > fechaMaxFin) {
                e.preventDefault();
                alert("La fecha de devolución no puede ser más de 3 meses después de la fecha de inicio.");
                return;
            }
        } else {
            e.preventDefault();
            alert("Por favor, complete ambas fechas.");
        }
    });
}

document.addEventListener("DOMContentLoaded", function () {
    // Initialize language toggle functionality
    inicializarLanguageToggle();

    // Initialize the reservation form if we are on the 'reservas.html' page
    const path = window.location.pathname;
    if (path.includes("reservas.html")) {
        inicializarFormularioReservas();
    }
});
