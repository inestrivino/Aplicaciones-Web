const express = require("express");
const router = express.Router();
const reservasDb = require("../db/reservasDb.js");
const userDb = require("../db/userDb.js");
const vehiculosDb = require("../db/vehiculosDb.js");

router.get("/", async function (request, response, next) {
    try {
        const errorMessage = request.session.errorMessage;
        const responseMessage = request.session.responseMessage;

        delete request.session.errorMessage;
        delete request.session.responseMessage;

        const idUsuario = request.session.user.id;
        const [rows] = await userDb.getUserById(idUsuario);
        if (!rows || rows.length === 0) {
            throw new Error("Usuario no encontrado en la base de datos");
        }
        const reservasData = await reservasDb.getMisReservas(idUsuario);
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

            if (inicio > hoy) {
                proximas.push(r);
            }
            else if (r.estado === "finalizada") {
                pasadas.push(r);
            }
            else {
                enCurso.push(r);
            }
        }

        response.render("misReservas", {
            reservas,
            enCurso,
            proximas,
            pasadas,
            user: request.session.user,
            errorMessage: errorMessage,
            responseMessage: responseMessage
        });
    } catch (err) {
        next(err);
    }
});

module.exports = router;
