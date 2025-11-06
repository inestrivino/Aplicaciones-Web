document.addEventListener("DOMContentLoaded", function () {
    //PARA EL LANGUAGE TOGGLE
    const languageDropdownItems = document.querySelectorAll('[data-lang]');
    const selectedLanguageSpan = document.getElementById('selectedLanguage');

    languageDropdownItems.forEach(item => {
        item.addEventListener('click', function (e) {
            e.preventDefault();
            const lang = this.getAttribute('data-lang');
            document.documentElement.lang = lang;

            // Actualizar el texto del botón del dropdown
            if (lang === 'es') {
                selectedLanguageSpan.textContent = 'Español';
            } else if (lang === 'en') {
                selectedLanguageSpan.textContent = 'English';
            }
        });
    });

    //PARA QUE EL FORMULARIO DE RESERVAS TENGA SENTIDO LÓGICO
    const inicioInput = document.getElementById("inicioFecha");
    const finInput = document.getElementById("finFecha");

    // Obtener la fecha y hora actual en formato YYYY-MM-DDTHH:MM
    const ahora = new Date();
    const fechaActual = ahora.toISOString().slice(0, 16);

    // Establecer la fecha mínima para el inicio (hoy)
    inicioInput.min = fechaActual;

    // Establecer la fecha máxima para el inicio (dentro de un año)
    const unAnoDespues = new Date();
    unAnoDespues.setFullYear(ahora.getFullYear() + 1);
    const fechaMaxima = unAnoDespues.toISOString().slice(0, 16);
    inicioInput.max = fechaMaxima;

    // Cuando se seleccione una fecha de inicio, establecerla como mínima para la fecha de fin y la fecha 3 meses después como máximo
    inicioInput.addEventListener("change", function () {
        finInput.min = this.value;

        // Si la fecha de fin ya estaba seleccionada y es anterior a la nueva fecha de inicio, limpiarla
        if (finInput.value && finInput.value < this.value) {
            finInput.value = "";
        }

        // Establecer la fecha máxima para la fecha de fin (3 meses después de la fecha de inicio)
        const fechaMaxFin = new Date(this.value);
        fechaMaxFin.setMonth(fechaMaxFin.getMonth() + 3);
        finInput.max = fechaMaxFin.toISOString().slice(0, 16);
    });

    // Validar que la fecha de fin no sea anterior a la de inicio al enviar el formulario
    const form = document.querySelector("form");
    form.addEventListener("submit", function (e) {
        // Verificar que ambas fechas estén llenas
        const fechaInicio = new Date(inicioInput.value);
        const fechaFin = new Date(finInput.value);

        if (inicioInput.value && finInput.value) {
            // Validar que la fecha de fin no sea anterior a la de inicio
            if (fechaFin < fechaInicio) {
                e.preventDefault();
                alert("La fecha de devolución no puede ser anterior a la fecha de inicio.");
                return;
            }

            // Validar que la fecha de inicio no sea anterior a hoy ni posterior a un año desde hoy
            if (fechaInicio < ahora || fechaInicio > unAnoDespues) {
                e.preventDefault();
                alert("La fecha de inicio no puede ser anterior a la fecha actual ni posterior a un año desde hoy.");
                return;
            }

            // Validar que la fecha de fin no sea más de 3 meses después de la fecha de inicio
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
    })

    //PARA NAVEGAR CON TECLADO
    let altPressed = false;

    document.addEventListener('keydown', function (event) {
        
    });

    document.addEventListener('keyup', function (event) {
        // Verificar si la tecla Alt se ha soltado
        if (event.key === "Control") {
            altPressed = false;
        }
    })

    //PARA EL CAMBIO DE TEMA
    // Seleccionar el botón para cambiar el tema
    const themeToggleButton = document.getElementById('toggleThemeBtn');

    // Función para aplicar el cambio de tema
    themeToggleButton.addEventListener('click', function () {
        // Cambiar el tema entre 'default' y 'high-contrast'
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'high-contrast' ? 'default' : 'high-contrast';

        // Cambiar el atributo data-theme en el HTML
        document.documentElement.setAttribute('data-theme', newTheme);

        // Actualizar la clase de la navbar
        const navbar = document.querySelector('.navbar');
        if (newTheme === 'high-contrast') {
            navbar.classList.remove('navbar-light', 'bg-light');
            navbar.classList.add('navbar-dark', 'bg-dark');
        } else {
            navbar.classList.remove('navbar-dark', 'bg-dark');
            navbar.classList.add('navbar-light', 'bg-light');
        }

        // Cambiar las tablas (alternar entre 'table-dark' y 'table-striped')
        const tables = document.querySelectorAll('.table');
        tables.forEach(table => {
            if (newTheme === 'high-contrast') {
                table.classList.remove('table-striped');
                table.classList.add('table-dark');
            } else {
                table.classList.remove('table-dark');
                table.classList.add('table-striped');
            }
        });

        // Cambiar el texto del botón de cambio de tema
        themeToggleButton.textContent = newTheme === 'high-contrast' ? 'Activar modo claro' : 'Activar alto contraste';
    });
});