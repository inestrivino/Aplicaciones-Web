const express = require('express');
const router = express.Router();

router.get("/", async function (request, response) {
    response.render("misReservas", { user: request.session.user, reservas: reservas });
});

module.exports = router;
