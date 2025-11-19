const express = require('express');
const router = express.Router();

router.post("/register", async function(request, response){
    console.log(request.body);
    request.session.user = request.body.signUpName;
    console.log(request.session.user);
    const htmlHeader = await ejs.renderFile("./views/header.ejs", );
    response.render("inicio", {header: htmlHeader});
});

router.post("/login", function(request, response){
    console.log(request.body);
});

module.exports = router;