const express = require("express");
const router = express.Router();
const vechiculosDb = require("../db/vehiculosDb.js");
const vehiculosDb = require("../db/vehiculosDb.js");

router.get("/", async function(request, response) {
    try {
        const vehiculosData = await vechiculosDb.getVehiculos();
        const marcasData = await vechiculosDb.getMarcas();
        const coloresData = await vechiculosDb.getColores();

        const vehiculos = vehiculosData[0];
        const marcas = marcasData[0];
        const colores = coloresData[0];

        response.render("vehiculos", {
            user: request.session.user,
            vehiculos,
            marcas,
            colores
        });

    } catch (err) {
        console.error(err);
        response.status(500).send("Error al cargar vehículos");
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