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

    async getMarcas() {
        return await pool.query(
            'SELECT DISTINCT marca FROM vehiculos'
        );
    }

    async getColores() {
        return await pool.query(
            'SELECT DISTINCT color FROM vehiculos'
        );
    }

    //busca un vehiculo por su matricula
    async getVehiculoByMatricula(matricula) {

    }

    filterVehiculos(filters) {
        let query = "SELECT * FROM vehiculos WHERE 1=1";
        let params = [];

        if (filters.marcaSelect) {
            query += " AND marca = ?";
            params.push(filters.marcaSelect);
        }

        if (filters.colorSelect) {
            query += " AND color = ?";
            params.push(filters.colorSelect);
        }

        if (filters.concesionarioSelect) {
            query += " AND id_concesionario = ?";
            params.push(filters.concesionarioSelect);
        }

        if (filters.autonomiaSelect) {
            // autonomía enviada será: 200, 300, 400, 500
            const value = parseInt(filters.autonomiaSelect);

            if (value === 500) query += " AND autonomia >= 500";
            else if (value === 400) query += " AND autonomia BETWEEN 400 AND 499";
            else if (value === 300) query += " AND autonomia BETWEEN 300 AND 399";
            else if (value === 200) query += " AND autonomia < 300";
        }

        return pool.query(query, params);
    }

}

module.exports = new VehiculosDb();