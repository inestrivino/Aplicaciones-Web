const express = require("express");
const router = express.Router();

// CARGA LA PÁGINA DE MISRESERVAS
router.get("/", (req, res) => {
    res.render("misReservas", {
        user: req.session.user || null
    });
});

module.exports = router;
