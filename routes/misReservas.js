const express = require("express");
const router = express.Router();
const reservasDb = require("../db/reservasDb.js");

router.get("/", async function (request, response) {
    try {
        const userMail = request.session.user.mail;
        const reservasData = await reservasDb.getMisReservas(userMail);
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
