function inicializarLanguageToggle() {
    const idiomaSeleccionado = document.getElementById("idiomaSeleccionado");
    const languageLinks = document.querySelectorAll('.dropdown-item');

    // Carga el idioma seleccionado anteriormente durante la sesión
    const savedLang = sessionStorage.getItem("lang") || "es";
    document.documentElement.lang = savedLang;
    idiomaSeleccionado.textContent = savedLang === "en" ? "English" : "Español";

    let tempSelectedLang = savedLang;

    //Cada vez que se hace click sobre uno de los botones de idioma, se guarda la elección
    languageLinks.forEach(link => {
        link.addEventListener("click", (e) => {
            e.preventDefault();
            tempSelectedLang = link.getAttribute("data-lang");
            idiomaSeleccionado.textContent = tempSelectedLang === "en" ? "English" : "Español";
        });
    });

    // Cuando damos a guardar cambios se guarda la elección de manera oficial
    document.getElementById("guardarCambios").addEventListener("click", () => {
        sessionStorage.setItem("lang", tempSelectedLang);
        document.documentElement.lang = tempSelectedLang;

        // Cerramos el modal
        const modal = bootstrap.Modal.getInstance(document.getElementById('ajustesModal'));
        modal.hide();
    });
}

function inicializarFormularioReservas() {
    //tomamos los elementos de comienzo y fin de fecha
    const inicioInput = document.getElementById("inicioFecha");
    const finInput = document.getElementById("finFecha");

    //tomamos la fecha actual y la colocamos como fecha mínima de inicio
    const ahora = new Date();
    const fechaActual = ahora.toISOString().slice(0, 16);
    inicioInput.min = fechaActual;

    //tomamos la fecha dentro de un año y la colocamos como fecha máxima de inicio
    const unAnoDespues = new Date();
    unAnoDespues.setFullYear(ahora.getFullYear() + 1);
    const fechaMaxima = unAnoDespues.toISOString().slice(0, 16);
    inicioInput.max = fechaMaxima;

    //cada vez que inicioInput cambia
    inicioInput.addEventListener("change", function () {
        //el finInput tiene la nueva fecha como valor min
        finInput.min = this.value;
        //si ya había un valor, desaparece TODO
        if (finInput.value && finInput.value < this.value) {
            finInput.value = "";
        }
        //calculamos la fecha máxima de fin de reserva como la fecha de inicio + 3 meses
        const fechaMaxFin = new Date(this.value);
        fechaMaxFin.setMonth(fechaMaxFin.getMonth() + 3);
        finInput.max = fechaMaxFin.toISOString().slice(0, 16);
    });

    //cuando hacemos click en submit en el formulario
    const form = document.querySelector("form");
    form.addEventListener("submit", function (e) {
        //tomamos la fecha de inicio y fin de formulario
        const fechaInicio = new Date(inicioInput.value);
        const fechaFin = new Date(finInput.value);

        //si ambos valores están inicializados comprobamos que todo funcione como debe
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

function inicializarTema() {
    //tomamos el botón de guardado del cambio de tema
    const guardarBtn = document.getElementById("guardarCambios");
    const navbar = document.querySelector("nav.navbar");

    //aplicamos el tema correspondiente
    function applyTheme(theme) {
        let navbarClasses = ["navbar-light", "bg-light"];
        let dataTheme = "default";

        if (theme === "oscuro") {
            navbarClasses = ["navbar-dark", "bg-dark"];
            dataTheme = "dark";
        } else if (theme === "alto-contraste") {
            navbarClasses = ["navbar-dark", "bg-dark"];
            dataTheme = "high-contrast";
        }

        navbar.classList.remove("navbar-light", "navbar-dark", "bg-light", "bg-dark");
        navbar.classList.add(...navbarClasses);

        document.documentElement.setAttribute("data-theme", dataTheme);
        document.documentElement.setAttribute(
            "data-bs-theme",
            dataTheme === "default" ? "light" : "dark"
        );
    }

    // Cargar tema guardado o default
    const savedTheme = sessionStorage.getItem("theme") || "claro";
    applyTheme(savedTheme);

    // Marcar radio
    const savedRadio = document.querySelector(`input[name="tema"][value="${savedTheme}"]`);
    if (savedRadio) savedRadio.checked = true;

    // Aplicar al guardar
    guardarBtn.addEventListener("click", () => {
        const selectedTheme = document.querySelector('input[name="tema"]:checked').value;
        sessionStorage.setItem("theme", selectedTheme);
        applyTheme(selectedTheme);

        const modal = bootstrap.Modal.getInstance(document.getElementById('ajustesModal'));
        modal.hide();
    });
}

// Inicializar todo al cargar
document.addEventListener("DOMContentLoaded", function () {
    inicializarLanguageToggle();
    inicializarTema();

    const path = window.location.pathname;
    if (path.includes("reservas.html")) {
        inicializarFormularioReservas();
    }
});

