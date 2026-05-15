import { fetchUser, fetchMisReservas } from './ajax.js';

function renderAlertas(alertas) {
    const container = document.getElementById("alertas-container");
    if (!container) return;

    container.innerHTML = "";

    alertas.forEach(a => {
        const article = document.createElement("article");

        article.className = `
            alert
            ${a.vista ? "alert-secondary" : "alert-warning"}
            mb-3
        `;

        const icon = a.vista
            ? `<i class="bi bi-check-circle-fill text-success fs-4" aria-hidden="true"></i>`
            : `<i class="bi bi-exclamation-triangle-fill text-warning fs-4" aria-hidden="true"></i>`;

        article.innerHTML = `
            <div class="d-flex flex-column flex-md-row gap-3 align-items-start">

                <!-- ICONO -->
                <div class="flex-shrink-0 pt-1">
                    ${icon}

                    <span class="visually-hidden">
                        ${a.vista ? "Alerta leída" : "Alerta no leída"}
                    </span>
                </div>

                <!-- CONTENIDO -->
                <div class="flex-grow-1 w-100">

                    <!-- FECHA -->
                    <div class="text-muted small mb-1">
                        <i class="bi bi-calendar-event me-1" aria-hidden="true"></i>

                        <time datetime="${a.fecha}">
                            ${new Date(a.fecha).toLocaleDateString()}
                        </time>
                    </div>

                    <!-- MENSAJE -->
                    <p class="mb-2 fw-medium">
                        ${a.texto}
                    </p>

                    <!-- BOTONES -->
                    <div class="d-flex flex-wrap gap-2">

                        ${!a.vista ? `
                            <button
                                class="btn btn-sm btn-success btn-vista"
                                data-id="${a.id}"
                                aria-label="Marcar alerta como leída">

                                <i class="bi bi-check-lg" aria-hidden="true"></i>
                                <span class="ms-1">Marcar leída</span>
                            </button>
                        ` : ""}

                        <button
                            class="btn btn-sm btn-danger btn-delete"
                            data-id="${a.id}"
                            aria-label="Eliminar alerta">

                            <i class="bi bi-x-lg" aria-hidden="true"></i>
                            <span class="ms-1">Eliminar</span>
                        </button>

                    </div>
                </div>
            </div>
        `;

        container.appendChild(article);
    });
}

async function obtenerAlertas() {
    try {
        const res = await fetch("/api/alertas");
        const data = await res.json();

        if (!data.ok) return [];

        return data.alertas;

    } catch (err) {
        console.error("Error obteniendo alertas:", err);
        return [];
    }
}

async function actualizarCampana() {
    try {
        const res = await fetch("/api/alertas");
        const data = await res.json();

        if (!data.ok) return;

        const badge = document.getElementById("alerta-badge");

        if (data.noVistas > 0) {
            badge.classList.remove("d-none");
        } else {
            badge.classList.add("d-none");
        }

    } catch (err) {
        console.error("Error campana alertas:", err);
    }
}

async function cargarAlertas() {
    const alertas = await obtenerAlertas();
    renderAlertas(alertas);
}

async function marcarVista(id) {
    try {
        const res = await fetch(`/api/alertas/vista/${id}`, {
            method: "PUT"
        });

        const data = await res.json();

        if (data.ok) {
            cargarAlertas();
            actualizarCampana();
        }

    } catch (err) {
        console.error(err);
    }
}

async function crearAlerta(body) {
    try {
        const res = await fetch(`/api/alertas/`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(body)
        });

        const data = await res.json();

        cargarAlertas();
        actualizarCampana();

        if (!data.ok) {
            console.error("Error al crear alerta:", data.error);
            return;
        }

    } catch (err) {
        console.error("Error en crearAlerta:", err);
    }
}

