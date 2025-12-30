"use strict";
const express = require("express");
const router = express.Router();
const vehiculosDb = require("../../db/vehiculosDb.js");

//devuelve la lista de vehiculos
router.get("/all", async function(request, response) {
    try {
        const vehiculosData = await vehiculosDb.getVehiculos();         
        const vehiculos = vehiculosData[0];
        response.json(vehiculos);
    } catch (err) {
        next(err);
    }       
});

//devuelve la lista de vehiculos filtrados
router.get("/filter", async function (request, response, next) {
    const { marcaSelect, autonomiaSelect, concesionarioSelect, colorSelect } = request.query;

    let filters = {};
    if (marcaSelect) filters.marcaSelect = marcaSelect;
    if (autonomiaSelect) filters.autonomiaSelect = autonomiaSelect;
    if (concesionarioSelect) filters.concesionarioSelect = concesionarioSelect;
    if (colorSelect) filters.colorSelect = colorSelect;

    try {
        const vehiculos = await vehiculosDb.filterVehiculos(filters);
        response.json(vehiculos[0]);
    } catch (err) {
        next(err);
    }
});

module.exports = router;