"use strict";
//IMPORTS
const path = require("path");
const express = require("express");
const morgan = require("morgan");
const bodyParser = require("body-parser");
const session = require("express-session");
const ejs = require("ejs");

//CONFIGURACIONES
const app = express();
app.use(express.static("public"));
app.use(morgan("dev")); //no se si hace falta esto
app.use(bodyParser.urlencoded({ extended: false }));
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
const middlewareSession = session({
    saveUninitialized: false,
    secret: "secreto12345",
    resave: false
});
app.use(middlewareSession);

//RUTAS 
app.get("/", async function (request, response, next) {
    ejs.renderFile("./views/header.ejs", { user: request.session.user }, (err, htmlHeader) => {
        if (err) {
            console.error(err);
            next(err);
            return;
        }
        let error = undefined;
        if (request.session.error) {
            error = request.session.error;
            request.session.error = undefined;
        }
        response.render("inicio", { error: error, header: htmlHeader });
    });
});
app.use("/reserva", require("./routes/reserva"));
app.use("/vehiculos", require("./routes/vehiculos"));
app.use("/user", require("./routes/user"));
app.use("/contacto", require("./routes/contacto"));
app.use("/misReservas", require("./routes/misReservas"));
app.use("/admin", require("./routes/admin"));

//ERRORES
app.use(function (err, request, response, next) {
    console.error(err.stack);
    response.render("error500");
});
app.use(function (request, response, next) {
    response.status(404);
    response.render("error404");
});

//SERVIDOR
app.listen(3000, function (error) {
    if (error)
        console.log("error");
    else
        console.log("Servidos en 3000");
});
