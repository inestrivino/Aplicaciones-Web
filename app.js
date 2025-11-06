"use strict";
const express = require("express");
const app = express(); 
app.use(express.static("public"));

app.get("/", function(request, response){
    response.redirect("./public/index.html");
});

app.get("/users" , function(request, response){
    response.json([
        {name: "Juan", age: 25},
        {name: "Ana", age: 28},
        {name: "Pedro", age: 30}
    ]);
});

app.listen(3000, function(error){
    if(error)
        console.log("error");
    else
        console.log("Servidos en 3000");
});
