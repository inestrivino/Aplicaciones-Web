const express = require("express");
const router = express.Router();
const reservasDb = require("../db/reservasDb.js");
const userDb = require("../db/userDb.js");

router.get("/", async function (request, response, next) {
    try {
        const mail = request.session.user.mail;
        const [rows] = await userDb.getUserByEmail(mail);
        if (!rows || rows.length === 0) {
            throw new Error("Usuario no encontrado en la base de datos");
        }
        const usuario = rows[0];
        const id = usuario.id;
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
