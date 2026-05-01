/* FUNCIONES AQUÍ:
- CARGAR CONCESIONARIOS PARA EL SELECT DE REGISTRO
- INICIALIZAR EL SIGN IN Y EL UP
- VALIDACIÓN DE DATOS ENVIADOS AL HACER SIGNUP

- INICIALIZAR EL FORMULARIO DE RESERVAS
- FUNCION PARA ENVIAR AL USUARIO DIRECTAMENTE A LA PANTALLA DE RESERVA CUANDO SELECCIONA UN COCHE

- FUNCIÓN PARA CALCULAR LA DISTANCIA ENTRE DOS PUNTOS
- FUNCIÓN PARA PINTAR CONCESIONARIOS EN UN MAPA
- FUNCION PARA MOSTRAR EL MAPA DE CONCESIONARIOS
*/

import { fetchConcesionarios } from './ajax.js';
import { fetchVehiculos } from './ajax.js';
import { fetchFechasOcupado } from './ajax.js';
import { fetchMisReservas } from './ajax.js';
import { fetchFiltros } from './ajax.js';
import { fetchImagenesVehiculos } from './ajax.js';
import { fetchUsuarios } from './ajax.js';
import { fetchEstadisticas } from './ajax.js';
import { fetchIncidencias } from './ajax.js';

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

/* RENDER DEL FORMULARIO PARA RESERVAR */
async function cargarVehiculosSelect() {
    const select = document.getElementById("vehiculo");
    if (!select) return;

    const vehiculos = await fetchVehiculos();
    const valorActual = select.value || "";

    select.innerHTML = `
        <option value="" ${valorActual === "" ? "selected" : ""}>
            Seleccione un vehículo
        </option>
    `;

    let encontrado = false;

    vehiculos.forEach(v => {
        const option = document.createElement("option");
        option.value = v.matricula;
        option.textContent = `${v.matricula} - ${v.modelo || ""}`;

        if (v.matricula === valorActual) {
            option.selected = true;
            encontrado = true;
        }

        select.appendChild(option);
    });

    if (!encontrado) {
        select.value = "";
    }
}

async function inicializarFormularioReservas() {
    const inicioInput = document.getElementById("inicioFecha");
    const finInput = document.getElementById("finFecha");
    const matriculaInput = document.getElementById("vehiculo");
    let intervalVehiculos = null;

    if (!inicioInput || !finInput || !matriculaInput) return;

    await cargarVehiculosSelect();

    if (!intervalVehiculos) {
        intervalVehiculos = setInterval(async () => {
            const prev = matriculaInput.value;

            await cargarVehiculosSelect();

            if (matriculaInput.value !== prev) {
                matriculaInput.dispatchEvent(new Event("change"));
            }
        }, 10000);
    }

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

    async function cargarFechas() {
        if (!matriculaInput.value) return;

        const reservas = await fetchFechasOcupado(matriculaInput.value);

        rangosOcupados = reservas.map(r => ({
            from: r.fecha_ini.split("T")[0],
            to: r.fecha_fin.split("T")[0]
        }));

        fpInicio.set("disable", rangosOcupados);
        fpFin.set("disable", rangosOcupados);
    }

    matriculaInput.addEventListener("change", async () => {
        inicioInput.value = "";
        finInput.value = "";

        await cargarFechas();
    });

    setInterval(() => {
        if (matriculaInput.value) {
            cargarFechas();
        }
    }, 10000);

    document.querySelector("form").addEventListener("submit", (e) => {
        if (!inicioInput.value || !finInput.value) {
            e.preventDefault();
            alert("Debes seleccionar ambas fechas de reserva.");
        }
    });
}

function reserveCar(matricula) {
    // Envía al usuario a reservas.html con ?car=MAT
    window.location.href = `../reserva?car=${encodeURIComponent(matricula)}`;
}

/* RENDER DE LAS RESERVAS DEL USUARIO */
function renderCards(lista, tipo) {
    if (!lista.length) {
        return `<div class="alert alert-info">
            No tienes reservas ${tipo === "curso" ? "en curso" : tipo === "proximas" ? "próximas" : "pasadas"}.
        </div>`;
    }

    return `
        <div class="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">
            ${lista.map(r => cardReserva(r, tipo)).join("")}
        </div>
    `;
}

