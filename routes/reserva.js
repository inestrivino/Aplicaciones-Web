const express = require('express');
const router = express.Router();
const renderHeader = require("../services/renderHeader");

router.get("/", async function(request, response){
    const htmlHeader = await renderHeader();
    response.render("reserva", {header: htmlHeader});
});

router.post("/", async function(request, response){
    console.log(request.body);
    const htmlHeader = await ejs.renderFile("../views/header.ejs", );
    response.render("reserva", {header: htmlHeader});
});

module.exports = router;