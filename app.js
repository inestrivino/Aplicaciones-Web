"use strict";
//IMPORTS
const path = require("path");
const express = require("express");

//CONFIGURACIONES
const app = express(); 
app.use(express.static("public"));
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

//DATOS TEMPORALES
const vehiculos = [
    {marca: "Toyota", modelo: "Corolla", year: 2020},
    {marca: "Honda", modelo: "Civic", year: 2019},
    {marca: "Ford", modelo: "Focus", year: 2018}
];

//RUTAS 
app.get("/", function(request, response){
    response.redirect("./public/index.html");
});

app.get("/vehiculos" , function(request, response){
    response.render("vehiculos", {modelo: "AAAAAAAAAAAA"});
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