function cardReserva(r, tipo) {
    return `
    <div class="col">
        <div class="card h-100">
            <img src="${r.vehiculo_imagen}" class="card-img-top img-fluid"
                style="height:200px; object-fit:cover;">

            <div class="card-body">
                <h5>${r.vehiculo_modelo}</h5>
                <h6>${r.fecha_ini} - ${r.fecha_fin}</h6>

                <ul class="list-unstyled">
                    <li><strong>Matrícula:</strong> ${r.matricula}</li>
                    <li><strong>Concesionario:</strong> ${r.concesionario_nombre}</li>
                </ul>

                ${renderAcciones(r, tipo)}
            </div>
        </div>
    </div>
    `;
}

function renderAcciones(r, tipo) {
    if (tipo === "curso") {
        return `
            <button class="btn btn-warning w-100">Devolver vehículo</button>
            <button class="btn btn-danger w-100">Reportar incidencia</button>
        `;
    }

    if (tipo === "proximas") {
        return `
            <button class="btn btn-danger w-100">Cancelar reserva</button>
        `;
    }

    if (tipo === "pasadas") {
        return `
            <p class="text-muted">Reserva finalizada</p>
        `;
    }

    return "";
}

function renderReservas(reservas) {
    const curso = document.getElementById("curso");
    const proximas = document.getElementById("proximas");
    const pasadas = document.getElementById("pasadas");

    const enCurso = [];
    const futuras = [];
    const pasadasArr = [];

    const hoy = new Date();

    reservas.forEach(r => {
        const inicio = new Date(r.fecha_ini);
        const fin = new Date(r.fecha_fin);

        if (inicio <= hoy && fin >= hoy) {
            enCurso.push(r);
        } else if (inicio > hoy) {
            futuras.push(r);
        } else {
            pasadasArr.push(r);
        }
    });

    curso.innerHTML = renderCards(enCurso, "curso");
    proximas.innerHTML = renderCards(futuras, "proximas");
    pasadas.innerHTML = renderCards(pasadasArr, "pasadas");
}

async function inicializarMisReservas() {
    let intervalReservas = null;
    const cargar = async () => {
        const reservas = await fetchMisReservas();
        renderReservas(reservas);
    };
    await cargar();
    if (!intervalReservas) {
        intervalReservas = setInterval(cargar, 10000); // cada 10s
    }
}

/* RENDER DE LOS VEHICULOS Y FILTROS */
//funcion auxiliar para crear selects
function crearSelect(id, label, options) {
    return `
        <div class="mb-3">
            <label class="form-label"><strong>${label}</strong></label>
            <select id="${id}" class="form-select filtro">
                <option value="">Sin filtro</option>
                ${options.map(o => `<option value="${o.value}">${o.text}</option>`).join('')}
            </select>
        </div>
    `;
}

//funcion auxiliar para obtener los filtros seleccionados por el usuario
function obtenerFiltrosSeleccionados() {
    return {
        marcaSelect: document.getElementById('marcaSelect')?.value || "",
        colorSelect: document.getElementById('colorSelect')?.value || "",
        concesionarioSelect: document.getElementById('concesionarioSelect')?.value || "",
        autonomiaSelect: document.getElementById('autonomiaSelect')?.value || "",
        ciudadSelect: document.getElementById('ciudadSelect')?.value || "",
        plazasSelect: document.getElementById('plazasSelect')?.value || ""
    };
}

//funcion para renderizar los filtros posibles
async function renderFiltros() {
    const container = document.getElementById('filtrosForm');

    try {
        const data = await fetchFiltros();

        if (!data) {
            container.innerHTML = `<p class="text-danger">Error cargando filtros</p>`;
            return;
        }

        const { marcas, colores, plazas, concesionarios, ciudades } = data;

        container.innerHTML = `
            ${crearSelect("marcaSelect", "Marca", marcas.map(m => ({ value: m.marca, text: m.marca })))}

            <div class="mb-3">
                <label class="form-label"><strong>Autonomía (km)</strong></label>
                <select id="autonomiaSelect" class="form-select filtro">
                    <option value="">Sin filtro</option>
                    <option value="500">Más de 500 km</option>
                    <option value="400">400 - 499 km</option>
                    <option value="300">300 - 399 km</option>
                    <option value="200">Menos de 300 km</option>
                </select>
            </div>

            ${crearSelect("concesionarioSelect", "Concesionario", concesionarios.map(c => ({ value: c.id, text: c.nombre })))}

            ${crearSelect("ciudadSelect", "Ciudad", ciudades.map(c => ({ value: c.ciudad, text: c.ciudad })))}

            ${crearSelect("plazasSelect", "Plazas", plazas.map(p => ({ value: p.plazas, text: p.plazas })))}

            ${crearSelect("colorSelect", "Color", colores.map(c => ({ value: c.color, text: c.color })))}
        `;

        activarEventosFiltros();

    } catch (error) {
        console.error('Error renderizando filtros:', error);
    }
}

