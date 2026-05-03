const pool = require("./pool.js");

class ReservasDb {
    //crea una reserva
    createReserva(reserva) {
        return pool.query(
            `INSERT INTO reservas(id_usuario, matricula, fecha_ini, fecha_fin, estado) 
             VALUES (?, ?, ?, ?, 'activa')`,
            [
                reserva.id,
                reserva.matricula,
                reserva.fecha_ini,
                reserva.fecha_fin
            ]
        );
    }

    //devuelve una reserva dada su id
    getReservaById(id) {
        return pool.query(
            `SELECT * 
             FROM reservas 
             WHERE id = ? AND estado != 'cancelada'`,
            [id]
        );
    }

    //devuelve las reservas de un usuario dado su id
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
            WHERE r.id_usuario = ? 
              AND r.estado != 'cancelada'`,
            [id_usuario]
        );
    }

    // Vehículos con más reservas
    async getTopVehiculos() {
        return pool.query(`
            SELECT v.matricula, v.marca, v.modelo, COUNT(*) AS total_reservas
            FROM reservas r
            JOIN vehiculos v ON r.matricula = v.matricula
            WHERE r.estado != 'cancelada'
            GROUP BY v.matricula
            ORDER BY total_reservas DESC
            LIMIT 5
        `);
    }

    // Concesionarios con más reservas
    async getTopConcesionarios() {
        return pool.query(`
            SELECT c.nombre, COUNT(*) AS total_reservas
            FROM reservas r
            JOIN vehiculos v ON r.matricula = v.matricula
            JOIN concesionarios c ON v.id_concesionario = c.id
            WHERE r.estado != 'cancelada'
            GROUP BY c.id
            ORDER BY total_reservas DESC
            LIMIT 5
        `);
    }

    // Cancelar reserva
    cancelReserva(id_reserva) {
        return pool.query(
            `UPDATE reservas 
             SET estado = 'cancelada' 
             WHERE id = ?`,
            [id_reserva]
        );
    }

    // Finalizar reserva
    finalizarReserva(id_reserva, fecha_fin) {
        return pool.query(
            `UPDATE reservas 
             SET fecha_fin = ?, estado = 'finalizada'
             WHERE id = ?`,
            [fecha_fin, id_reserva]
        );
    }

    // Insertar feedback
    insertFeedback({ id_reserva, puntuacion, comentario }) {
        return pool.query(
            `INSERT INTO feedback (id_reserva, puntuacion, comentario)
             VALUES (?, ?, ?)`,
            [id_reserva, puntuacion, comentario]
        );
    }
}

module.exports = new ReservasDb();