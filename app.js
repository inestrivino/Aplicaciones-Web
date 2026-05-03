"use strict";
//IMPORTS
const path = require("path");
const express = require("express");
const morgan = require("morgan");
const bodyParser = require("body-parser");
const session = require("express-session");

//CONFIGURACIONES
const app = express();
app.use(express.static("public"));
app.use(morgan("dev"));
app.use(bodyParser.urlencoded({ extended: false }));
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.json());
const middlewareSession = session({
    saveUninitialized: false,
    secret: "secreto12345",
    resave: false
});
module.exports = {
    comprobarUsuarioLogueado,
    comprobarUsuarioAdmin
};
app.use(middlewareSession);

//MIDDLEWARES
function comprobarUsuarioLogueado(request, response, next) {
    if (request.session.user === undefined) {
        request.session.error = "No autorizado";
        return response.redirect("/");
    }
    next();
}
function comprobarUsuarioAdmin(request, response, next) {
    if (request.session.user.rol !== "admin") {
        request.session.error = "No autorizado";
        return response.redirect("/");
    }
    next();
}

//INICIO
app.get("/", async function (request, response, next) {
    try {
        let error = undefined;
        if (request.session.error) {
            error = request.session.error;
            request.session.error = undefined;
        }

        response.render("inicio", {
            error: error,
            user: request.session.user,
        });
    } catch (err) {
        next(err);
    }
});

//RUTAS DE LA APLICACION
app.use("/reserva", comprobarUsuarioLogueado, require("./routes/reserva"));
app.use("/vehiculos", comprobarUsuarioLogueado, require("./routes/vehiculos"));
app.use("/user", require("./routes/user"));
app.use("/misReservas", comprobarUsuarioLogueado, require("./routes/misReservas"));
app.use("/admin", comprobarUsuarioLogueado, comprobarUsuarioAdmin, require("./routes/admin"));

//APIS DE LA APLICACIÓN
app.use("/api/concesionarios", require("./routes/api/concesionarios"));
app.use("/api/vehiculos", comprobarUsuarioLogueado, require("./routes/api/vehiculos"));
app.use("/api/misReservas", comprobarUsuarioLogueado, require("./routes/api/misReservas"));
app.use("/api/user", require("./routes/api/user"));
app.use("/api/admin", comprobarUsuarioAdmin, require("./routes/api/admin"));
app.use("/api/reserva", comprobarUsuarioLogueado, require("./routes/api/reserva"));

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
