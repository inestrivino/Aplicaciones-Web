const pool = require("./pool.js");

class VehiculosDb {
    //mete un nuevo vehiculo
    async createVehiculo(vehiculo) {
        return await pool.query(
            'INSERT INTO vehiculos(matricula, marca, modelo, fecha, plazas, autonomia, color, imagen, estado, id_concesionario) VALUES (?, ?, ?, ?, ?, ?, ?, ?, "disponible", ?)',
            [vehiculo.matricula, vehiculo.marca, vehiculo.modelo, vehiculo.fecha, vehiculo.plazas, vehiculo.autonomia, vehiculo.color, vehiculo.imagen, vehiculo.id_concesionario]
        );
    }
    
    //actualiza un vehiculo
    updateVehiculo(matricula, vehiculo) {
        return pool.query(
            'UPDATE vehiculos SET marca = ?, modelo = ?, fecha = ?, plazas = ?, autonomia = ?, color = ?, imagen = ?, estado = "disponible", id_concesionario = ? ' +
            'WHERE matricula = ?',
            [vehiculo.marca, vehiculo.modelo, vehiculo.fecha, vehiculo.plazas, vehiculo.autonomia, vehiculo.color, vehiculo.imagen, vehiculo.id_concesionario, matricula]
        );
    }

    //elimina un vehiculo
    deleteVehiculo(matricula) {
        return pool.query(
            'DELETE FROM vehiculos WHERE matricula = ?',
            [matricula]
        );
    }    

    //devuelve la lista de vehiculos
    async getVehiculos() {
        return await pool.query(
            'SELECT * FROM vehiculos ORDER BY id_concesionario, matricula'
        );
    }

    //busca un vehiculo por su matricula
    async getVehiculoByMatricula(matricula) {

    }
}

module.exports = new VehiculosDb();