const pool = require("./pool.js");

class ReservasDb {
    createReserva(reserva) {
        return pool.query(
            'INSERT INTO reservas(mail, matricula, fecha_ini, fecha_fin, estado, kilometros, incidencias) VALUES (?, ?, ?, activa, ?, ?)',
            [reserva.mail, reserva.matricula, reserva.fecha_ini, reserva.fecha_fin, reserva.estado, reserva.kilometros, reserva.incidencias]
        );
    }
}

module.exports = new ReservasDb();