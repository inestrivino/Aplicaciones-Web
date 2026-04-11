const express = require("express");
const router = express.Router();
const reservasDb = require("../db/reservasDb.js");
const vehiculosDb = require("../db/vehiculosDb.js");
const userDb = require("../db/userDb.js");

router.get("/", async function (request, response) {
    const vehiculosData = await vehiculosDb.getVehiculos();
    const marcasData = await vehiculosDb.getMarcas();
    const coloresData = await vehiculosDb.getColores();

    response.render("reserva", {
        mensaje: undefined,
        user: request.session.user,
        vehiculos: vehiculosData[0],
        marcas: marcasData[0],
        colores: coloresData[0]
    });
});


router.post("/", async function (request, response) {

    const mail = request.session.user.mail;
    const [rows] = await userDb.getUserByEmail(mail);
    if (!rows || rows.length === 0) {
        throw new Error("Usuario no encontrado en la base de datos");
    }
    const usuario = rows[0];
    const id_usuario = usuario.id;

    const aux = {
        id: id_usuario,
        matricula: request.body.matricula,
        fecha_ini: request.body.fecha_ini,
        fecha_fin: request.body.fecha_fin,
        kilometros: request.body.kilometros,
        incidencias: request.body.incidencias
    };
    reservasDb.createReserva(aux).then(async () => {
        const vehiculosData = await vehiculosDb.getVehiculos();
        const marcasData = await vehiculosDb.getMarcas();
        const coloresData = await vehiculosDb.getColores();

        response.render("reserva", {
            mensaje: "Reserva realizada con éxito",
            user: request.session.user,
            vehiculos: vehiculosData[0],
            marcas: marcasData[0],
            colores: coloresData[0]
        });
    });
});

module.exports = router;