"use strict";
//IMPORTS
const path = require("path");
const express = require("express");
const morgan = require("morgan");
const bodyParser = require("body-parser");

//CONFIGURACIONES
const app = express(); 
app.use(express.static("public"));
app.use(morgan("dev"));
app.use(bodyParser.urlencoded({ extended: false }));

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

//MIDDLEWARES


//RUTAS 
app.get("/a", function(request, response){
    try {
        throw new Error("Error de prueba");
    } catch (error) {
        next(error);
    }
    response.redirect("/index.html");
});
app.use("/reserva", require("./routes/reserva"));
app.use("/vehiculos", require("./routes/vehiculos"));

//ERRORES
app.use(function(err, request, response, next){
    response.render("error500");
});
app.use(function(request, response, next){
    response.status(404);
    response.render("error404");
});

//SERVIDOR
app.listen(3000, function(error){
    if(error)
        console.log("error");
    else
        console.log("Servidos en 3000");
});
