const express = require('express');
const router = express.Router();
const ejs = require("ejs");

router.get("/", function (request, response) {
    response.render("reserva", { user: request.session.user });
});

router.post("/", function (request, response) {
    console.log(request.body);
    response.reditect("/reserva");
});

module.exports = router;