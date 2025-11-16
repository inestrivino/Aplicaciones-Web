const express = require('express');
const router = express.Router();

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

router.get("/" , function(request, response){
    response.render("vehiculos", {vehiculos: vehiculos});
});

module.exports = router;