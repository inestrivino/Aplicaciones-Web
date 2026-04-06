const express = require("express");
const router = express.Router();
const reservasDb = require("../db/reservasDb.js");

router.get("/", async function (request, response) {
    try {
        const id = request.session.user.id;
        const reservasData = await reservasDb.getMisReservas(id);
        const reservas = reservasData[0];

        response.render("misReservas", {
            user: request.session.user,
            reservas
        });
    } catch (err) {
        next(err);
    }
});

module.exports = router;
