const pool = require("./pool.js");

class VehiculosDb {
    //mete un nuevo vehiculo
    async createVehiculo(vehiculo) {
        return await pool.query(
            'INSERT INTO vehiculos(matricula, marca, modelo, fecha, plazas, autonomia, color, imagen, estado, id_concesionario) VALUES (?, ?, ?, ?, ?, ?, ?, ?, "disponible", ?)',
            [vehiculo.matricula, vehiculo.marca, vehiculo.modelo, vehiculo.fecha, vehiculo.plazas, vehiculo.autonomia, vehiculo.color, vehiculo.imagen, vehiculo.id_concesionario]
        );
        /*,(err, res) => {
            console.log("Vehiculo insertado:", vehiculo.matricula);
        });*/
    }

    async updateVehiculo(vehiculo) {
        return await pool.query(
            'UPDATE vehiculos SET marca = ?, modelo = ?, fecha = ?, plazas = ?, autonomia = ?, color = ?, imagen = ?, estado = "disponible", id_concesionario = ? ' +
            'WHERE matricula = ?',
            [vehiculo.marca, vehiculo.modelo, vehiculo.fecha, vehiculo.plazas, vehiculo.autonomia, vehiculo.color, vehiculo.imagen, vehiculo.id_concesionario, vehiculo.matricula]
        );
    }

    //devuelve la lista de vehiculos
    async getVehiculos() {
        const res = await pool.query(
            'SELECT * FROM vehiculos'
        );

        const [rows] = res;
        return rows;
    }

    //busca un vehiculo por su matricula
    async getVehiculoByMatricula(email) {

    }
}

module.exports = new VehiculosDb();