//re-renderizar los vehiculos cada vez que se cambian los filtros seleccionados
function activarEventosFiltros() {
    const selects = document.querySelectorAll('.filtro');

    selects.forEach(select => {
        select.addEventListener('change', () => {
            const filtros = obtenerFiltrosSeleccionados();
            renderVehiculos(filtros);
        });
    });
}

//renderizar los vehiculos
async function renderVehiculos() {
    const container = document.getElementById('vehiculosContainer');

    // Limpiar contenido previo
    container.innerHTML = '';

    try {
        let filtros = obtenerFiltrosSeleccionados();
        const vehiculos = await fetchVehiculos(filtros);

        container.innerHTML = '';

        if (vehiculos.length === 0) {
            container.innerHTML = `<p class="text-center">No hay vehículos disponibles</p>`;
            return;
        }

        if (vehiculos.length === 0) {
            container.innerHTML = `<p class="text-center">No hay vehículos disponibles</p>`;
            return;
        }

        vehiculos.forEach(vehiculo => {
            const card = document.createElement('div');
            card.className = 'col';

            card.innerHTML = `
                <div class="card h-100 shadow-sm d-flex flex-column">
                    <img src="${vehiculo.imagen || '/img/default-car.jpg'}" 
                         class="card-img-top img-cover" style="object-fit: cover"
                         alt="${vehiculo.marca} ${vehiculo.modelo}">
                    
                    <div class="card-body">
                        <h5 class="card-title">${vehiculo.marca} ${vehiculo.modelo}</h5>
                        
                        <p class="card-text mb-1">
                            <strong>Autonomía:</strong> ${vehiculo.autonomia} km
                        </p>
                        <p class="card-text mb-1">
                            <strong>Plazas:</strong> ${vehiculo.plazas}
                        </p>
                        <p class="card-text mb-1">
                            <strong>Color:</strong> ${vehiculo.color}
                        </p>
                        <p class="card-text">
                            <strong>Concesionario:</strong> ${vehiculo.concesionario}
                        </p>
                    </div>

                    <div class="card-footer bg-white border-0 mt-auto">
                        <button 
                            class="btn btn-primary w-100"
                            onclick="reserveCar('${vehiculo.matricula}')">
                            Reservar
                        </button>
                    </div>
                </div>
            `;

            container.appendChild(card);
        });

    } catch (error) {
        console.error('Error renderizando vehículos:', error);
        container.innerHTML = `<p class="text-danger">Error cargando vehículos</p>`;
    }
}

//inicializar los vehiculos
function inicializarVehiculos() {
    renderVehiculos();
    renderFiltros();
}

/* RENDER DEL MAPA DE CONCESIONARIOS */
function calcularDistancia(lat1, lon1, lat2, lon2) {
    const R = 6371; // Radio de la Tierra en km

    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;

    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) *
        Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // distancia en km
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

        // 🔥 recalcular TODO con distancias
        pintarConcesionarios(
            concesionariosCache,
            map,
            markersLayer,
            userLocation,
            false
        );
    });
}

/* RENDER DEL ADMINISTRADOR */
//CONCESIONARIOS
async function renderTablaConcesionarios() {
    concesionarios = await fetchConcesionarios();
    const tbody = document.querySelector('#tabla-concesionarios tbody');

    tbody.innerHTML = concesionarios.map(c => `
        <tr>
            <td>${c.id}</td>

            <td class="d-sm-table-cell">
                <input class="form-control form-control-sm" type="text" name="nombre" value="${c.nombre}">
            </td>

            <td class="d-sm-table-cell">
                <input class="form-control form-control-sm" type="text" name="ciudad" value="${c.ciudad}">
            </td>

            <td class="d-md-table-cell">
                <input class="form-control form-control-sm" type="text" name="direccion" value="${c.direccion}">
            </td>

            <td>
                <input class="form-control form-control-sm" type="text" name="latitud" value="${c.latitud || ''}">
            </td>

            <td>
                <input class="form-control form-control-sm" type="text" name="longitud" value="${c.longitud || ''}">
            </td>

            <td class="d-md-table-cell">
                <input class="form-control form-control-sm" type="text" name="telefono" value="${c.telefono}">
            </td>

            <td>
                <button class="btn btn-sm btn-secondary mb-1" onclick="updateConcesionario(${c.id}, this)">Modificar</button>
                <button class="btn btn-sm btn-danger" onclick="deleteConcesionario(${c.id})">Eliminar</button>
            </td>
        </tr>
    `).join('');
}

