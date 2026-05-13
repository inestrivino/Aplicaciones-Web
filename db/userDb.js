const pool = require("./pool.js");

class UserDb {
    //crear un nuevo usuario
    async createUser(user) {
        const [result] = await pool.query(
            'INSERT INTO users(name, email, password, rol, id_concesionario, accesibilidad) VALUES (?, ?, ?, "user", ?, ?)',
            [user.name, user.email, user.password, user.concesionario, user.accesibilidad]
        );
        return result;
    }

    //devuelve un usuario por su correo
    async getUserByEmail(email) {
        return pool.query(
            'SELECT * FROM users WHERE email = ?',
            [email]
        )
    }

    //actualiza un usuario (solo los valores recibidos)
    updateUser(id, request) {
        const fields = [];
        const values = [];

        if (request.name !== undefined) {
            fields.push("name = ?");
            values.push(request.name);
        }

        if (request.email !== undefined) {
            fields.push("email = ?");
            values.push(request.email);
        }

        if (request.rol !== undefined) {
            fields.push("rol = ?");
            values.push(request.rol);
        }

        if (request.id_concesionario !== undefined) {
            fields.push("id_concesionario = ?");
            values.push(request.id_concesionario);
        }

        const sql = `UPDATE users SET ${fields.join(", ")} WHERE id = ?`;
        values.push(id);
        return pool.query(sql, values);
    }

    //elimina un usuario
    deleteUser(id) {
        return pool.query(
            'DELETE FROM users WHERE id = ?',
            [id]
        );
    }

    //devuelve la lista de usuarios
    getUsers() {
        return pool.query(
            'SELECT id, name, email, rol, id_concesionario FROM users ORDER BY id'
        );
    }

    //devuelve un usuario dado su id
    getUserById(id) {
        return pool.query(
            'SELECT id, name, email, rol, id_concesionario FROM users WHERE id = ?', [id]
        );
    }

    getAccesibilidad(id) {
        return pool.query(
            "SELECT accesibilidad FROM users WHERE id = ?",
            [id]
        )
    }

    updateAccesibilidad(data, id) {
        return pool.query(
            "UPDATE users SET accesibilidad = ? WHERE id = ?",
            [JSON.stringify(data), id]
        )
    }

}

module.exports = new UserDb();