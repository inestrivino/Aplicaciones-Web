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

const concesionariosDb = require("./db/concesionariosDb.js");

//RUTAS 
app.get("/", async function (request, response, next) {
    let error = undefined;
    if (request.session.error) {
        error = request.session.error;
        request.session.error = undefined;
    }

    try {
        const concesionariosRaw = await concesionariosDb.getConcesionarios();
        const concesionarios = concesionariosRaw[0]; // solo el array de concesionarios reales

        response.render("inicio", {
            error: error,
            user: request.session.user,
            concesionarios: concesionarios
        });

    } catch (err) {
        console.error(err);
        response.status(500).send("Error al cargar la página de inicio");
    }
});

app.use("/reserva", comprobarUsuarioLogueado, require("./routes/reserva"));
app.use("/vehiculos", comprobarUsuarioLogueado, require("./routes/vehiculos"));
app.use("/concesionarios", comprobarUsuarioLogueado, require("./routes/concesionarios"));
app.use("/user", require("./routes/user"));
app.use("/contacto", require("./routes/contacto"));
app.use("/misReservas", comprobarUsuarioLogueado, require("./routes/misReservas"));
app.use("/admin", comprobarUsuarioLogueado, comprobarUsuarioAdmin, require("./routes/admin"));

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