//VEHICULOS
async function renderTablaVehiculos() {
    const [vehiculos, concesionarios, imagenesVehiculos] = await Promise.all([
        fetchVehiculos(),
        fetchConcesionarios(),
        fetchImagenesVehiculos()
    ]);

    const tbody = document.querySelector('#tabla-vehiculos tbody');
    if (!tbody) return;

    tbody.innerHTML = vehiculos.map(v => {

        const imagenBD = (v.imagen || '').split('/').pop().trim();

        const opcionesConcesionarios = concesionarios.map(c => `
            <option value="${c.id}" ${c.id === v.id_concesionario ? 'selected' : ''}>
                ${c.nombre} (${c.ciudad})
            </option>
        `).join('');

        const opcionesImagenes = imagenesVehiculos.map(img => `
            <option value="${img}" ${imagenBD === img.trim() ? 'selected' : ''}>
                ${img}
            </option>
        `).join('');

        return `
        <tr>
            <td>${v.matricula}</td>

            <td><input class="form-control form-control-sm" name="marca" value="${v.marca}"></td>
            <td><input class="form-control form-control-sm" name="modelo" value="${v.modelo}"></td>
            <td><input class="form-control form-control-sm" type="date" name="fecha" value="${v.fecha || ''}"></td>
            <td><input class="form-control form-control-sm" type="number" name="plazas" value="${v.plazas}"></td>
            <td><input class="form-control form-control-sm" type="number" name="autonomia" value="${v.autonomia}"></td>
            <td><input class="form-control form-control-sm" name="color" value="${v.color}"></td>

            <td>
                <select class="form-select form-select-sm" name="id_concesionario">
                    ${opcionesConcesionarios}
                </select>
            </td>

            <td>
                <select class="form-select form-select-sm" name="imagen">
                    ${opcionesImagenes}
                </select>
            </td>

            <td>
                <button class="btn btn-sm btn-secondary"
                        onclick="updateVehiculo('${v.matricula}', this)">
                    Modificar
                </button>

                <button class="btn btn-sm btn-danger"
                        onclick="deleteVehiculo('${v.matricula}')">
                    Eliminar
                </button>
            </td>
        </tr>
        `;
    }).join('');
}

//USUARIOS
async function renderTablaUsuarios() {
    const [usuarios, concesionarios] = await Promise.all([
        fetchUsuarios(),
        fetchConcesionarios()
    ]);

    const tbody = document.querySelector('#tabla-usuarios tbody');
    if (!tbody) return;

    tbody.innerHTML = usuarios.map(u => {

        const opcionesConcesionarios = concesionarios.map(c => `
            <option value="${c.id}" ${c.id === u.id_concesionario ? 'selected' : ''}>
                ${c.nombre} (${c.ciudad})
            </option>
        `).join('');

        return `
        <tr>
            <td>${u.id}</td>

            <td>
                <input class="form-control form-control-sm"
                       type="text"
                       name="name"
                       value="${u.name}">
            </td>

            <td>
                <input class="form-control form-control-sm"
                       type="text"
                       name="email"
                       value="${u.email}">
            </td>

            <td>
                <select class="form-select form-select-sm" name="rol">
                    <option value="admin" ${u.rol === 'admin' ? 'selected' : ''}>admin</option>
                    <option value="user" ${u.rol === 'user' ? 'selected' : ''}>user</option>
                </select>
            </td>

            <td>
                <select class="form-select form-select-sm" name="id_concesionario">
                    ${opcionesConcesionarios}
                </select>
            </td>

            <td>
                <button class="btn btn-sm btn-secondary"
                        onclick="updateUsuario(${u.id}, this)">
                    Modificar
                </button>

                <button class="btn btn-sm btn-danger"
                        onclick="deleteUsuario(${u.id})">
                    Eliminar
                </button>
            </td>
        </tr>
        `;
    }).join('');
}

