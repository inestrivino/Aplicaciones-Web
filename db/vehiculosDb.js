const pool = require("./pool.js");

class VehiculosDb {
    //mete un nuevo vehiculo
    async createVehiculo(vehiculo) {
        return await pool.query(
            'INSERT INTO vehiculos (matricula, marca, modelo, fecha, plazas, autonomia, color, imagen, id_concesionario) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [
                vehiculo.matricula,
                vehiculo.marca,
                vehiculo.modelo,
                vehiculo.fecha,
                vehiculo.plazas,
                vehiculo.autonomia,
                vehiculo.color,
                vehiculo.imagenCompleto,
                vehiculo.id_concesionario
            ]
        );
    }
    //actualiza un vehiculo
    updateVehiculo(matricula, vehiculo) {
        return pool.query(
            'UPDATE vehiculos SET marca = ?, modelo = ?, fecha = ?, plazas = ?, autonomia = ?, color = ?, imagen = ?, id_concesionario = ? ' +
            'WHERE matricula = ?',
            [vehiculo.marca, vehiculo.modelo, vehiculo.fecha, vehiculo.plazas, vehiculo.autonomia, vehiculo.color, vehiculo.imagenCompleto, vehiculo.id_concesionario, matricula]
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
            "SELECT v.*, c.nombre AS concesionario_nombre FROM vehiculos v LEFT JOIN concesionarios c ON v.id_concesionario = c.id ORDER BY v.matricula"
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

    async getPlazas() {
        return await pool.query(
            'SELECT DISTINCT plazas FROM vehiculos'
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
        let query = "SELECT v.*, c.nombre AS concesionario_nombre FROM vehiculos v LEFT JOIN concesionarios c ON v.id_concesionario = c.id";
        let params = [];
        let whereAdded = false;

        const addCondition = (condition, param) => {
            if (!whereAdded) {
                query += " WHERE " + condition;
                whereAdded = true;
            } else {
                query += " AND " + condition;
            }
            if (param !== undefined) {
                params.push(param);
            }
        };

        // Aplicar filtros
        if (filters.marcaSelect) {
            addCondition("marca = ?", filters.marcaSelect);
        }

        if (filters.colorSelect) {
            addCondition("color = ?", filters.colorSelect);
        }

        if (filters.concesionarioSelect) {
            addCondition("id_concesionario = ?", filters.concesionarioSelect);
        }

        if (filters.autonomiaSelect) {
            const value = parseInt(filters.autonomiaSelect);
            if (value === 500) {
                addCondition("autonomia >= 500");
            } else if (value === 400) {
                addCondition("autonomia BETWEEN 400 AND 499");
            } else if (value === 300) {
                addCondition("autonomia BETWEEN 300 AND 399");
            } else if (value === 200) {
                addCondition("autonomia < 300");
            }
        }

        if (filters.ciudadSelect) {
            addCondition("c.ciudad = ?", filters.ciudadSelect);
        }

        if (filters.plazasSelect) {
            addCondition("plazas = ?", filters.plazasSelect);
        }

        query += " ORDER BY v.matricula;";
        return pool.query(query, params);
    }

}

module.exports = new VehiculosDb();