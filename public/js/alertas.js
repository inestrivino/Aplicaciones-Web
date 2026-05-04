function renderAlertas(alertas) {
    const container = document.getElementById("alertas-container");
    container.innerHTML = "";

    alertas.forEach(a => {
        const div = document.createElement("div");

        div.className = `
            alert 
            ${a.vista ? "alert-secondary" : "alert-warning"} 
            d-flex align-items-center justify-content-between
            gap-3
        `;

        const icon = a.vista
            ? `<i class="bi bi-check-circle-fill text-success fs-4"></i>`
            : `<i class="bi bi-exclamation-triangle-fill text-warning fs-4"></i>`;

        div.innerHTML = `
            <!-- ICONO -->
            <div class="d-flex align-items-center justify-content-center" style="width: 40px;">
                ${icon}
            </div>

            <!-- CONTENIDO -->
            <div class="flex-grow-1 align-left">
                <!-- FECHA ARRIBA -->
                <div class="text-muted small mb-1">
                    <i class="bi bi-calendar-event me-1"></i>
                    ${new Date(a.fecha).toLocaleDateString()}
                </div>

                <!-- TEXTO -->
                <div class="fw-medium">
                    ${a.texto}
                </div>
            </div>

            <!-- ACCIONES -->
            <div class="d-flex gap-2">
                ${!a.vista ? `
                    <button class="btn btn-sm btn-success btn-vista" data-id="${a.id}">
                        <i class="bi bi-check-lg"></i>
                    </button>
                ` : ""}

                <button class="btn btn-sm btn-danger btn-delete" data-id="${a.id}">
                    <i class="bi bi-x-lg"></i>
                </button>
            </div>
        `;

        container.appendChild(div);
    });
}

async function cargarAlertas() {
    try {
        const res = await fetch("/api/alertas");
        const data = await res.json();

        if (!data.ok) return;

        renderAlertas(data.alertas);
    } catch (err) {
        console.error("Error cargando alertas:", err);
    }
}

async function marcarVista(id) {
    try {
        const res = await fetch(`/api/alertas/vista/${id}`, {
            method: "PUT"
        });

        const data = await res.json();

        if (data.ok) {
            cargarAlertas();
        }

    } catch (err) {
        console.error(err);
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
        }

    } catch (err) {
        console.error(err);
    }
}

function inicializarAlertas() {
    const container = document.getElementById("alertas-container");
    if (!container) return;

    cargarAlertas()

    // marcar como vista
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
    if (path.includes("alertas")) {
        inicializarAlertas();
    }
});