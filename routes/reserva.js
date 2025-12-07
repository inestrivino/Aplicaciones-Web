const express = require('express');
const router = express.Router();
const ejs = require("ejs");
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
    response.reditect("/reserva");
});

module.exports = router;