const pool = require("./pool.js");

class VehiculosDb {

    //crea un vehiculo
    async createVehiculo(vehiculo) {
        return await pool.query(
            `INSERT INTO vehiculos 
            (matricula, marca, modelo, fecha, plazas, autonomia, color, imagen, id_concesionario, kilometros) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                vehiculo.matricula,
                vehiculo.marca,
                vehiculo.modelo,
                vehiculo.fecha,
                vehiculo.plazas,
                vehiculo.autonomia,
                vehiculo.color,
                vehiculo.imagenCompleto,
                vehiculo.id_concesionario,
                vehiculo.kilometros ?? 0
            ]
        );
    }

    //actualiza un vehiculo
    async updateVehiculo(matricula, vehiculo) {
        return await pool.query(
            `UPDATE vehiculos SET 
                marca = ?, 
                modelo = ?, 
                fecha = ?, 
                plazas = ?, 
                autonomia = ?, 
                color = ?, 
                imagen = ?, 
                id_concesionario = ?,
                kilometros = ?
             WHERE matricula = ?`,
            [
                vehiculo.marca,
                vehiculo.modelo,
                vehiculo.fecha,
                vehiculo.plazas,
                vehiculo.autonomia,
                vehiculo.color,
                vehiculo.imagenCompleto,
                vehiculo.id_concesionario,
                vehiculo.kilometros ?? 0,
                matricula
            ]
        );
    }

    //elimina un coche
    async deleteVehiculo(matricula) {
        return await pool.query(
            'DELETE FROM vehiculos WHERE matricula = ?',
            [matricula]
        );
    }

    //devuelve todos los coches en la bd
    async getVehiculos() {
        return await pool.query(
            `SELECT v.*, c.nombre AS concesionario_nombre 
             FROM vehiculos v 
             LEFT JOIN concesionarios c ON v.id_concesionario = c.id 
             ORDER BY v.matricula`
        );
    }

    //devuelve elementos para el frontend de los filtros
    async getMarcas() {
        return await pool.query('SELECT DISTINCT marca FROM vehiculos');
    }

    //devuelve los colores de vehiculos
    async getColores() {
        return await pool.query('SELECT DISTINCT color FROM vehiculos');
    }

    //devuelve las plazas de vehiculos
    async getPlazas() {
        return await pool.query('SELECT DISTINCT plazas FROM vehiculos');
    }

    //devuelve un vehiculo dada su matricula
    async getVehiculoByMatricula(matricula) {
        return await pool.query(
            'SELECT * FROM vehiculos WHERE matricula = ?',
            [matricula]
        );
    }

    //consigue la disponibilidad de un vehiculo entre unas fechas determinadas
    async getDisponibilidadVehiculo(matricula, fechaIni, fechaFin) {
        const [rows] = await pool.query(
            `
        SELECT COUNT(*) AS reservas_solapadas
        FROM reservas
        WHERE matricula = ?
        AND estado = 'activa'
        AND NOT (
            fecha_fin <= ?
            OR fecha_ini >= ?
        )
        `,
            [matricula, fechaIni, fechaFin]
        );
        return Number(rows[0].reservas_solapadas) === 0;
    }

    //aplica filtros a los vehiculos
    async filterVehiculos(filters) {
        let query = `
            SELECT v.*, c.nombre AS concesionario_nombre 
            FROM vehiculos v 
            LEFT JOIN concesionarios c ON v.id_concesionario = c.id
        `;
        let params = [];
        let whereAdded = false;

        const addCondition = (condition, param) => {
            query += whereAdded ? " AND " : " WHERE ";
            query += condition;
            whereAdded = true;
            if (param !== undefined) params.push(param);
        };

        if (filters.marcaSelect) addCondition("marca = ?", filters.marcaSelect);
        if (filters.colorSelect) addCondition("color = ?", filters.colorSelect);
        if (filters.concesionarioSelect) addCondition("id_concesionario = ?", filters.concesionarioSelect);
        if (filters.ciudadSelect) addCondition("c.ciudad = ?", filters.ciudadSelect);
        if (filters.plazasSelect) addCondition("plazas = ?", filters.plazasSelect);

        if (filters.autonomiaSelect) {
            const value = parseInt(filters.autonomiaSelect);
            if (value === 500) addCondition("autonomia >= 500");
            else if (value === 400) addCondition("autonomia BETWEEN 400 AND 499");
            else if (value === 300) addCondition("autonomia BETWEEN 300 AND 399");
            else if (value === 200) addCondition("autonomia < 300");
        }

        query += " ORDER BY v.matricula";

        return await pool.query(query, params);
    }

    //devuelve las fechas en las que un vehiculo está ocupado
    async getFechasOcupadas(matricula) {
        return await pool.query(
            `SELECT 
                DATE_FORMAT(fecha_ini, '%Y-%m-%d') AS fecha_ini,
                DATE_FORMAT(fecha_fin, '%Y-%m-%d') AS fecha_fin
             FROM reservas
             WHERE matricula = ?
             AND estado = 'activa'`,
            [matricula]
        );
    }

    //actualiza los kilometros recorridos por un vehiculo al terminar una reserva
    async actualizarKilometros(id_reserva, kilometros) {
        return await pool.query(
            `UPDATE vehiculos v
         JOIN reservas r ON v.matricula = r.matricula
         SET v.kilometros = v.kilometros + ?
         WHERE r.id = ?`,
            [kilometros, id_reserva]
        );
    }

    //devuelve la nota media de los 5 vehículos con nota más alta
    async getMediaVehiculos() {
        return await pool.query(
            `SELECT 
            v.matricula,
            v.marca,
            v.modelo,
            AVG(f.puntuacion) AS media_puntuacion,
            COUNT(f.id) AS total_reviews
        FROM vehiculos v
        JOIN reservas r ON v.matricula = r.matricula
        JOIN feedback f ON r.id = f.id_reserva
        GROUP BY v.matricula, v.marca, v.modelo
        ORDER BY media_puntuacion DESC
        LIMIT 5`
        );
    }

    //conseguir por cada coche sus kilometros totales recorridos
    async getKilometrosVehiculos() {
        return await pool.query(
            `SELECT 
            matricula,
            marca,
            modelo,
            kilometros
        FROM vehiculos
        ORDER BY kilometros DESC
        LIMIT 5`
        );
    }

    //inserta la incidencia en la base de datos
    async enviarIncidencia(idUsuario, matricula, comentario, fecha) {
        return await pool.query(
            `
        INSERT INTO incidentes (id_usuario, matricula, comentario, fecha)
        VALUES (?, ?, ?, ?)
        `,
            [idUsuario, matricula, comentario, fecha]
        );
    }

    //devuelve todas las incidentes con su vehiculo
    async getIncidenciasConVehiculo() {
        return await pool.query(`
        SELECT 
            i.id,
            i.matricula,
            i.comentario,
            i.fecha,
            v.modelo,
            COUNT(i.id) OVER (PARTITION BY i.matricula) AS total_incidencias
        FROM incidentes i
        JOIN vehiculos v ON i.matricula = v.matricula
        ORDER BY fecha DESC
    `);
    }
}

module.exports = new VehiculosDb();