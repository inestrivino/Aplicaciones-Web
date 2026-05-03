const express = require("express");
const router = express.Router();
const userDb = require("../../db/userDb.js");
const {
    comprobarUsuarioAdmin,
    comprobarUsuarioLogueado
} = require('../../app.js');

router.get("/", comprobarUsuarioAdmin, async (req, res) => {
    try {
        const [usuariosData] = await userDb.getUsers();
        const usuarios = usuariosData;

        res.json(usuarios);

    } catch (error) {
        res.status(500).json({ error: "Error obteniendo reservas" });
    }
});

router.get("/me", comprobarUsuarioLogueado, async (req, res) => {
    try {
        const userId = req.session?.user?.id;
        if (!userId) {
            return res.status(401).json({ error: "No autenticado" });
        }
        const [rows] = await userDb.getUserById(userId);
        if (rows.length === 0) {
            return res.status(404).json({ error: "Usuario no encontrado" });
        }
        res.json(rows[0]);
    } catch (error) {
        res.status(500).json({ error: "Error obteniendo el usuario"});
    }
});

module.exports = router;