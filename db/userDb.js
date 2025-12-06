const pool = require("./pool.js");

class UserDb {
    //crear un nuevo usuario
    createUser(user) {
        return pool.query(
            'INSERT INTO users(name, mail, password, rol) VALUES (?, ?, ?, "user")',
            [user.name, user.email, user.password]
        )
    }

    async getUserByEmail(email) {
        return pool.query(
            'SELECT name, password, rol FROM users WHERE mail = ?',
            [email]
        )
    }
}

module.exports = new UserDb();