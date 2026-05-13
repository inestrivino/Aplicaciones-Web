/* IDIOMA */
function aplicarIdioma(lang) {
    document.documentElement.lang = lang;
}

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
        localStorage.getItem("lang") || "es";
    aplicarIdioma(savedLang);
    actualizarTextoUI(savedLang, idiomaSeleccionado);

    languageLinks.forEach(link => {
        link.addEventListener("click", (e) => {
            e.preventDefault();
            const lang =
                link.getAttribute("data-lang");

            localStorage.setItem("lang", lang);
            aplicarIdioma(lang);
            actualizarTextoUI(lang, idiomaSeleccionado);
        });
    });
}

/* TEMA */
function applyTheme(theme) {

    document.documentElement.setAttribute(
        "data-bs-theme",
        theme
    );
}

function inicializarTema() {
    const savedTheme =
        localStorage.getItem("theme") || "light";

    applyTheme(savedTheme);

    // sincronizar radio con tema actual
    const radio = document.querySelector(
        `input[name="tema"][value="${savedTheme}"]`
    );

    if (radio) radio.checked = true;

    // cambio inmediato
    document
        .querySelectorAll('input[name="tema"]')
        .forEach(r => {

            r.addEventListener("change", (e) => {

                const theme = e.target.value;

                applyTheme(theme);

                localStorage.setItem("theme", theme);
            });
        });
}

/* TAMAÑO DE LA LETRA */
function aplicarTamanoFuente(size) {
    document.documentElement.style.fontSize =
        `${size}rem`;
}

function actualizarLabel(size, label) {
    if (!label) return;
    label.textContent = `${size}rem`;
}

function inicializarTamanoLetra() {
    const range = document.getElementById("fontSizeRange");

    const valueLabel = document.getElementById("fontSizeValue");

    const savedSize = localStorage.getItem("fontSize") || "1.2";

    aplicarTamanoFuente(savedSize);
    range.value = savedSize;
    actualizarLabel(savedSize, valueLabel);

    range.addEventListener("input", (e) => {
        const size = e.target.value;
        aplicarTamanoFuente(size);
        actualizarLabel(size, valueLabel);
        localStorage.setItem("fontSize", size);
    });
}

/* SHORTCUTS */

function obtenerShortcuts() {
    return {
        inicio: localStorage.getItem("shortcutInicio") || "i",
        vehiculos: localStorage.getItem("shortcutVehiculos") || "v",
        reservar: localStorage.getItem("shortcutReservar") || "r",
        misReservas: localStorage.getItem("shortcutMisReservas") || "m",
        admin: localStorage.getItem("shortcutAdmin") || "a",
        ajustes: localStorage.getItem("shortcutAjustes") || "s"
    };
}

function guardarShortcut(nombre, valor) {
    localStorage.setItem(`shortcut${nombre}`, valor.toLowerCase());
}

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
    const shortcuts = obtenerShortcuts();

    const fields = [
        "Inicio",
        "Vehiculos",
        "Reservar",
        "MisReservas",
        "Admin",
        "Ajustes"
    ];

    fields.forEach(name => {
        const el = document.getElementById(`shortcut${name}`);
        const key = name.charAt(0).toLowerCase() + name.slice(1);
        const value = shortcuts[key];
        if (el && value !== undefined) {
            el.value = value;
        }
    });

    document.querySelectorAll(".form-control[id^='shortcut']")
        .forEach(input => {

            input.addEventListener("input", (e) => {

                const id = e.target.id.replace("shortcut", "");
                const value = e.target.value.toLowerCase();

                guardarShortcut(id, value);
                validarShortcuts();
            });
        });

    document.addEventListener("keydown", (event) => {

        const key = event.key.toLowerCase();

        const tag = event.target.tagName;
        if (tag === "INPUT" || tag === "TEXTAREA") return;

        if (!validarShortcuts()) return;

        const s = obtenerShortcuts();

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

document.addEventListener("DOMContentLoaded", function () {
    inicializarDefaultsShortcuts();
    inicializarAtajosTeclado();
    inicializarLanguageToggle();
    inicializarTema();
    inicializarTamanoLetra();
});