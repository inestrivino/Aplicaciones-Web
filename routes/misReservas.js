const express = require("express");
const router = express.Router();
const reservasDb = require("../db/reservasDb.js");
const userDb = require("../db/userDb.js");

router.get("/", async function (request, response, next) {
    try {
        const errorMessage = request.session.errorMessage;
        const responseMessage = request.session.responseMessage;

        delete request.session.errorMessage;
        delete request.session.responseMessage;

        const mail = request.session.user.mail;
        const [rows] = await userDb.getUserByEmail(mail);
        if (!rows || rows.length === 0) {
            throw new Error("Usuario no encontrado en la base de datos");
        }
        const usuario = rows[0];
        const id = usuario.id;
        const reservasData = await reservasDb.getMisReservas(id);
        const reservas = reservasData[0];

        const hoy = new Date();
        hoy.setHours(0, 0, 0, 0);

        const enCurso = [];
        const proximas = [];
        const pasadas = [];

        for (const r of reservas) {
            const inicio = new Date(r.fecha_ini);
            const fin = new Date(r.fecha_fin);

            inicio.setHours(0, 0, 0, 0);
            fin.setHours(0, 0, 0, 0);

            if (inicio <= hoy && fin > hoy) {
                enCurso.push(r);
            } else if (inicio > hoy) {
                proximas.push(r);
            } else {
                pasadas.push(r);
            }
        }

        response.render("misReservas", {
            reservas,
            enCurso,
            proximas,
            pasadas,
            user: request.session.user,
            errorMessage : errorMessage,
            responseMessage : responseMessage
        });
    } catch (err) {
        next(err);
    }
});

module.exports = router;