//ESTADISTICAS
async function renderEstadisticas() {
    const data = await fetchEstadisticas();
    if (!data) return;

    console.log(data);

    const {
        topConcesionarios,
        topVehiculos,
        mediaVehiculos,
        kmVehiculos
    } = data;

    // --------------------------
    // Concesionarios
    // --------------------------
    document.querySelector('#stats-concesionarios').innerHTML =
        topConcesionarios?.length
            ? topConcesionarios.map(c => `
                <li class="list-group-item d-flex justify-content-between">
                    <strong>${c.nombre}</strong>
                    <span class="badge bg-info text-dark">${c.total_reservas} reservas</span>
                </li>
            `).join('')
            : `<p>No hay datos disponibles.</p>`;

    // --------------------------
    // Vehículos más reservas
    // --------------------------
    document.querySelector('#stats-reservas').innerHTML =
        topVehiculos?.length
            ? topVehiculos.map(v => `
                <li class="list-group-item d-flex justify-content-between">
                    <span><strong>${v.marca} ${v.modelo}</strong> (${v.matricula})</span>
                    <span class="badge bg-info text-dark">${v.total_reservas} reservas</span>
                </li>
            `).join('')
            : `<p>No hay datos disponibles.</p>`;

    // --------------------------
    // Media valoraciones
    // --------------------------
    document.querySelector('#stats-media').innerHTML =
        mediaVehiculos?.length
            ? mediaVehiculos.map(v => `
                <li class="list-group-item d-flex justify-content-between">
                    <span>
                        <strong>${v.marca} ${v.modelo}</strong> (${v.matricula})
                        <small class="text-muted">- ${v.total_reviews} reviews</small>
                    </span>
                    <span class="badge bg-info text-dark">
                        ${Number(v.media_puntuacion).toFixed(2)}
                    </span>
                </li>
            `).join('')
            : `<p>No hay valoraciones todavía.</p>`;

    // --------------------------
    // Km recorridos
    // --------------------------
    document.querySelector('#stats-km').innerHTML =
        kmVehiculos?.length
            ? kmVehiculos.map(v => `
                <li class="list-group-item d-flex justify-content-between">
                    <span><strong>${v.marca} ${v.modelo}</strong> (${v.matricula})</span>
                    <span class="badge bg-info text-dark">${v.kilometros} km</span>
                </li>
            `).join('')
            : `<p>No hay datos disponibles.</p>`;
}

function initEstadisticas() {
    renderEstadisticas();
    setInterval(renderEstadisticas, 10000);
}

//INCIDENCIAS
async function renderIncidencias() {
    const incidencias = await fetchIncidencias();

    const select = document.querySelector('#filtroVehiculo');
    const lista = document.querySelector('#listaIncidencias');

    if (!incidencias || !incidencias.length) {
        lista.innerHTML = `<p>No hay incidencias.</p>`;
        select.innerHTML = `<option value="all">Todos</option>`;
        return;
    }

    // --------------------------
    // Construir mapa de vehículos
    // --------------------------
    const vehiculosMap = {};

    incidencias.forEach(i => {
        vehiculosMap[i.matricula] = {
            modelo: i.modelo,
            total: i.total_incidencias
        };
    });

    // --------------------------
    // Render select (filtro)
    // --------------------------
    select.innerHTML = `
        <option value="all">Todos</option>
        ${Object.entries(vehiculosMap).map(([mat, v]) => `
            <option value="${mat}">
                ${v.modelo} (${mat}) - ${v.total} incidencias
            </option>
        `).join('')}
    `;

    // --------------------------
    // Render lista
    // --------------------------
    const renderLista = (filtro = 'all') => {
        const filtradas = filtro === 'all'
            ? incidencias
            : incidencias.filter(i => i.matricula === filtro);

        lista.innerHTML = filtradas.length
            ? filtradas.map(i => `
                <li class="list-group-item incidencia-item" data-matricula="${i.matricula}">
                    <strong>
                        ${i.modelo} (${i.matricula})
                    </strong><br>

                    <small class="text-muted">
                        ${i.fecha}
                    </small><br>

                    <span>
                        ${i.comentario}
                    </span>
                </li>
            `).join('')
            : `<p>No hay incidencias para este vehículo.</p>`;
    };

    // --------------------------
    // Evento filtro
    // --------------------------
    select.addEventListener('change', (e) => {
        renderLista(e.target.value);
    });

    // Render inicial
    renderLista();
}

function initIncidencias() {
    renderIncidencias();
    setInterval(renderIncidencias, 10000);
}

document.addEventListener("DOMContentLoaded", function () {
    inicializarSignInUp();
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
    else if (path.includes("misReservas")) {
        inicializarMisReservas();
    }
    else if (path.includes("vehiculos")) {
        inicializarVehiculos();
    }
    else if (path.includes("admin")) {
        renderTablaConcesionarios();
        renderTablaVehiculos();
        renderTablaUsuarios();
        initEstadisticas();
        initIncidencias();
    }
    if (document.getElementById("map-container")) {
        mapaConcesionarios();
    }
});