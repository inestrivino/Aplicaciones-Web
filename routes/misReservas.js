const express = require("express");
const router = express.Router();
const reservasDb = require("../db/reservasDb.js");

router.get("/", async function (request, response) {
    try {
        const userMail = request.session.user.mail; // o .id si usas ID
        const reservasData = await reservasDb.getMisReservas(userMail);
        const reservas = reservasData[0];

        response.render("misReservas", {
            user: request.session.user,
            reservas
        });
    } catch (err) {
        console.error(err);
        response.status(500).send("Error al cargar tus reservas");
    }
});

module.exports = router;
