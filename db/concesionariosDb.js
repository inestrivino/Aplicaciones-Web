const pool = require("./pool.js");

class ConcesionariosDb {
    //mete un nuevo concesionario
    async createConcesionario(concesionario) {
        return await pool.query(
            'INSERT INTO concesionarios(nombre, ciudad, direccion, telefono) VALUES (?, ?, ?, ?)',
            [concesionario.nombre, concesionario.ciudad, concesionario.direccion, concesionario.telefono]
        );
    }
}

module.exports = new ConcesionariosDb();