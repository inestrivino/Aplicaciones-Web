/* ACCESIBILIDAD Y PREFERENCIAS */
function inicializarLanguageToggle() {
    const idiomaSeleccionado = document.getElementById("idiomaSeleccionado");
    const languageLinks = document.querySelectorAll('.dropdown-item');

    if (idiomaSeleccionado) {
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
        const guardarCambios = document.getElementById("guardarCambios");
        if (guardarCambios) {
            guardarCambios.addEventListener("click", () => {
                sessionStorage.setItem("lang", tempSelectedLang);
                document.documentElement.lang = tempSelectedLang;

                // Cerramos el modal
                const modal = bootstrap.Modal.getInstance(document.getElementById('ajustesModal'));
                modal.hide();
            });
        }
    }
}

function inicializarFormularioReservas() {
    const inicioInput = document.getElementById("inicioFecha");
    const finInput = document.getElementById("finFecha");
    const matriculaInput = document.getElementById("vehiculo");

    if (!inicioInput || !finInput || !matriculaInput) return;

    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    const manana = new Date(hoy);
    manana.setDate(manana.getDate() + 1);

    const unAno = new Date(manana);
    unAno.setFullYear(unAno.getFullYear() + 1);

    const params = new URLSearchParams(window.location.search);
    const car = params.get("car");

    if (car) {
        matriculaInput.value = car;
    }

    let fpInicio;
    let fpFin;
    let rangosOcupados = [];

    fpInicio = flatpickr(inicioInput, {
        dateFormat: "Y-m-d",
        minDate: manana,
        maxDate: unAno,
        disable: [],
        onChange: onInicioChange
    });

    fpFin = flatpickr(finInput, {
        dateFormat: "Y-m-d",
        disable: []
    });

    function onInicioChange(selectedDates) {
        if (!selectedDates.length) return;

        const inicio = selectedDates[0];

        finInput.value = "";
        fpFin.clear();

        const minFin = new Date(inicio);
        minFin.setDate(minFin.getDate() + 1);

        const maxFin = new Date(inicio);
        maxFin.setMonth(maxFin.getMonth() + 3);

        fpFin.set("minDate", minFin);
        fpFin.set("maxDate", maxFin);
        fpFin.set("disable", rangosOcupados);
    }

    const cargarFechas = async () => {
        if (!matriculaInput.value) return;
        const reservas = await obtenerFechasOcupadas(matriculaInput.value);
        rangosOcupados = reservas.map(r => ({
            from: r.fecha_ini.split("T")[0],
            to: r.fecha_fin.split("T")[0]
        }));
        fpInicio.set("disable", rangosOcupados);
        fpFin.set("disable", rangosOcupados);
    };

    matriculaInput.addEventListener("change", () => {
        inicioInput.value = "";
        finInput.value = "";
        cargarFechas();
    });

    if (matriculaInput.value) {
        cargarFechas();
    }

    async function obtenerFechasOcupadas(matricula) {
        const res = await fetch(`/vehiculos/fechasOcupado?matricula=${matricula}`);
        const data = await res.json();
        return data.ocupadas || [];
    }

    document.querySelector("form").addEventListener("submit", (e) => {
        const inicio = document.getElementById("inicioFecha");
        const fin = document.getElementById("finFecha");

        if (!inicio.value || !fin.value) {
            e.preventDefault();
            alert("Debes seleccionar ambas fechas de reserva.");
            return;
        }
        const regex = /^\d{4}-\d{2}-\d{2}$/;
        if (!regex.test(inicio.value) || !regex.test(fin.value)) {
            e.preventDefault();
            alert("Formato de fecha inválido.");
            return;
        }
    });
}

