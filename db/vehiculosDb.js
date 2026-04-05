const pool = require("./pool.js");

class VehiculosDb {
    //mete un nuevo vehiculo
    async createVehiculo(vehiculo) {
        return await pool.query(
            'INSERT INTO vehiculos(matricula, marca, modelo, plazas, autonomia, color, imagen, estado, id_concesionario) VALUES (?, ?, ?, ?, ?, ?, ?, "disponible", ?)',
            [vehiculo.matricula, vehiculo.marca, vehiculo.modelo, vehiculo.plazas, vehiculo.autonomia, vehiculo.color, vehiculo.imagen, vehiculo.id_concesionario]
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
            "SELECT v.*, c.nombre AS concesionario_nombre FROM vehiculos v LEFT JOIN concesionarios c ON v.id_concesionario = c.id WHERE v.estado = 'disponible' ORDER BY v.id_concesionario, v.matricula"
        );
    }
    async getVehiculosTodos() {
        return await pool.query(
            "SELECT * FROM vehiculos ORDER BY matricula"
        );
    }

    cambiarEstado(matricula, estado) {
        return pool.query(
            'UPDATE vehiculos SET estado = ? WHERE matricula = ?',
            [estado, matricula]
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

    //devuelve un vehiculo por su matricula
    async getVehiculoByMatricula(matricula) {
        return await pool.query(
            'SELECT * FROM vehiculos WHERE matricula = ?',
            [matricula]
        );
    }

    filterVehiculos(filters) {
        let query = "SELECT v.*, c.nombre AS concesionario_nombre FROM vehiculos v LEFT JOIN concesionarios c ON v.id_concesionario = c.id WHERE v.estado = 'disponible'";
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

        query += " ORDER BY v.id_concesionario, v.matricula;";

        return pool.query(query, params);
    }

}

module.exports = new VehiculosDb();