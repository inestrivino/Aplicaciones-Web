const express = require("express");
const router = express.Router();
const reservasDb = require("../db/reservasDb.js");
const vehiculosDb = require("../db/vehiculosDb.js");

router.get("/", async function (request, response) {
    const vehiculosData = await vehiculosDb.getVehiculos();
    const marcasData = await vehiculosDb.getMarcas();
    const coloresData = await vehiculosDb.getColores();

    response.render("reserva", {
        user: request.session.user,
        vehiculos: vehiculosData[0],
        marcas: marcasData[0],
        colores: coloresData[0]
    });
});


router.post("/", function (request, response) {
    console.log(request.body);
    let aux = request.body;
    aux.id_usuario = request.session.user.mail;
    reservasDb.createReserva(aux);
    response.reditect("/reserva");
});

module.exports = router;