let settings = {
    theme: "light",
    lang: "es",
    fontSize: 1.2,
    shortcuts: {
        inicio: "i",
        vehiculos: "v",
        reservar: "r",
        misReservas: "m",
        admin: "a",
        ajustes: "s"
    }
};

/* MANEJO DE ACCESIBILIDAD PERSISTENTE EN BD */
function actualizarSettings(partial) {
    settings = {
        ...settings,
        ...partial,
        shortcuts: {
            ...settings.shortcuts,
            ...(partial.shortcuts || {})
        }
    };

    aplicarAccesibilidad();
    guardarAccesibilidad(settings);
}

async function cargarAccesibilidad() {
    let dbSettings = null;

    try {
        const res = await fetch("/api/user/accesibilidad");
        dbSettings = await res.json();
    } catch (e) { }

    const local = JSON.parse(
        localStorage.getItem("accesibilidad") || "null"
    );

    const defaults = {
        theme: "light",
        lang: "es",
        fontSize: 1.2,
        shortcuts: {
            inicio: "i",
            vehiculos: "v",
            reservar: "r",
            misReservas: "m",
            admin: "a",
            ajustes: "s"
        }
    };

    settings = dbSettings || local || defaults;

    localStorage.setItem(
        "accesibilidad",
        JSON.stringify(settings)
    );

    return settings;
}

function aplicarAccesibilidad() {
    document.documentElement.setAttribute(
        "data-bs-theme",
        settings.theme
    );

    document.documentElement.lang = settings.lang;

    document.documentElement.style.setProperty(
        "--font-scale",
        parseFloat(settings.fontSize)
    );

    const keyMap = {
        shortcutInicio: "inicio",
        shortcutVehiculos: "vehiculos",
        shortcutReservar: "reservar",
        shortcutMisReservas: "misReservas",
        shortcutAdmin: "admin",
        shortcutAjustes: "ajustes"
    };

    document.querySelectorAll(".form-control[id^='shortcut']")
        .forEach((input) => {

            const key = keyMap[input.id];
            const value = settings.shortcuts?.[key];

            if (value !== undefined) {
                input.value = value;
            }
        });
}

async function guardarAccesibilidad(settings) {
    // localStorage 
    console.log(JSON.stringify(settings));
    localStorage.setItem(
        "accesibilidad",
        JSON.stringify(settings)
    );

    // base de datos
    await fetch("/api/user/accesibilidad", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(settings)
    });
}

/* SHORTCUTS */
function hayDuplicados(shortcuts) {
    const values = Object.values(shortcuts)
        .map(v => v.toLowerCase().trim())
        .filter(v => v !== "");

    return new Set(values).size !== values.length;
}

function validarShortcuts() {
    const inputs = document.querySelectorAll(".form-control[id^='shortcut']");
    const values = [];
    let hayDuplicados = false;

    inputs.forEach(input => {
        input.classList.remove("is-invalid");
        const value = input.value.toLowerCase().trim();
        if (!value) return;
        if (values.includes(value)) {
            hayDuplicados = true;
            input.classList.add("is-invalid");
        } else {
            values.push(value);
        }
    });

    return !hayDuplicados;
}

function inicializarDefaultsShortcuts() {
    const defaults = {
        shortcutInicio: "i",
        shortcutVehiculos: "v",
        shortcutReservar: "r",
        shortcutMisReservas: "m",
        shortcutAdmin: "a",
        shortcutAjustes: "s"
    };

    Object.entries(defaults).forEach(([key, value]) => {
        if (!localStorage.getItem(key)) {
            localStorage.setItem(key, value);
        }
    });
}

function inicializarAtajosTeclado() {
    const shortcuts = settings.shortcuts;

    const fields = [
        "inicio",
        "vehiculos",
        "reservar",
        "misReservas",
        "admin",
        "ajustes"
    ];

    fields.forEach(name => {
        const el = document.getElementById(`shortcut${name}`);
        const key = name.charAt(0).toLowerCase() + name.slice(1);
        const value = shortcuts[key];
        if (el && value !== undefined) {
            el.value = value;
        }
    });

    document
        .querySelectorAll(".form-control[id^='shortcut']")
        .forEach((input) => {

            input.addEventListener("input", (e) => {

                const id = e.target.id.replace("shortcut", "").toLowerCase();
                const value = e.target.value.toLowerCase();

                if (!validarShortcuts()) return;

                actualizarSettings({
                    shortcuts: {
                        ...settings.shortcuts,
                        [id]: value
                    }
                });
            });

        });

    document.addEventListener("keydown", (event) => {
        const key = event.key.toLowerCase();

        const tag = event.target.tagName;
        if (tag === "INPUT" || tag === "TEXTAREA") return;

        if (!validarShortcuts()) return;

        const s = settings.shortcuts;

        /* CTRL SHORTCUTS */
        if (event.ctrlKey) {
            if (key === s.admin) {
                event.preventDefault();
                window.location.href = "/admin";
                return;
            }

            else if (key === s.ajustes) {
                event.preventDefault();
                const modal = document.getElementById("ajustesModal");
                bootstrap.Modal.getOrCreateInstance(modal).show();
                return;
            }

            else if (key === s.inicio) {
                event.preventDefault();
                window.location.href = "/";
            }

            else if (key === s.vehiculos) {
                event.preventDefault();
                window.location.href = "/vehiculos";
            }

            else if (key === s.reservar) {
                event.preventDefault();
                window.location.href = "/reserva";
            }

            else if (key === s.misReservas) {
                event.preventDefault();
                window.location.href = "/misReservas";
            }

            return;
        }
    });
}

/* IDIOMA */
function actualizarTextoUI(lang, label) {
    if (!label) return;
    label.textContent = lang === "en" ? "English" : "Español";
}

function inicializarLanguageToggle() {
    const idiomaSeleccionado =
        document.getElementById("idiomaSeleccionado");
    const languageLinks =
        document.querySelectorAll(".dropdown-item");
    const savedLang =
        settings.lang || "es";
    actualizarTextoUI(savedLang, idiomaSeleccionado);

    languageLinks.forEach(link => {
        link.addEventListener("click", (e) => {
            e.preventDefault();
            const lang =
                link.getAttribute("data-lang");
            actualizarSettings({ lang });
            actualizarTextoUI(lang, idiomaSeleccionado);
        });
    });
}

/* TEMA */
function inicializarTema() {
    // sincronizar radio con tema actual
    const radio = document.querySelector(
        `input[name="tema"][value="${settings.theme}"]`
    );

    if (radio) radio.checked = true;

    // cambio inmediato
    document
        .querySelectorAll('input[name="tema"]')
        .forEach(r => {

            r.addEventListener("change", (e) => {

                const theme = e.target.value;

                actualizarSettings({ theme });
            });
        });
}

/* TAMAÑO DE LA LETRA */
function actualizarLabel(size, label) {
    if (!label) return;
    label.textContent = `${size}rem`;
}

function inicializarTamanoLetra() {
    const range = document.getElementById("fontSizeRange");

    const valueLabel = document.getElementById("fontSizeValue");

    const savedSize = settings.fontSize || 1.2;
    range.value = savedSize;
    actualizarLabel(savedSize, valueLabel);

    range.addEventListener("input", (e) => {
        const size = e.target.value;
        actualizarSettings({ fontSize: size });
        actualizarLabel(size, valueLabel);
    });
}

document.addEventListener("DOMContentLoaded", async () => {
    await cargarAccesibilidad();
    aplicarAccesibilidad();

    inicializarAtajosTeclado();
    inicializarLanguageToggle();
    inicializarTema();
    inicializarTamanoLetra();
});