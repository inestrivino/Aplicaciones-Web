const pool = require("./pool.js");

class UserDb {
    //crear un nuevo usuario
    createUser(user) {
        return pool.query(
            'INSERT INTO users(name, mail, password, rol, id_concesionario) VALUES (?, ?, ?, "user", ?)',
            [user.name, user.email, user.password, user.concesionario]
        );
    }

    //devuelve un usuario por su correo
    async getUserByEmail(email) {
        return pool.query(
            'SELECT name, password, rol FROM users WHERE mail = ?',
            [email]
        )
    }
    
    //actualiza un vehiculo
    updateUser(id, user) {
        return pool.query(
            'UPDATE users SET name = ?, mail = ?, rol = ?, telefono = ?, id_concesionario = ? ' +
            'WHERE id = ?',
            [user.name, user.mail, user.rol, user.telefono, user.id_concesionario, id]
        );
    }

    //elimina un vehiculo
    deleteUser(id) {
        return pool.query(
            'DELETE FROM users WHERE id = ?',
            [id]
        );
    }

    //devuelve la lista de vehiculos
    getUsers() {
        return pool.query(
            'SELECT * FROM users ORDER BY id'
        );
    }
}

module.exports = new UserDb();