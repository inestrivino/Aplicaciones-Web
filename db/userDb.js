const pool = require("./pool.js");

class UserDb {
    //crear un nuevo usuario
    async createUser(user) {
        const [result] = await pool.query(
            'INSERT INTO users(name, email, password, rol, id_concesionario) VALUES (?, ?, ?, "user", ?)',
            [user.name, user.email, user.password, user.concesionario]
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

    //actualiza un usuario
    updateUser(id, request) {
        return pool.query(
            'UPDATE users SET name = ?, email = ?, rol = ?, id_concesionario = ? ' +
            'WHERE id = ?',
            [request.name, request.email, request.rol, request.id_concesionario, id]
        );
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

    getUserById(id) {
        return pool.query(
            'SELECT id, name, email, rol, id_concesionario FROM users WHERE id = ?', [id]
        );
    }
}

module.exports = new UserDb();