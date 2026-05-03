import { fetchConcesionarios } from './ajax.js';
import { fetchVehiculos } from './ajax.js';
import { fetchImagenesVehiculos } from './ajax.js';
import { fetchUsuarios } from './ajax.js';
import { fetchEstadisticas } from './ajax.js';
import { fetchIncidencias } from './ajax.js';
import { mostrarFeedback } from './ui.js';

/* RENDER DEL ADMINISTRADOR */
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

            <td><input class="form-control" name="marca" value="${v.marca}"></td>
            <td><input class="form-control" name="modelo" value="${v.modelo}"></td>
            <td><input class="form-control" type="date" name="fecha" value="${v.fecha || ''}"></td>
            <td><input class="form-control" type="number" name="plazas" value="${v.plazas}"></td>
            <td><input class="form-control" type="number" name="autonomia" value="${v.autonomia}"></td>
            <td><input class="form-control" name="color" value="${v.color}"></td>

            <td>
                <select class="form-select" name="id_concesionario">
                    ${opcionesConcesionarios}
                </select>
            </td>

            <td>
                <select class="form-select" name="imagen">
                    ${opcionesImagenes}
                </select>
            </td>

            <td>
                <button class="btn btn-secondary btn-update"
                        data-matricula="${v.matricula}">
                    Modificar
                </button>

                <button class="btn btn-danger btn-delete"
                        data-matricula="${v.matricula}">
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

        if (!res.ok || !data.ok) {
            throw new Error(data.error || "Error al crear vehículo");
        }

        mostrarFeedback(data.message || "Vehículo creado con éxito", "success");

        form.reset();
    } catch (error) {
        console.error("Error al crear el vehículo", error);
        mostrarFeedback(error.message || "Error al enviar los datos", "danger");
    }

    await renderTablaVehiculos();
}

async function updateVehiculo(matricula, data) {
    try {
        const res = await fetch(`/api/vehiculos/${matricula}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });

        const json = await res.json();

        if (!res.ok || !json.ok) {
            throw new Error(json.error || 'Error al actualizar vehículo');
        }

        mostrarFeedback('Vehículo actualizado con éxito', 'success');
    } catch (error) {
        console.error(error);
        mostrarFeedback(error.message, 'danger');
    }

    await renderTablaVehiculos();
}

async function deleteVehiculo(matricula) {
    try {
        const res = await fetch(`/api/vehiculos/${matricula}`, {
            method: 'DELETE'
        });

        const json = await res.json();

        if (!res.ok || !json.ok) {
            throw new Error(json.error || 'Error al eliminar vehículo');
        }

        mostrarFeedback('Vehículo eliminado con éxito', 'success');
    } catch (error) {
        console.error(error);
        mostrarFeedback(error.message, 'danger');
    }

    await renderTablaVehiculos();
}

async function inicializarAltaVehiculo() {
    const form = document.getElementById("altaVehiculo");
    if (!form) return;

    const imagenSelect = form.querySelector("#imagen");
    const concesionariosSelect = form.querySelector("#id_concesionario");

    try {
        // Obtener las imágenes disponibles
        const imagenes = await fetchImagenesVehiculos();

        imagenSelect.innerHTML = imagenes.map(img => `
            <option value="${img}">${img}</option>
        `).join('');

        // Obtener concesionarios
        const concesionarios = await fetchConcesionarios();

        concesionariosSelect.innerHTML = concesionarios.map(con => `
            <option value="${con.id}">${con.nombre} (${con.ciudad})</option>
        `).join('');

        form.removeEventListener("submit", enviarFormularioVehiculo);
        form.addEventListener("submit", enviarFormularioVehiculo);

    } catch (error) {
        console.error("Error al cargar los datos del formulario", error);
        mostrarFeedback("Error al cargar imágenes o concesionarios", "danger");
    }
}

function inicializarTablaVehiculos() {
    renderTablaVehiculos();
    document.querySelector('#tabla-vehiculos tbody')
        .addEventListener('click', async (e) => {

            const btn = e.target;

            // MODIFICAR
            if (btn.classList.contains('btn-update')) {
                const matricula = btn.dataset.matricula;
                const row = btn.closest('tr');

                const data = {
                    marca: row.querySelector('[name="marca"]').value,
                    modelo: row.querySelector('[name="modelo"]').value,
                    fecha: row.querySelector('[name="fecha"]').value,
                    plazas: row.querySelector('[name="plazas"]').value,
                    autonomia: row.querySelector('[name="autonomia"]').value,
                    color: row.querySelector('[name="color"]').value,
                    id_concesionario: row.querySelector('[name="id_concesionario"]').value,
                    imagen: row.querySelector('[name="imagen"]').value
                };

                await updateVehiculo(matricula, data);
            }

            // ELIMINAR
            if (btn.classList.contains('btn-delete')) {
                const matricula = btn.dataset.matricula;

                if (confirm('¿Eliminar este vehículo?')) {
                    await deleteVehiculo(matricula);
                }
            }
        });
}

//CONCESIONARIOS
async function renderTablaConcesionarios() {
    concesionarios = await fetchConcesionarios();
    const tbody = document.querySelector('#tabla-concesionarios tbody');

    tbody.innerHTML = concesionarios.map(c => `
        <tr>
            <td>${c.id}</td>

            <td class="d-sm-table-cell">
                <input class="form-control" type="text" name="nombre" value="${c.nombre}">
            </td>

            <td class="d-sm-table-cell">
                <input class="form-control" type="text" name="ciudad" value="${c.ciudad}">
            </td>

            <td class="d-md-table-cell">
                <input class="form-control" type="text" name="direccion" value="${c.direccion}">
            </td>

            <td>
                <input class="form-control" type="text" name="latitud" value="${c.latitud || ''}">
            </td>

            <td>
                <input class="form-control" type="text" name="longitud" value="${c.longitud || ''}">
            </td>

            <td class="d-md-table-cell">
                <input class="form-control" type="text" name="telefono" value="${c.telefono}">
            </td>

            <td>
                <button class="btn btn-secondary mb-1 btn-update" data-id="${c.id}">
                    Modificar
                </button>
                <button class="btn btn-danger btn-delete" data-id="${c.id}">
                    Eliminar
                </button>
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
                mostrarFeedback(data.message || "Concesionario creado con éxito", "success");
                form.reset();

            } else {
                mostrarFeedback(data.error || "Error al crear concesionario", "danger");
            }

        } catch (err) {
            console.error(err);
            mostrarFeedback("Error al crear concesionario", "danger");
        }

        await renderTablaConcesionarios();
    });
}

