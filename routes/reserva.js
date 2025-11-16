const express = require('express');
const router = express.Router();

router.get("/", function(request, response){
    response.render("reserva");
});

router.post("/", function(request, response){
    console.log(request.body);
    response.render("reserva");
});

module.exports = router;