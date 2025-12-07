const pool = require("./pool.js");

class ReservasDb {
    createReserva(reserva) {
        return pool.query(
            'INSERT INTO reservas(mail, matricula, fecha_ini, fecha_fin, estado, kilometros, incidencias) VALUES (?, ?, ?, activa, ?, ?)',
            [reserva.mail, reserva.matricula, reserva.fecha_ini, reserva.fecha_fin, reserva.estado, reserva.kilometros, reserva.incidencias]
        );
    }

    getMisReservas(userMail) {
        return pool.query(
            `SELECT r.*, 
                    v.matricula AS vehiculo_matricula,
                    v.marca AS vehiculo_marca,
                    v.modelo AS vehiculo_modelo,
                    v.plazas AS vehiculo_plazas,
                    v.autonomia AS vehiculo_autonomia,
                    v.color AS vehiculo_color,
                    v.imagen AS vehiculo_imagen,
                    v.id_concesionario AS vehiculo_concesionario
             FROM reservas r
             JOIN vehiculos v ON r.matricula = v.matricula
             WHERE r.mail = ?`,
            [userMail]
        );
    }
}

module.exports = new ReservasDb();