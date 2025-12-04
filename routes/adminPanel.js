const express = require('express');
const router = express.Router();
const ejs = require("ejs");
router.use(express.json());

router.get("/", async function(request, response){
    const htmlHeader = await ejs.renderFile("./views/header.ejs", {user: request.session.user});
    response.render("adminPanel", {header: htmlHeader});
});

router.post("/rellenar", function(request, response){
    request.session.destroy();
    response.redirect("/");
});

module.exports = router;