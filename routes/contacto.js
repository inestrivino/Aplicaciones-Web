const express = require('express');
const router = express.Router();
const ejs = require("ejs");

router.get("/", async function(request, response){
    response.render("contacto", {user: request.session.user});
});

module.exports = router;