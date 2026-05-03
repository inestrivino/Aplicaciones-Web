const express = require("express");
const router = express.Router();
const vehiculosDb = require("../db/vehiculosDb.js");
const concesionariosDb = require("../db/concesionariosDb.js");

// CARGA LA PÁGINA DE VEHICULOS
router.get("/", (req, res) => {
    res.render("vehiculos", {
        user: req.session.user || null
    });
});

module.exports = router;