async function updateConcesionario(id, data) {
    try {
        const res = await fetch(`/api/concesionarios/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });

        if (!res.ok) throw new Error('Error al actualizar');

        mostrarFeedback('Concesionario actualizado con éxito', 'success');

    } catch (error) {
        mostrarFeedback('Error al actualizar el concesionario', 'danger');
        console.error(error);
    }

    await renderTablaConcesionarios();
}

async function deleteConcesionario(id) {
    try {
        const res = await fetch(`/api/concesionarios/${id}`, {
            method: 'DELETE'
        });

        if (!res.ok) throw new Error('Error al eliminar');

        mostrarFeedback('Concesionario eliminado con éxito', 'success');
    } catch (error) {
        mostrarFeedback('Error al eliminar el concesionario', 'danger');
        console.error(error);
    }

    await renderTablaConcesionarios();
    await renderTablaVehiculos();
}

function inicializarTablaConcesionario() {
    renderTablaConcesionarios();
    document.querySelector('#tabla-concesionarios tbody')
        .addEventListener('click', async (e) => {

            const btn = e.target;

            // BOTÓN MODIFICAR
            if (btn.classList.contains('btn-update')) {
                const id = btn.dataset.id;
                const row = btn.closest('tr');

                const data = {
                    nombre: row.querySelector('[name="nombre"]').value,
                    ciudad: row.querySelector('[name="ciudad"]').value,
                    direccion: row.querySelector('[name="direccion"]').value,
                    latitud: row.querySelector('[name="latitud"]').value,
                    longitud: row.querySelector('[name="longitud"]').value,
                    telefono: row.querySelector('[name="telefono"]').value,
                };

                await updateConcesionario(id, data);
            }

            // BOTÓN ELIMINAR
            if (btn.classList.contains('btn-delete')) {
                const id = btn.dataset.id;

                if (confirm('¿Seguro que quieres eliminar este concesionario?')) {
                    await deleteConcesionario(id);
                }
            }
        });
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
                <input class="form-control"
                       type="text"
                       name="name"
                       value="${u.name}">
            </td>

            <td>
                <input class="form-control"
                       type="text"
                       name="email"
                       value="${u.email}">
            </td>

            <td>
                <select class="form-select" name="rol">
                    <option value="admin" ${u.rol === 'admin' ? 'selected' : ''}>admin</option>
                    <option value="user" ${u.rol === 'user' ? 'selected' : ''}>user</option>
                </select>
            </td>

            <td>
                <select class="form-select" name="id_concesionario">
                    ${opcionesConcesionarios}
                </select>
            </td>

            <td>
                <button class="btn btn-secondary btn-update"
                        data-id="${u.id}">
                    Modificar
                </button>

                <button class="btn btn-danger btn-delete"
                        data-id="${u.id}">
                    Eliminar
                </button>
            </td>
        </tr>
        `;
    }).join('');
}

