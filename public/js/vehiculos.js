import { fetchVehiculos } from './ajax.js';
import { fetchFechasOcupado } from './ajax.js';
import { fetchFiltros } from './ajax.js';
import { mostrarFeedback } from './ui.js';

/* RENDER DEL FORMULARIO PARA RESERVAR */
async function cargarVehiculosSelect(selectedMatricula = "") {
    const select = document.getElementById("vehiculo");
    if (!select) return;

    const vehiculos = await fetchVehiculos();

    const current = selectedMatricula || select.value;

    select.innerHTML = "";

    const empty = document.createElement("option");
    empty.value = "";
    empty.textContent = "Seleccione un vehículo";
    select.appendChild(empty);

    vehiculos.forEach(v => {
        const option = document.createElement("option");
        option.value = v.matricula;
        option.textContent = `${v.matricula} - ${v.modelo || ""}`;
        select.appendChild(option);
    });

    if (current) {
        select.value = current;
    }
}

async function inicializarFormularioReservas() {
    const inicioInput = document.getElementById("inicioFecha");
    const finInput = document.getElementById("finFecha");
    const matriculaInput = document.getElementById("vehiculo");
    const params = new URLSearchParams(window.location.search);
    const car = params.get("car");
    let intervalVehiculos = null;

    if (!inicioInput || !finInput || !matriculaInput) return;

    await cargarVehiculosSelect(car);

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

    let fpInicio;
    let fpFin;
    let rangosOcupados = [];

    fpInicio = flatpickr(inicioInput, {
        dateFormat: "Y-m-d",
        minDate: manana,
        maxDate: unAno,
        disableMobile: true,
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

        const inicioActual = fpInicio.selectedDates?.[0];
        const finActual = fpFin.selectedDates?.[0];

        fpInicio.set("disable", rangosOcupados);
        fpFin.set("disable", rangosOcupados);

        if (inicioActual) {
            const valid = !rangosOcupados.some(r => {
                const from = new Date(r.from);
                const to = new Date(r.to);
                return inicioActual >= from && inicioActual <= to;
            });

            if (valid) {
                fpInicio.setDate(inicioActual, false);
            }
        }

        if (finActual) {
            const valid = !rangosOcupados.some(r => {
                const from = new Date(r.from);
                const to = new Date(r.to);
                return finActual >= from && finActual <= to;
            });

            if (valid) {
                fpFin.setDate(finActual, false);
            }
        }
    }

    if (car) {
        await cargarVehiculosSelect(car);
        matriculaInput.value = car;
        cargarFechas();
    }

    matriculaInput.addEventListener("change", async () => {
        inicioInput.value = "";
        finInput.value = "";
        const url = new URL(window.location);
        url.searchParams.delete("car");
        window.history.replaceState({}, "", url);

        await cargarFechas();
    });

    const form = document.getElementById("reservaForm");
    if (!form) {
        console.error("No se encontró el formulario");
        return;
    }

    form.addEventListener("submit", async (e) => {
        e.preventDefault();

        if (!inicioInput.value || !finInput.value) {
            mostrarFeedback("Debes seleccionar ambas fechas de reserva.", "warning");
            return;
        }

        if (!matriculaInput.value) {
            mostrarFeedback("Debes seleccionar un vehículo.", "warning");
            return;
        }

        const body = {
            matricula: form.matricula.value,
            fecha_ini: form.fecha_ini.value,
            fecha_fin: form.fecha_fin.value
        };

        try {
            const res = await fetch("/api/reserva", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(body)
            });

            const data = await res.json();

            if (!res.ok || !data.ok) {
                throw new Error(data.error || "No se pudo realizar la reserva");
            }

            form.matricula.value = "";
            form.fecha_fin.value = "";
            form.fecha_ini.value = "";
            mostrarFeedback(data.message || "Reserva realizada con éxito", "success");

        } catch (err) {
            mostrarFeedback(err.message || "Error al realizar la reserva", "danger");
            console.error(err);
        }
    });

    intervalVehiculos = setInterval(async () => {
        const prev = matriculaInput.value;
        await cargarVehiculosSelect(prev);
        if (matriculaInput.value !== prev) {
            matriculaInput.dispatchEvent(new Event("change"));
        }
    }, 10000);
}

function reserveCar(matricula) {
    // Envía al usuario a reservas.html con ?car=MAT
    window.location.href = `../reserva?car=${encodeURIComponent(matricula)}`;
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
                        <p class="card-text mb-1">
                            <strong>Kms:</strong> ${vehiculo.kilometros}
                        </p>
                        <p class="card-text">
                            <strong>Concesionario:</strong> ${vehiculo.concesionario_nombre}
                        </p>
                    </div>

                    <div class="card-footer border-0 mt-auto">
                        <button 
                            class="btn btn-primary w-100 reserve-btn"
                            data-matricula="${vehiculo.matricula}">
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
    document.addEventListener("click", (e) => {
        const btn = e.target.closest(".reserve-btn");
        if (!btn) return;

        const matricula = btn.dataset.matricula;
        window.location.href = `../reserva?car=${encodeURIComponent(matricula)}`;
    });
    setInterval(() => {
        renderVehiculos();
    }, 10000);
}

document.addEventListener("DOMContentLoaded", function () {
    const path = window.location.pathname;
    const params = new URLSearchParams(window.location.search);
    if (path.includes("vehiculos")) {
        inicializarVehiculos();
    }
    else if (path.includes("reserva")) {
        const matricula = params.get("car");
        inicializarFormularioReservas();
        if (matricula) {
            const selectVehiculo = document.getElementById("vehiculo");
            if (selectVehiculo) selectVehiculo.value = matricula;
        }
    }
});