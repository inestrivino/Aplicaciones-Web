import { fetchConcesionarios } from './ajax.js';
import { fetchVehiculos } from './ajax.js';
import { fetchImagenesVehiculos } from './ajax.js';
import { fetchUsuarios } from './ajax.js';
import { fetchEstadisticas } from './ajax.js';
import { fetchIncidencias } from './ajax.js';

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

function inicializarAltaConcesionario() {
    const form = document.getElementById("altaConcesionario");

    if (!form) return;

    form.addEventListener("submit", async (e) => {
        e.preventDefault();

        const body = {
            nombre: form.nombre.value.trim(),
            ciudad: form.ciudad.value.trim(),
            direccion: form.direccion.value.trim(),
            telefono: form.telefono.value.trim(),
            latitud: form.latitud.value,
            longitud: form.longitud.value
        };

        try {
            const res = await fetch("/api/concesionarios/create", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(body)
            });

            const data = await res.json();

            if (data.ok) {
                alert(data.message);

                form.reset();
                await renderTablaConcesionarios();

            } else {
                alert(data.error);
            }

        } catch (err) {
            console.error(err);
            alert("Error al crear concesionario");
        }
    });
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

async function enviarFormularioVehiculo(event) {
    event.preventDefault();

    const form = document.getElementById("altaVehiculo");
    const formData = new FormData(form);

    const vehiculoData = {
        matricula: formData.get("matricula"),
        marca: formData.get("marca"),
        modelo: formData.get("modelo"),
        plazas: formData.get("plazas"),
        autonomia: formData.get("autonomia"),
        color: formData.get("color"),
        imagen: formData.get("imagen"),
        id_concesionario: formData.get("id_concesionario")
    };

    try {
        const res = await fetch("/api/vehiculos/create", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(vehiculoData)
        });

        const data = await res.json();

        if (data.ok) {
            alert("Vehículo creado con éxito.");
            form.reset();
            renderTablaVehiculos();
        } else {
            alert(`Error: ${data.error}`);
        }

    } catch (error) {
        console.error("Error al crear el vehículo", error);
        alert("Error al enviar los datos.");
    }
}

async function inicializarFormularioVehiculo() {
    const form = document.getElementById("altaVehiculo");
    if (!form) return;

    // Cargar imágenes de vehículos
    const imagenSelect = form.querySelector("#imagen");
    const concesionariosSelect = form.querySelector("#id_concesionario");

    try {
        // Obtener las imágenes disponibles
        const imagenes = await fetchImagenesVehiculos();

        // Llenar el select de imágenes
        imagenSelect.innerHTML = imagenes.map(img => `
            <option value="${img}">${img}</option>
        `).join('');

        // Obtener los concesionarios disponibles
        const concesionarios = await fetchConcesionarios();

        // Llenar el select de concesionarios
        concesionariosSelect.innerHTML = concesionarios.map(con => `
            <option value="${con.id}">${con.nombre} (${con.ciudad})</option>
        `).join('');

        if (form) {
            form.addEventListener("submit", enviarFormularioVehiculo);
        }

    } catch (error) {
        console.error("Error al cargar los datos del formulario", error);
        alert("Error al cargar imágenes o concesionarios.");
    }
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
    const path = window.location.pathname;
    if (path.includes("admin")) {
        renderTablaConcesionarios();
        inicializarAltaConcesionario();
        renderTablaVehiculos();
        inicializarFormularioVehiculo();
        renderTablaUsuarios();
        initEstadisticas();
        initIncidencias();
    }
});