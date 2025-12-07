const express = require("express");
const router = express.Router();
const reservasDb = require("../db/reservasDb.js");
const vehiculosDb = require("../db/vehiculosDb.js");

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


router.post("/", function (request, response) {
    
    let aux = request.body;
    aux.mail = request.session.user.mail;
    aux.condiciones = undefined;
    reservasDb.createReserva(aux).then(async (res) => {
        const vehiculosData = await vehiculosDb.getVehiculos();
        const marcasData = await vehiculosDb.getMarcas();
        const coloresData = await vehiculosDb.getColores();
        vehiculosDb.cambiarEstado(request.body.matricula, "reservado");

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