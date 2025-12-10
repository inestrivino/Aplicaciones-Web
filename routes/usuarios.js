const express = require("express");
const router = express.Router();
const usuariosDb = require("../db/userDb.js")

//actualiza un usuario
router.post("/:id/update", function(request, response) {
    console.log(request.body);
    usuariosDb.updateUser(request.params.id, request.body);
    response.redirect("/admin");
});

//elimina un usuario
router.post("/:id/delete", function(request, response) {
    usuariosDb.deleteUser(request.params.id);
    response.redirect("/admin");
});

module.exports = router;