"use strict";
const express = require("express");
const router = express.Router();
const vehiculosDb = require("../db/vehiculosDb.js");

router.get("/", async function(request, response, next) {
    try {
        const marcasData = await vehiculosDb.getMarcas();
        const coloresData = await vehiculosDb.getColores();
        
        const marcas = marcasData[0];
        const colores = coloresData[0];

        response.render("vehiculos", {
            user: request.session.user,
            marcas,
            colores,
        });

    } catch (err) {
        next(err);
    }
});

//mete un nuevo vehiculo
router.post("/create", function(request, response) {
    vehiculosDb.createVehiculo(request.body);
    response.redirect("/admin");
});

//actualiza un vehiculo
router.post("/:matricula/update", function(request, response) {
    console.log(request.body);
    vehiculosDb.updateVehiculo(request.params.matricula, request.body);
    response.redirect("/admin");
});

//elimina un vehiculo
router.post("/:matricula/delete", function(request, response) {
    vehiculosDb.deleteVehiculo(request.params.matricula);
    response.redirect("/admin");
});

module.exports = router;