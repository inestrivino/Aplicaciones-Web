const express = require("express");
const router = express.Router();
const reservasDb = require("../db/reservasDb.js");

router.get("/", async function (request, response) {
    try {
        //const userId = request.session.user.id;
        const reservasData = await reservasDb.getMisReservas(1);
        const reservas = reservasData[0]; 
        console.log(reservas);

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
