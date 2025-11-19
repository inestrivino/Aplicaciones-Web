const express = require('express');
const router = express.Router();

router.get("/", async function(request, response){
    const htmlHeader = await ejs.renderFile("../views/header.ejs", );
    response.render("contacto", {header: htmlHeader});
});

module.exports = router;