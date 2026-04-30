const express = require("express");
const router = express.Router();
const reservasDb = require("../../db/reservasDb.js");

router.get("/", async (req, res) => {
    try {
        const id_usuario = req.session?.user?.id;

        if (!id_usuario) {
            return res.status(401).json({ error: "No autenticado" });
        }

        const [reservasData] = await reservasDb.getMisReservas(id_usuario);
        const reservas = reservasData;

        res.json(reservas);

    } catch (error) {
        res.status(500).json({ error: "Error obteniendo reservas" });
    }
});

module.exports = router;