const express = require("express");
const router = express.Router();
const ejs = require("ejs");
const vechiculosDb = require("../db/vehiculosDb.js");

//devuelve la lista de vehiculos
router.get("/" , async function(request, response, next){
    const htmlHeader = await ejs.renderFile("./views/header.ejs", {user: request.session.user});
    try {
        vehiculos = await vechiculosDb.getVehiculos();
    } catch (error) {
        next(error);
        return;
    }
    response.render("vehiculos", {vehiculos: vehiculos, header: htmlHeader});
});

//mete un nuevo vehiculo
router.post("/nuevo", async function(request, response){
    
});

module.exports = router;