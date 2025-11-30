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

function reserveCar(matricula) {
    // Envía al usuario a reservas.html con ?car=MAT
    window.location.href = `../public/reservas.html?car=${encodeURIComponent(matricula)}`;
}

function inicializarTamanoLetra() {
    const ajustesModal = document.getElementById("ajustesModal");
    const fontSizeRange = document.getElementById("fontSizeRange");
    const fontSizeValue = document.getElementById("fontSizeValue");
    const guardarCambiosBtn = document.getElementById("guardarCambios");

    let tamanoOriginal = null;
    let cambiosGuardados = false;

    // Aplicamos el tamaño nuevo según el slider
    function aplicarTamanoFuente(valor) {
        const baseSize = parseFloat(valor);
        fontSizeValue.textContent = `${baseSize}rem`;

        // Elementos normales
        document.querySelectorAll("p, li, a, span, label, button").forEach(el => {
            el.style.fontSize = `${baseSize}rem`;
        });

        // Encabezados
        document.querySelectorAll("h1, h2, h3, h4, h5, h6, strong, b").forEach(el => {
            let factor;
            switch (el.tagName.toLowerCase()) {
                case "h1": factor = 2.5; break;
                case "h2": factor = 2; break;
                case "h3": factor = 1.75; break;
                case "h4": factor = 1.5; break;
                case "h5": factor = 1.25; break;
                case "h6": factor = 1.1; break;
                case "strong":
                case "b": factor = 1.05; break;
                default: factor = 1;
            }
            el.style.fontSize = `${(baseSize * factor).toFixed(2)}rem`;
        });
    }

    // Restauramos el tamaño original
    function restaurarTamanoOriginal() {
        aplicarTamanoFuente(tamanoOriginal);
        fontSizeRange.value = tamanoOriginal;
    }

    // Guardamos el valor al abrir el modal
    ajustesModal.addEventListener("show.bs.modal", () => {
        tamanoOriginal = parseFloat(fontSizeRange.value);
        cambiosGuardados = false;
    });

    // Cambiamos el tamaño de la letra como vista previa
    fontSizeRange.addEventListener("input", () => {
        aplicarTamanoFuente(fontSizeRange.value);
    });

    // Guardamos los cambios si son definitivos
    guardarCambiosBtn.addEventListener("click", () => {
        cambiosGuardados = true;
        const valor = fontSizeRange.value;
        aplicarTamanoFuente(valor);
        sessionStorage.setItem("fontSize", valor);

        // cerrar modal con bootstrap
        const modal = bootstrap.Modal.getInstance(ajustesModal);
        modal.hide();
    });

    // Pero si se cierra sin guardar entonces los revertimos
    ajustesModal.addEventListener("hidden.bs.modal", () => {
        if (!cambiosGuardados) {
            restaurarTamanoOriginal();
        }
    });

    const fontSizeGuardado = sessionStorage.getItem("fontSize");
    if (fontSizeGuardado) {
        fontSizeRange.value = fontSizeGuardado;
        aplicarTamanoFuente(fontSizeGuardado);
    } else {
        // aplicar valor del slider por defecto
        aplicarTamanoFuente(fontSizeRange.value);
    }
}

function inicializarSignInUp() {
    document.getElementById('signInBtn').addEventListener('click', function () {
        document.getElementById('signInForm').style.display = 'block';
        document.getElementById('signUpForm').style.display = 'none';
    });

    document.getElementById('signUpBtn').addEventListener('click', function () {
        document.getElementById('signInForm').style.display = 'none';
        document.getElementById('signUpForm').style.display = 'block';
    });
}

function validateEmailSignUp() {
    const email = document.getElementById("signUpEmail").value;
    const emailError = document.getElementById("signUpEmailError");

    if (!(email.endsWith("@ucm.com")||email.endsWith("@ucm.es"))) {
      emailError.style.display = "block";
      return false;
    } else {
      emailError.style.display = "none"; 
      return true; 
    }
  }

// Inicializar todo al cargar
document.addEventListener("DOMContentLoaded", function () {
    inicializarLanguageToggle();
    inicializarTema();
    inicializarTamanoLetra();
    inicializarSignInUp();

    const path = window.location.pathname;
    const params = new URLSearchParams(window.location.search);
    if (path.includes("reservas.html")) {
        const matricula = params.get("car");
        inicializarFormularioReservas();
        if (matricula) {
            const selectVehiculo = document.getElementById("vehiculo");
            selectVehiculo.value = matricula;
        }
    }
});

