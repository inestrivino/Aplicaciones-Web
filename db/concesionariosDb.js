const pool = require("./pool.js");

class ConcesionariosDb {
    //mete un nuevo concesionario
    async createConcesionario(concesionario) {
        return await pool.query(
            'INSERT INTO concesionarios(id, nombre, ciudad, direccion, telefono) VALUES (?, ?, ?, ?, ?)',
            [concesionario.id, concesionario.nombre, concesionario.ciudad, concesionario.direccion, concesionario.telefono]
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