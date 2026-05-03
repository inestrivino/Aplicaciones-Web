import { fetchMisReservas } from './ajax.js';

/* RENDER DE LAS RESERVAS DEL USUARIO */
async function cargarReservas() {
    const reservas = await fetchMisReservas();
    renderReservas(reservas);
}

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

function renderFeedback(r) {
    if (r.estado !== "finalizada") return "";

    const hayPuntuacion = r.puntuacion !== null && r.puntuacion !== undefined;
    const hayComentario = r.comentario && r.comentario.trim() !== "";

    if (!hayPuntuacion && !hayComentario) {
        return `
            <div class="mt-2 p-2 border rounded bg-light text-muted">
                No se ha proporcionado una reseña
            </div>
        `;
    }

    const estrellas = hayPuntuacion ? "⭐".repeat(r.puntuacion) : "";

    return `
        <div class="mt-2 p-2 border rounded bg-light">
            ${hayPuntuacion ? `<strong>Valoración:</strong> ${estrellas}<br>` : ""}
            ${hayComentario ? `<em>${r.comentario}</em>` : ""}
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

                ${renderFeedback(r)}

                ${renderAcciones(r, tipo)}
            </div>
        </div>
    </div>
    `;
}

function renderAcciones(r, tipo) {
    if (tipo === "curso") {
        return `
            <button class="btn btn-warning w-100 devolver-btn" data-id="${r.id}">
                Devolver vehículo
            </button>
            <button class="btn btn-danger w-100 incidencia-btn" data-id="${r.id}">
                Reportar incidencia
            </button>
        `;
    }

    if (tipo === "proximas") {
        return `
            <button class="btn btn-danger w-100 cancelar-btn" data-id="${r.id}">
                Cancelar reserva
            </button>
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

        if (r.estado=="finalizada") {
            pasadasArr.push(r);
        } else if (inicio > hoy) {
            futuras.push(r);
        } else {
            enCurso.push(r);
        }
    });

    curso.innerHTML = renderCards(enCurso, "curso");
    proximas.innerHTML = renderCards(futuras, "proximas");
    pasadas.innerHTML = renderCards(pasadasArr, "pasadas");
}

let incidenciaReservaId = null;
let devolucionReservaId = null;
async function handleReservasClick(e) {
    // CANCELAR
    if (e.target.classList.contains("cancelar-btn")) {
        const id = e.target.dataset.id;

        if (!confirm("¿Seguro que quieres cancelar esta reserva?")) return;

        const res = await fetch(`/api/misReservas/cancelar/${id}`, { method: "POST" });
        const data = await res.json();

        if (data.ok) await cargarReservas();
        else alert(data.error);
    }

    // DEVOLVER
    if (e.target.classList.contains("devolver-btn")) {

        devolucionReservaId = e.target.dataset.id;

        document.getElementById("puntuacion").value = "";
        document.getElementById("comentario").value = "";

        new bootstrap.Modal(
            document.getElementById("devolucionModal")
        ).show();
    }

    // INCIDENCIA 
    if (e.target.classList.contains("incidencia-btn")) {
        incidenciaReservaId = e.target.dataset.id;

        document.getElementById("incidenciaTexto").value = "";
        document.getElementById("incidenciaError").classList.add("d-none");

        new bootstrap.Modal(
            document.getElementById("incidenciaModal")
        ).show();
    }
}

async function inicializarMisReservas() {
    let intervalReservas = null;
    document.addEventListener("click", handleReservasClick);
    document.getElementById("confirmarIncidenciaBtn")
        .addEventListener("click", async () => {

            const texto = document.getElementById("incidenciaTexto").value.trim();
            const error = document.getElementById("incidenciaError");

            if (!texto) {
                error.classList.remove("d-none");
                return;
            }

            console.log(JSON.stringify({ comentario: texto }));
            const res = await fetch(`/api/misReservas/incidencia/${incidenciaReservaId}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ comentario: texto })
            });

            const data = await res.json();

            if (data.ok) {
                bootstrap.Modal.getInstance(
                    document.getElementById("incidenciaModal")
                ).hide();

                await cargarReservas();
            } else {
                alert(data.error);
            }
        });
    document.getElementById("confirmarDevolucionBtn")
        .addEventListener("click", async () => {

            const puntuacion = document.getElementById("puntuacion").value;
            const comentario = document.getElementById("comentario").value.trim();
            const kilometros = document.getElementById("kilometros").value;

            if (!kilometros || kilometros < 0) {
                alert("Introduce los kilómetros recorridos");
                return;
            }

            const body = {
                accion: "feedback",
                kilometros: parseInt(kilometros)
            };

            if (puntuacion) body.puntuacion = parseInt(puntuacion);
            if (comentario) body.comentario = comentario;

            const res = await fetch(`/api/misReservas/devolver/${devolucionReservaId}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(body)
            });

            const data = await res.json();

            if (data.ok) {
                bootstrap.Modal.getInstance(
                    document.getElementById("devolucionModal")
                ).hide();

                await cargarReservas();

            } else {
                alert(data.error);
            }
        });
    await cargarReservas();
    if (!intervalReservas) {
        intervalReservas = setInterval(cargarReservas, 10000); // cada 10s
    }
}

document.addEventListener("DOMContentLoaded", function () {
    const path = window.location.pathname;
    if (path.includes("misReservas")) {
        inicializarMisReservas();
    }
});