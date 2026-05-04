const express = require("express");
const router = express.Router();

// CARGA LA PÁGINA DE ALERTAS
router.get("/", (req, res) => {
    res.render("alertas", {
        user: req.session.user || null
    });
});

module.exports = router;