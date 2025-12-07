const express = require("express");
const router = express.Router();

const concesionariosDb = require("../db/concesionariosDb.js");

//mete un nuevo vehiculo
router.post("/create", async function(request, response) {
    concesionariosDb.createConcesionario(request.body);
    response.redirect("/admin");
});

//actualiza un vehiculo
router.post("/:id/update", async function(request, response) {
    console.log(request.body);
    concesionariosDb.updateConcesionario(request.params.id, request.body);
    response.redirect("/admin");
});

//elimina un vehiculo
router.post("/:id/delete", async function(request, response) {
    concesionariosDb.deleteConcesionario(request.params.id);
    response.redirect("/admin");
});

module.exports = router;