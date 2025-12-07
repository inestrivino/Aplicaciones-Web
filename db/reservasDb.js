const pool = require("./pool.js");

class ReservasDb {
    getMisReservas(userId) {
        return pool.query(
            'SELECT * FROM reservas WHERE id_usuario = ?', [userId]
        );
    }
}

module.exports = new ReservasDb();