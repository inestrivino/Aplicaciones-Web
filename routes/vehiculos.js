const express = require('express');
const router = express.Router();
const ejs = require("ejs");

//DATOS TEMPORALES
const vehiculos = [
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
];

router.get("/" , async function(request, response){
    const htmlHeader = await ejs.renderFile("./views/header.ejs", {user: request.session.user});
    response.render("vehiculos", {vehiculos: vehiculos, header: htmlHeader});
});

module.exports = router;