function inicializarTema() {
    const guardarBtn = document.getElementById("guardarCambios");
    const navbar = document.querySelector("nav.navbar");

    if (navbar && guardarBtn) {
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

        const savedTheme = sessionStorage.getItem("theme") || "claro";
        applyTheme(savedTheme);

        const savedRadio = document.querySelector(`input[name="tema"][value="${savedTheme}"]`);
        if (savedRadio) savedRadio.checked = true;

        guardarBtn.addEventListener("click", () => {
            const selectedTheme = document.querySelector('input[name="tema"]:checked').value;
            sessionStorage.setItem("theme", selectedTheme);
            applyTheme(selectedTheme);

            const modal = bootstrap.Modal.getInstance(document.getElementById('ajustesModal'));
            modal.hide();
        });
    }
}

function inicializarTamanoLetra() {
    const ajustesModal = document.getElementById("ajustesModal");
    const fontSizeRange = document.getElementById("fontSizeRange");
    const fontSizeValue = document.getElementById("fontSizeValue");
    const guardarCambiosBtn = document.getElementById("guardarCambios");

    if (ajustesModal) {
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
}

function inicializarAtajosTeclado() {
    // Verificar que los elementos del DOM existen antes de acceder a ellos
    const shortcutInicioElement = document.getElementById('shortcutInicio');
    const shortcutVehiculosElement = document.getElementById('shortcutVehiculos');
    const shortcutReservarElement = document.getElementById('shortcutReservar');
    const shortcutMisReservasElement = document.getElementById('shortcutMisReservas');

    const guardarCambiosBtn = document.getElementById("guardarCambios");
    const modal = document.getElementById('ajustesModal');

    const shortcutInicio = (sessionStorage.getItem('shortcutInicio') || 'i').toLowerCase();
    const shortcutVehiculos = (sessionStorage.getItem('shortcutVehiculos') || 'v').toLowerCase();
    const shortcutReservar = (sessionStorage.getItem('shortcutReservar') || 'r').toLowerCase();
    const shortcutMisReservas = (sessionStorage.getItem('shortcutMisReservas') || 'm').toLowerCase();

    let initialShortcuts = {
        inicio: shortcutInicio,
        vehiculos: shortcutVehiculos,
        reservar: shortcutReservar,
        misReservas: shortcutMisReservas,
    };

    if (shortcutInicioElement) document.getElementById('shortcutInicio').value = initialShortcuts.inicio;
    if (shortcutVehiculosElement) document.getElementById('shortcutVehiculos').value = initialShortcuts.vehiculos;
    if (shortcutReservarElement) document.getElementById('shortcutReservar').value = initialShortcuts.reservar;
    if (shortcutMisReservasElement) document.getElementById('shortcutMisReservas').value = initialShortcuts.misReservas;

    const linkInicio = document.querySelector('a[aria-label="Ir a inicio"]');
    const linkVehiculos = document.querySelector('a[aria-label="Ir a Vehículos"]');
    const linkReservar = document.querySelector('a[aria-label="Ir a Reservas"]');
    const linkMisReservas = document.querySelector('a[aria-label="Ir a Mis Reservas"]');

    function actualizarAtajos() {
        if (linkInicio) linkInicio.setAttribute('accesskey', shortcutInicio);
        if (linkVehiculos) linkVehiculos.setAttribute('accesskey', shortcutVehiculos);
        if (linkReservar) linkReservar.setAttribute('accesskey', shortcutReservar);
        if (linkMisReservas) linkMisReservas.setAttribute('accesskey', shortcutMisReservas);
    }

    function verificarAtajosDuplicados() {
        const atajos = [
        ];

        if (shortcutInicioElement) {
            const nuevoShortcutInicio = document.getElementById('shortcutInicio').value.toLowerCase();
            atajos.push(nuevoShortcutInicio);
        }
        if (shortcutVehiculosElement) {
            const nuevoShortcutVehiculos = document.getElementById('shortcutVehiculos').value.toLowerCase();
            atajos.push(nuevoShortcutVehiculos);
        }
        if (shortcutReservarElement) {
            const nuevoShortcutReservar = document.getElementById('shortcutReservar').value.toLowerCase();
            atajos.push(nuevoShortcutReservar);
        }
        if (shortcutMisReservasElement) {
            const nuevoShortcutMisReservas = document.getElementById('shortcutMisReservas').value.toLowerCase();
            atajos.push(nuevoShortcutMisReservas);
        }

        const atajosUnicos = new Set(atajos);
        return atajosUnicos.size !== atajos.length; // true entonces hay duplicados
    }

    actualizarAtajos();

    function reactivarAtajos() {
        document.removeEventListener('keydown', onKeyDown);
        document.addEventListener('keydown', onKeyDown);

        function onKeyDown(event) {
            if (!event.altKey) return;
            const key = event.key.toLowerCase();
            if (key === shortcutInicio) {
                event.preventDefault();
                window.location.href = "/";
            } else if (key === shortcutVehiculos) {
                event.preventDefault();
                window.location.href = "/vehiculos";
            } else if (key === shortcutReservar) {
                event.preventDefault();
                window.location.href = "/reserva";
            } else if (key === shortcutMisReservas) {
                event.preventDefault();
                window.location.href = "/misReservas";
            }
        }
    }

    guardarCambiosBtn.addEventListener("click", () => {
        // Verificar si los atajos son duplicados
        if (verificarAtajosDuplicados()) {
            alert("No puedes asignar la misma tecla a varios atajos. Por favor, elige teclas diferentes.");
            return; // Evitar que continúe si hay duplicados
        }

        if (shortcutInicioElement) sessionStorage.setItem('shortcutInicio', shortcutInicioElement.value.toLowerCase());
        if (shortcutVehiculosElement) sessionStorage.setItem('shortcutVehiculos', shortcutVehiculosElement.value.toLowerCase());
        if (shortcutReservarElement) sessionStorage.setItem('shortcutReservar', shortcutReservarElement.value.toLowerCase());
        if (shortcutMisReservasElement) sessionStorage.setItem('shortcutMisReservas', shortcutMisReservasElement.value.toLowerCase());
        actualizarAtajos();
        reactivarAtajos();

        // Cerrar el modal
        if (modal) {
            const modalInstance = bootstrap.Modal.getInstance(modal);
            modalInstance.hide();
        }
        location.reload();
    });

    modal.addEventListener('hidden.bs.modal', () => {
        if (shortcutInicioElement) document.getElementById('shortcutInicio').value = initialShortcuts.inicio;
        if (shortcutVehiculosElement) document.getElementById('shortcutVehiculos').value = initialShortcuts.vehiculos;
        if (shortcutReservarElement) document.getElementById('shortcutReservar').value = initialShortcuts.reservar;
        if (shortcutMisReservasElement) document.getElementById('shortcutMisReservas').value = initialShortcuts.misReservas;
    });
    reactivarAtajos();
}

/* REGISTRO E INICIO DE SESIÓN */

function inicializarSignInUp() {
    const signInBtn = document.getElementById('signInBtn');
    const signUpBtn = document.getElementById('signUpBtn');

    if (signInBtn && signUpBtn) {
        signInBtn.addEventListener('click', function () {
            const signInForm = document.getElementById('signInForm');
            const signUpForm = document.getElementById('signUpForm');
            if (signInForm && signUpForm) {
                signInForm.style.display = 'block';
                signUpForm.style.display = 'none';
            }
        });

        signUpBtn.addEventListener('click', function () {
            const signInForm = document.getElementById('signInForm');
            const signUpForm = document.getElementById('signUpForm');
            if (signInForm && signUpForm) {
                signInForm.style.display = 'none';
                signUpForm.style.display = 'block';
            }
        });
    }
}

function validateSignUp() {
    const email = document.getElementById("signUpEmail").value;
    const emailError = document.getElementById("signUpEmailError");

    const password = document.getElementById("signUpPassword").value;
    const passwordError = document.getElementById("signUpPasswordError");

    const confirmPassword = document.getElementById("signUpConfirmPassword").value;
    const confirmPasswordError = document.getElementById("signUpConfirmPasswordError");

    let isValid = true;

    //Email
    const emailRegex = /^[a-zA-Z0-9._%+-]+@ucm\.(com|es)$/;

    if (!emailRegex.test(email)) {
        emailError.style.display = "block";
        isValid = false;
    } else {
        emailError.style.display = "none";
    }

    //Contraseña
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/;

    if (!passwordRegex.test(password)) {
        passwordError.style.display = "block";
        isValid = false;
    } else {
        passwordError.style.display = "none";
    }

    //Contraseñas coinciden
    if (password !== confirmPassword) {
        confirmPasswordError.style.display = "block";
        isValid = false;
    } else {
        confirmPasswordError.style.display = "none";
    }
    return isValid;
}

/* OTRAS FUNCIONALIDADES */

function reserveCar(matricula) {
    // Envía al usuario a reservas.html con ?car=MAT
    window.location.href = `../reserva?car=${encodeURIComponent(matricula)}`;
}

function mapaConcesionarios() {
    var map = L.map('map').setView([40.4168, -3.7038], 6);

    if (map) {
        const concesionariosData = JSON.parse(
            document.getElementById("data-concesionarios").textContent
        );

        L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 19,
            attribution: '&copy OpenStreetMap'
        }).addTo(map);

        let bounds = [];

        concesionariosData.forEach(c => {
            if (c.latitud && c.longitud) {
                const lat = parseFloat(c.latitud);
                const lng = parseFloat(c.longitud);

                L.marker([lat, lng])
                    .addTo(map)
                    .bindPopup(c.nombre);

                bounds.push([lat, lng]);
            }
        });
        if (bounds.length > 0) {
            map.fitBounds(bounds, { padding: [50, 50] });
        }

        navigator.geolocation.getCurrentPosition(pos => {
            const userLat = pos.coords.latitude;
            const userLng = pos.coords.longitude;

            L.marker([userLat, userLng])
                .addTo(map)
                .bindPopup("Tu ubicación")
                .openPopup();

            calcularDistancias(userLat, userLng, map);
        });

        function calcularDistancia(lat1, lon1, lat2, lon2) {
            const R = 6371;

            const dLat = (lat2 - lat1) * Math.PI / 180;
            const dLon = (lon2 - lon1) * Math.PI / 180;

            const a =
                Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                Math.cos(lat1 * Math.PI / 180) *
                Math.cos(lat2 * Math.PI / 180) *
                Math.sin(dLon / 2) * Math.sin(dLon / 2);

            const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

            return R * c;
        }

        function calcularDistancias(userLat, userLng, map) {
            concesionariosData.forEach(c => {
                if (c.latitud && c.longitud) {
                    const lat = parseFloat(c.latitud);
                    const lng = parseFloat(c.longitud);

                    const distancia = calcularDistancia(userLat, userLng, lat, lng);

                    L.marker([lat, lng])
                        .addTo(map)
                        .bindPopup(`
                    <strong>${c.nombre}</strong><br>
                    ${c.direccion}<br>
                    ${distancia.toFixed(2)} km
                `);
                }
            });
        }
    }
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
    inicializarAtajosTeclado();
    inicializarLanguageToggle();
    inicializarTema();
    inicializarTamanoLetra();
    inicializarSignInUp();
    mapaConcesionarios();

    const path = window.location.pathname;
    const params = new URLSearchParams(window.location.search);

    if (path.includes("reserva")) {
        const matricula = params.get("car");
        inicializarFormularioReservas();
        if (matricula) {
            const selectVehiculo = document.getElementById("vehiculo");
            if (selectVehiculo) selectVehiculo.value = matricula;
        }
    }
    else if (path.includes("admin")) {
        toggleFormulario();
    }
});