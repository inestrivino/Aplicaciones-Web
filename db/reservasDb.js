const pool = require("./pool.js");

class ReservasDb {
    createReserva(reserva) {
        return pool.query(
            `INSERT INTO reservas(id_usuario, matricula, fecha_ini, fecha_fin, estado, kilometros, incidencias) 
         VALUES (?, ?, ?, ?, "activa", ?, ?)`,
            [
                reserva.id,
                reserva.matricula,
                reserva.fecha_ini,
                reserva.fecha_fin,
                reserva.kilometros,
                reserva.incidencias
            ]
        );
    }

    getMisReservas(id_usuario) {
        return pool.query(
            `SELECT r.*,
    v.matricula AS vehiculo_matricula,
    v.marca AS vehiculo_marca,
    v.modelo AS vehiculo_modelo,
    v.plazas AS vehiculo_plazas,
    v.autonomia AS vehiculo_autonomia,
    v.color AS vehiculo_color,
    v.imagen AS vehiculo_imagen,
    c.nombre AS concesionario_nombre
FROM reservas r
JOIN vehiculos v ON r.matricula = v.matricula
JOIN concesionarios c ON v.id_concesionario = c.id
WHERE r.id_usuario = ?`,
            [id_usuario]
        );
    }

    //devuelve los vehículos con más reservas
    async getTopVehiculos() {
        return pool.query(`
        SELECT v.matricula, v.marca, v.modelo, COUNT(*) AS total_reservas
        FROM reservas r
        JOIN vehiculos v ON r.matricula = v.matricula
        GROUP BY v.matricula
        ORDER BY total_reservas DESC
        LIMIT 5
    `);
    }

    //devuelve los concesionarios con más reservas
    async getTopConcesionarios() {
        return pool.query(`
        SELECT c.nombre, COUNT(*) AS total_reservas
        FROM reservas r
        JOIN vehiculos v ON r.matricula = v.matricula
        JOIN concesionarios c ON v.id_concesionario = c.id
        GROUP BY c.id
        ORDER BY total_reservas DESC
        LIMIT 5
    `);
    }
}

module.exports = new ReservasDb();