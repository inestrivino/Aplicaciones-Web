const express = require("express");
const router = express.Router();

// CARGA LA PÁGINA DE RESERVA
router.get("/", (req, res) => {
    res.render("reserva", {
        user: req.session.user || null
    });
});

module.exports = router;