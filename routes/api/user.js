const express = require("express");
const router = express.Router();
const userDb = require("../../db/userDb.js");

router.get("/", async (req, res) => {
    try {
        const [usuariosData] = await userDb.getUsers();
        const usuarios = usuariosData;
        
        res.json(usuarios);

    } catch (error) {
        res.status(500).json({ error: "Error obteniendo reservas" });
    }
});

module.exports = router;