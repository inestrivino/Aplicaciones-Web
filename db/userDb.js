const pool =  require("./pool.js");

class UserDb {
    //crear un nuevo usuario
    async createUser(user) {
        const res = await pool.query(
            'INSERT INTO users(name, mail, password, rol)' +
            'VALUES (?, ?, ?, "user")', 
            [user.name, user.email, user.password]
        );
    }

    async getUserByEmail(email) {
        
    }
}

module.exports = new UserDb();