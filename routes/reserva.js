const express = require("express");
const router = express.Router();
const reservasDb = require("../db/reservasDb.js");
const vehiculosDb = require("../db/vehiculosDb.js");
const userDb = require("../db/userDb.js");

router.get("/", async function (request, response) {
    const vehiculosData = await vehiculosDb.getVehiculos();
    const marcasData = await vehiculosDb.getMarcas();
    const coloresData = await vehiculosDb.getColores();
    const errorMessage = request.session.errorMessage;
    const responseMessage = request.session.responseMessage;

    delete request.session.errorMessage;
    delete request.session.responseMessage;

    response.render("reserva", {
        errorMessage: errorMessage,
        responseMessage: responseMessage,
        user: request.session.user,
        vehiculos: vehiculosData[0],
        marcas: marcasData[0],
        colores: coloresData[0]
    });
});

module.exports = router;