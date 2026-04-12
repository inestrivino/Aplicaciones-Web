const pool = require("./pool.js");

class ReservasDb {
    createReserva(reserva) {
        return pool.query(
            `INSERT INTO reservas(id_usuario, matricula, fecha_ini, fecha_fin) 
         VALUES (?, ?, ?, ?)`,
            [
                reserva.id,
                reserva.matricula,
                reserva.fecha_ini,
                reserva.fecha_fin
            ]
        );
    }

    getReservaById(id) {
        return pool.query(
            `SELECT * FROM reservas WHERE id = ?`,
            [id]
        )
    }

    getMisReservas(id_usuario) {
        return pool.query(
            `SELECT 
            r.*,
            v.matricula AS vehiculo_matricula,
            v.marca AS vehiculo_marca,
            v.modelo AS vehiculo_modelo,
            v.plazas AS vehiculo_plazas,
            v.autonomia AS vehiculo_autonomia,
            v.color AS vehiculo_color,
            v.imagen AS vehiculo_imagen,
            c.nombre AS concesionario_nombre,
            f.puntuacion,
            f.comentario

        FROM reservas r
        JOIN vehiculos v ON r.matricula = v.matricula
        JOIN concesionarios c ON v.id_concesionario = c.id
        LEFT JOIN feedback f ON r.id = f.id_reserva
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

    // Eliminar reserva
    cancelReserva(id_reserva) {
        return pool.query(
            `DELETE FROM reservas WHERE id = ?`,
            [id_reserva]
        );
    }

    // Finalizar reserva (devolución)
    finalizarReserva(id_reserva, fecha_fin) {
        return pool.query(
            `UPDATE reservas 
         SET fecha_fin = ? 
         WHERE id = ?`,
            [fecha_fin, id_reserva]
        );
    }

    // Insertar feedback de una reserva en la base de datos
    insertFeedback({ id_reserva, puntuacion, comentario }) {
        return pool.query(
            `INSERT INTO feedback (id_reserva, puntuacion, comentario)
         VALUES (?, ?, ?)`,
            [id_reserva, puntuacion, comentario]
        );
    }
}

module.exports = new ReservasDb();