async function eliminarAlerta(id) {
    try {
        const res = await fetch(`/api/alertas/${id}`, {
            method: "DELETE"
        });

        const data = await res.json();

        if (data.ok) {
            cargarAlertas();
            actualizarCampana();
        }

    } catch (err) {
        console.error(err);
    }
}

/* COMRPOBAR ALERTA DEVOLUCIÓN */
async function lanzarAlertaDevolucion() {
    try {
        const reservas = await fetchMisReservas();
        const alertas = await obtenerAlertas();

        const usuario = await fetchUser();
        if (!usuario) return;
        const id_usuario = usuario.id;

        // IDs de reservas que ya tienen alerta de devolución
        const reservasConAlerta = new Set(
            alertas
                .filter(a => a.tipo === "devolucion")
                .map(a => a.id_reserva)
        );

        const alertasVencidas = new Set(
            alertas
                .filter(a => a.tipo === "devolucion_vencida")
                .map(a => a.id_reserva)
        );

        const ahora = new Date();

        for (const reserva of reservas) {
            if (reservasConAlerta.has(reserva.id)) continue;

            const fecha_fin = new Date(reserva.fecha_fin);
            const fecha_ini = new Date(reserva.fecha_ini);
            const empezada = fecha_ini <= ahora;

            const diffMs = fecha_fin - ahora;
            const diasRestantes = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

            const noFinalizada = reserva.estado !== 'finalizada';

            //la reserva ha vencido pero aún no ha sido devuelta ni se ha enviado una notificacion al respecto
            if (fecha_fin < ahora && noFinalizada && !alertasVencidas.has(reserva.id)) {
                await crearAlerta({
                    matricula: reserva.matricula,
                    id_reserva: reserva.id,
                    texto: `La fecha de devolución del vehículo con matrícula ${reserva.matricula} ha sido superada. Acceda a "Mis reservas" lo antes posible.`,
                    tipo: "devolucion_vencida"
                });
                continue;
            }

            //la reserva ha comenzado, le quedan menos de 3 días para ser devuelta
            if (empezada && diasRestantes > 0 && diasRestantes < 3 && noFinalizada) {
                await crearAlerta({
                    matricula: reserva.matricula,
                    id_reserva: reserva.id,
                    texto: `Recordatorio de devolución: Quedan menos de ${diasRestantes} días para devolver el vehículo con matrícula ${reserva.matricula}.`,
                    tipo: "devolucion"
                });
            }
        }

        // Recargar alertas tras crear
        await cargarAlertas();
        await actualizarCampana();

    } catch (error) {
        console.error("Error lanzando alertas de devolución:", error);
    }
}

/* INICIALIZACIÓN Y RECARGA */
async function recargarAlertasManualmente() {
    try {
        await lanzarAlertaDevolucion();
        await cargarAlertas();
        await actualizarCampana();

    } catch (err) {
        console.error("Error recargando alertas:", err);
    }
}

function inicializarAlertas() {
    const container = document.getElementById("alertas-container");
    const btn = document.getElementById("btn-recargar");

    if (!container) return;

    cargarAlertas();

    // botón recargar
    if (btn) {
        btn.addEventListener("click", recargarAlertasManualmente);
    }

    container.addEventListener("click", async (e) => {
        if (e.target.classList.contains("btn-vista")) {
            const id = e.target.dataset.id;
            await marcarVista(id);
        }

        if (e.target.classList.contains("btn-delete")) {
            const id = e.target.dataset.id;
            await eliminarAlerta(id);
        }
    });

    setInterval(cargarAlertas, 10000);
}

document.addEventListener("DOMContentLoaded", function () {
    const path = window.location.pathname;
    lanzarAlertaDevolucion();

    // Repetir cada 12 horas
    setInterval(lanzarAlertaDevolucion, 12 * 60 * 60 * 1000);
    // Repetir cada 10 segundos
    setInterval(actualizarCampana, 10000);

    if (path.includes("alertas")) {
        inicializarAlertas();
    }
});