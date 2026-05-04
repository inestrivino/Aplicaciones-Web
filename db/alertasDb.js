const pool = require("./pool.js");

class alertasDb {
    //mete una nueva alerta
    async createAlerta(alerta) {
        return await pool.query(
            `INSERT INTO alertas
        (id_usuario, id_reserva, matricula, texto, fecha, vista)
        VALUES (?, ?, ?, ?, ?, ?)`,
            [
                alerta.id_usuario,
                alerta.id_reserva,
                alerta.matricula,
                alerta.texto,
                alerta.fecha,
                alerta.vista]
        );
    }

    //elimina una alerta
    async deleteAlerta(id) {
        return await pool.query(
            'DELETE FROM alertas WHERE id = ?',
            [id]
        );
    }

    //devuelve la lista de alertas del usuario logueado
    async getAlertas(id_usuario) {
        return await pool.query(
            'SELECT * FROM alertas WHERE alertas.id_usuario = ? ORDER BY id DESC',
            [id_usuario]
        );
    }

    async marcarVista(id) {
        await pool.query(
            "UPDATE alertas SET vista = 1 WHERE id = ?",
            [id]
        );
    }
}

module.exports = new alertasDb();