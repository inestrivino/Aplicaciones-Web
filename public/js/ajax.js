/* FUNCIONES AQUÍ:
- OBTENCION DE CONCESIONARIOS MEDIANTE API
- OBTENCION DE VEHICULOS MEDIANTE API
- OBTENCION DE LOS FILTROS MEDIANTE API
- OBTENCION DE FECHAS OCUPADAS MEDIANTE API
*/

/* FUNCIONES PARA AJAX */
export async function fetchConcesionarios() {
    try {
        const res = await fetch('/api/concesionarios');
        return await res.json();
    } catch (error) {
        console.error('Error cargando concesionarios:', error);
        return [];
    }
}

export async function fetchVehiculos(filtros = {}) {
    try {
        const query = new URLSearchParams(filtros).toString();
        const url = `/api/vehiculos${query ? `?${query}` : ''}`;

        const res = await fetch(url);
        return await res.json();

    } catch (error) {
        console.error('Error cargando vehiculos:', error);
        return [];
    }
}

export async function fetchFechasOcupado(matricula) {
    const res = await fetch(`/api/vehiculos/fechasOcupado?matricula=${matricula}`);
    const data = await res.json();
    return data.ocupadas || [];
}

export async function fetchMisReservas() {
    try {
        const res = await fetch('/api/misReservas');
        const data = await res.json();
        return data;
    } catch (error) {
        console.error("Error cargando reservas:", error);
        return [];
    }
}

export async function fetchFiltros() {
    try {
        const res = await fetch('/api/vehiculos/filtros');
        return await res.json();
    } catch (error) {
        console.error('Error cargando filtros:', error);
        return null;
    }
}