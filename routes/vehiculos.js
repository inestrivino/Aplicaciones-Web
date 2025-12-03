const express = require('express');
const router = express.Router();
const ejs = require("ejs");
const vechiculosDb = require("../db/vehiculosDb.js");

//DATOS TEMPORALES
/*const vehiculos = [
    {
        imagen: '/img/vehiculos/byd_seal1.png',
        nombre: 'Tesla Model 3',
        matricula: "1234ABC",
        autonomia: "450 km"
    },
    {
        imagen: "/img/vehiculos/byd_seal2.png",
        nombre: "Renault Zoe",
        matricula: "5678DEF",
        autonomia: "395 km"
    },
    {
        imagen: "/img/vehiculos/byd_seal3.png",
        nombre: "Nissan Leaf",
        matricula: "9012GHI",
        autonomia: "270 km"
    },
    {
        imagen: "/img/vehiculos/byd_seal3.png",
        nombre: "Nissan Leaf",
        matricula: "9012GHI",
        autonomia: "270 km"
    }
];*/

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