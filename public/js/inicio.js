import { fetchConcesionarios } from './ajax.js';
import { fetchUser } from './ajax.js';
import { mostrarFeedbackModal } from './ui.js';

/* RENDER DE REGISTRO E INICIO DE SESION */
async function cargarConcesionariosSelect() {
    const select = document.getElementById("signUpDealer");
    if (!select) return;
    const concesionarios = await fetchConcesionarios();
    const valorActual = select.value || "";

    select.innerHTML = `
        <option disabled value="">
            Seleccione un concesionario
        </option>
    `;

    let encontrado = false;

    concesionarios.forEach(c => {
        const option = document.createElement("option");
        option.value = c.id;
        option.textContent = c.nombre;

        if (c.id == valorActual) {
            option.selected = true;
            encontrado = true;
        }

        select.appendChild(option);
    });

    if (!encontrado) {
        select.value = "";
    }
}

function inicializarSignInUp() {
    const signInBtn = document.getElementById('signInBtn');
    const signUpBtn = document.getElementById('signUpBtn');
    let intervalSelect = null;

    if (signInBtn && signUpBtn) {
        signInBtn.addEventListener('click', function () {
            const signInForm = document.getElementById('signInForm');
            const signUpForm = document.getElementById('signUpForm');

            if (signInForm && signUpForm) {
                signInForm.style.display = 'block';
                signUpForm.style.display = 'none';

                if (intervalSelect) {
                    clearInterval(intervalSelect);
                    intervalSelect = null;
                }
            }
        });
        signUpBtn.addEventListener('click', async function () {
            const signInForm = document.getElementById('signInForm');
            const signUpForm = document.getElementById('signUpForm');

            if (signInForm && signUpForm) {
                signInForm.style.display = 'none';
                signUpForm.style.display = 'block';

                await cargarConcesionariosSelect();
                if (!intervalSelect) {
                    intervalSelect = setInterval(cargarConcesionariosSelect, 10000);
                }
            }
        });

        document.getElementById("signUpForm")
            .querySelector("form")
            .addEventListener("submit", async (e) => {
                e.preventDefault();

                const form = e.target;

                const body = {
                    signUpName: form.signUpName.value,
                    signUpEmail: form.signUpEmail.value,
                    signUpPassword: form.signUpPassword.value,
                    signUpConfirmPassword: form.signUpConfirmPassword.value,
                    signUpDealer: form.signUpDealer.value
                };

                try {
                    const res = await fetch("/user/register", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify(body)
                    });

                    const data = await res.json();

                    if (!res.ok || !data.ok) {
                        throw new Error(data.error);
                    }

                    if (data.ok) {
                        mostrarFeedbackModal(data.message, "success");

                        setTimeout(() => {
                            window.location.reload();
                        }, 500);
                    }

                    form.reset();

                } catch (err) {
                    mostrarFeedbackModal(err.message, "danger");
                }
            });

        document.getElementById("signInForm")
            .querySelector("form")
            .addEventListener("submit", async (e) => {
                e.preventDefault();

                const form = e.target;

                const body = {
                    signInEmail: form.signInEmail.value,
                    signInPassword: form.signInPassword.value
                };

                try {
                    const res = await fetch("user/login", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify(body)
                    });

                    const data = await res.json();

                    if (!res.ok || !data.ok) {
                        throw new Error(data.error);
                    }

                    mostrarFeedbackModal("Login correcto", "success");
                    window.location.reload();

                } catch (err) {
                    mostrarFeedbackModal(err.message, "danger");
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

/* RENDER DEL MAPA DE CONCESIONARIOS */
function calcularDistancia(lat1, lon1, lat2, lon2) {
    const R = 6371; //Radio de la tierra en km para calcular la disancia

    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;

    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) *
        Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; //resultado se devuelve en km
}

function pintarConcesionarios(concesionariosData, map, markersLayer, userLocation, primeraCarga) {
    markersLayer.clearLayers();

    const bounds = [];

    concesionariosData.forEach(c => {
        if (c.latitud && c.longitud) {
            const lat = parseFloat(c.latitud);
            const lng = parseFloat(c.longitud);

            let distanciaTexto = "";

            if (userLocation) {
                const distancia = calcularDistancia(
                    userLocation.lat,
                    userLocation.lng,
                    lat,
                    lng
                );

                distanciaTexto = `<br>${distancia.toFixed(2)} km`;
            }

            L.marker([lat, lng])
                .bindPopup(`
                    <strong>${c.nombre}</strong><br>
                    ${c.direccion || ""}
                    ${distanciaTexto}
                `)
                .addTo(markersLayer);

            bounds.push([lat, lng]);
        }
    });

    if (primeraCarga && bounds.length > 0) {
        map.fitBounds(bounds, { padding: [50, 50] });
    }
}

async function mapaConcesionarios() {
    const map = L.map('map').setView([40.4168, -3.7038], 6);
    const markersLayer = L.layerGroup().addTo(map);

    let userLocation = null;
    let primeraCarga = true;
    let concesionariosCache = [];

    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy OpenStreetMap'
    }).addTo(map);

    async function cargarYActualizar() {
        const data = await fetchConcesionarios();
        concesionariosCache = data;

        pintarConcesionarios(
            data,
            map,
            markersLayer,
            userLocation,
            primeraCarga
        );

        primeraCarga = false;
    }

    await cargarYActualizar();
    setInterval(cargarYActualizar, 10000);

    navigator.geolocation.getCurrentPosition(pos => {
        userLocation = {
            lat: pos.coords.latitude,
            lng: pos.coords.longitude
        };

        L.marker([userLocation.lat, userLocation.lng])
            .addTo(map)
            .bindPopup("Tu ubicación");

        pintarConcesionarios(
            concesionariosCache,
            map,
            markersLayer,
            userLocation,
            false
        );
    });
}

