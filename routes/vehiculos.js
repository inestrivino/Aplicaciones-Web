const express = require("express");
const router = express.Router();
const vechiculosDb = require("../db/vehiculosDb.js");
const vehiculosDb = require("../db/vehiculosDb.js");

//devuelve la lista de vehiculos
router.get("/" , function(request, response) {
    vehiculos = vechiculosDb.getVehiculos().then(vehiculos => {
        [rows] = vehiculos;
        response.render("vehiculos", {
            user: request.session.user, 
            vehiculos: rows, 
        });
    });
    /* marcas = vechiculosDb.getMarcas().then(marcas => {
        [rows] = marcas;
        response.render("marcas", {
            user: request.session.user, 
            marcas: rows, 
        });
    });
    marcas = vechiculosDb.getMarcas().then(marcas => {
        [rows] = marcas;
        response.render("marcas", {
            user: request.session.user, 
            marcas: rows, 
        });
    }); */
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