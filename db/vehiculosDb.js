const pool =  require("./pool.js");

class VehiculosDb {
    //mete un nuevo vehiculo
    async createVehiculo(user) {
        
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
    async getUserByEmail(email) {
        
    }
}

module.exports = new VehiculosDb();