async function updateUsuario(id, data) {
    try {
        const res = await fetch(`/api/user/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });

        const json = await res.json();

        if (!res.ok || !json.ok) {
            throw new Error(json.error || "Error al actualizar usuario");
        }

        mostrarFeedback("Usuario actualizado con éxito", "success");

    } catch (error) {
        console.error(error);
        mostrarFeedback(error.message, "danger");
    }
    await renderTablaUsuarios();
}

async function deleteUsuario(id) {
    try {
        const res = await fetch(`/api/user/${id}`, {
            method: 'DELETE'
        });

        const json = await res.json();

        if (!res.ok || !json.ok) {
            throw new Error(json.error || "Error al eliminar usuario");
        }

        mostrarFeedback("Usuario eliminado con éxito", "success");

    } catch (error) {
        console.error(error);
        mostrarFeedback(error.message, "danger");
    }
    await renderTablaUsuarios();
}

function inicializarTablaUsuarios() {
    renderTablaUsuarios();
    document.querySelector('#tabla-usuarios tbody')
        .addEventListener('click', async (e) => {

            const btn = e.target;

            // MODIFICAR
            if (btn.classList.contains('btn-update')) {
                const id = btn.dataset.id;
                const row = btn.closest('tr');

                const data = {
                    name: row.querySelector('[name="name"]').value,
                    email: row.querySelector('[name="email"]').value,
                    rol: row.querySelector('[name="rol"]').value,
                    id_concesionario: row.querySelector('[name="id_concesionario"]').value
                };

                await updateUsuario(id, data);
            }

            // ELIMINAR
            if (btn.classList.contains('btn-delete')) {
                const id = btn.dataset.id;

                if (confirm('¿Eliminar este usuario?')) {
                    await deleteUsuario(id);
                }
            }
        });
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

    document.querySelector('#stats-concesionarios').innerHTML =
        topConcesionarios?.length
            ? topConcesionarios.map(c => `
                <li class="list-group-item d-flex justify-content-between">
                    <strong>${c.nombre}</strong>
                    <span class="badge bg-info text-dark">${c.total_reservas} reservas</span>
                </li>
            `).join('')
            : `<p>No hay datos disponibles.</p>`;

    document.querySelector('#stats-reservas').innerHTML =
        topVehiculos?.length
            ? topVehiculos.map(v => `
                <li class="list-group-item d-flex justify-content-between">
                    <span><strong>${v.marca} ${v.modelo}</strong> (${v.matricula})</span>
                    <span class="badge bg-info text-dark">${v.total_reservas} reservas</span>
                </li>
            `).join('')
            : `<p>No hay datos disponibles.</p>`;

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

    const vehiculosMap = {};

    incidencias.forEach(i => {
        vehiculosMap[i.matricula] = {
            modelo: i.modelo,
            total: i.total_incidencias
        };
    });

    select.innerHTML = `
        <option value="all">Todos</option>
        ${Object.entries(vehiculosMap).map(([mat, v]) => `
            <option value="${mat}">
                ${v.modelo} (${mat}) - ${v.total} incidencias
            </option>
        `).join('')}
    `;

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
        //concesionario
        inicializarTablaConcesionario();
        inicializarAltaConcesionario();

        //vehiculo
        inicializarTablaVehiculos();
        inicializarAltaVehiculo();

        //usuarios
        inicializarTablaUsuarios();

        //estadísticas e incidencias
        initEstadisticas();
        initIncidencias();
    }
});