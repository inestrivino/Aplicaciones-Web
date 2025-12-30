"use strict";
// ================ Al inicializar la pagina ================
function cargarVehiculos(vehiculos) {
    const container = document.getElementById('vehiculosContainer')
    container.innerHTML = ''

    vehiculos.forEach(v => {
        container.innerHTML += `
        <div class="col">
            <div class="card h-100">
                <img src="${v.imagen}" class="card-img-top" style="height:200px;object-fit:cover;">
                <div class="card-body">
                    <h5 class="card-title">${v.modelo}</h5>
                    <ul class="list-unstyled">
                        <li><strong>Matrícula:</strong> ${v.matricula}</li>
                        <li><strong>Autonomía:</strong> ${v.autonomia} km</li>
                        <li><strong>Plazas:</strong> ${v.plazas}</li>
                        <li><strong>Concesionario:</strong> ${v.concesionario_nombre}</li>
                    </ul>
                    <button class="btn btn-primary"
                        onclick="reserveCar('${v.matricula}')">
                        Reservar
                    </button>
                </div>
            </div>
        </div>
        `
    })
}

async function init () {
    //cargar los vehiculos del concesionario del cliente al iniciar la pagina
    const concesionario = document.getElementById("concesionario").getAttribute("data");
    const res = await fetch(`/api/vehiculos/filter?concesionarioSelect=${concesionario}`);
    const vehiculos = await res.json()
    cargarVehiculos(vehiculos);
    
    //dejar seleccionado el concesionario en el filtro
    document.getElementById("concesionarioSelect").value = concesionario;

    //evento al hacer click en aplicar filtros
    const boton = document.getElementById("buttonAplicarFiltro");
    boton.addEventListener("click", applyFilters);
}
init();

// ================ Al hacer click en aplicar filtros ================
async function applyFilters() {
    const marca = document.getElementById("marcaSelect").value;
    const autonomia = document.getElementById("autonomiaSelect").value;
    const concesionario = document.getElementById("concesionarioSelect").value;
    const color = document.getElementById("colorSelect").value;

    const res = await fetch(`/api/vehiculos/filter?marcaSelect=${marca}&autonomiaSelect=${autonomia}&concesionarioSelect=${concesionario}&colorSelect=${color}`);
    const vehiculos = await res.json();
    cargarVehiculos(vehiculos);
}