const express = require("express");
const router = express.Router();
const ejs = require("ejs");
const vechiculosDb = require("../db/vehiculosDb.js");
const vehiculosDb = require("../db/vehiculosDb.js");

//devuelve la lista de vehiculos
router.get("/" , async function(request, response) {
    vehiculos = vechiculosDb.getVehiculos().then(vehiculos => {
        [rows] = vehiculos;
        response.render("vehiculos", {
            user: request.session.user, 
            vehiculos: rows, 
        });
    });
    
});

//mete un nuevo vehiculo
router.post("/create", async function(request, response) {
    vehiculosDb.createVehiculo(request.body);
    response.redirect("/admin");
});

//elimina un vehiculo
router.post("/:matricula/delete", async function(request, response) {
    vehiculosDb.deleteVehiculo(request.params.matricula);
    response.redirect("/admin");
});

//actualiza un vehiculo
router.post("/:matricula/update", async function(request, response) {
    console.log(request.body);
    vehiculosDb.updateVehiculo(request.params.matricula, request.body);
    response.redirect("/admin");
});

module.exports = router;