const express = require('express');
const router = express.Router();
const ejs = require("ejs");

router.get("/", async function(request, response){
    const htmlHeader = await ejs.renderFile("./views/header.ejs", {user: request.session.user});
    response.render("misReservas", {header: htmlHeader});
});

module.exports = router;