/* RENDER DE PERFIL */
function renderUserForm(user, concesionarios) {
    return `
    <form id="profileForm">

      <div class="mb-3">
        <label class="form-label">Nombre</label>
        <input type="text" class="form-control" name="name" value="${user.name}" required>
      </div>

      <div class="mb-3">
        <label class="form-label">Correo electrónico</label>
        <input type="email" class="form-control" name="email" value="${user.email}" required>
      </div>

      <div class="mb-3">
        <label class="form-label">Concesionario</label>
        <select class="form-select" name="id_concesionario" required>
          ${concesionarios.map(c => `
            <option value="${c.id}" ${c.id === user.id_concesionario ? 'selected' : ''}>
              ${c.nombre}
            </option>
          `).join('')}
        </select>
      </div>

      <button type="submit" class="btn btn-primary w-100">
        Guardar cambios
      </button>

    </form>
    `;
}

async function inicializarUserForm() {
    try {
        const [user, concesionarios] = await Promise.all([
            fetchUser(),
            fetchConcesionarios()
        ]);

        if (!user || !user.id) {
            console.warn("Usuario no autenticado, no se renderiza perfil");
            return;
        }

        document.getElementById("form-container").innerHTML =
            renderUserForm(user, concesionarios);

        const form = document.getElementById("profileForm");

        form.addEventListener("submit", async (e) => {
            e.preventDefault();

            const data = {
                name: form.name.value,
                email: form.email.value,
                id_concesionario: form.id_concesionario.value
            };

            try {
                const res = await fetch("/api/user/updateProfile", {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(data)
                });

                const json = await res.json();

                if (!res.ok || !json.ok) {
                    throw new Error(json.error || "Error al actualizar perfil");
                }

                mostrarFeedbackModal("Perfil actualizado correctamente", "success");

            } catch (err) {
                console.error(err);
                mostrarFeedbackModal(err.message, "danger");
            }
        });

    } catch (error) {
        console.error("Error cargando datos:", error);
        mostrarFeedbackModal("Error cargando perfil", "danger");
    }
}

/* CAMPANA DE ALERTA */

document.addEventListener("DOMContentLoaded", function () {
    inicializarSignInUp();
    inicializarUserForm();

    if (document.getElementById("map-container")) {
        mapaConcesionarios();
    }
    if (document.getElementById("signUpFormReal")) {
        document.getElementById("signUpFormReal")
            .addEventListener("submit", function (e) {
                if (!validateSignUp()) {
                    e.preventDefault();
                }
            });
    }
});