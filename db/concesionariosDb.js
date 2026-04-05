const pool = require("./pool.js");

class ConcesionariosDb {
    //mete un nuevo concesionario
    async createConcesionario(concesionario) {
        return await pool.query(
            'INSERT INTO concesionarios(nombre, ciudad, direccion, telefono) VALUES (?, ?, ?, ?)',
            [concesionario.nombre, concesionario.ciudad, concesionario.direccion, concesionario.telefono]
        );
    }

    //actualiza un concesionario
    updateConcesionario(id, concesionario) {
        return pool.query(
            'UPDATE concesionarios SET nombre = ?, ciudad = ?, direccion = ?, telefono = ? ' +
            'WHERE id = ?',
            [concesionario.nombre, concesionario.ciudad, concesionario.direccion, concesionario.telefono, id]
        );
    }

    deleteConcesionario(id) {
        return pool.query(
            'DELETE FROM concesionarios WHERE id = ?',
            [id]
        );
    }

    //devuelve la lista de concesionarios
    async getConcesionarios() {
        return await pool.query(
            'SELECT * FROM concesionarios ORDER BY id'
        );
    }

    //devuelve un concesionario por su id
    async getConcesionarioById(id) {
        return await pool.query(
            'SELECT * FROM concesionarios WHERE id = ?',
            [id]
        );
    }
}

module.exports = new ConcesionariosDb();