const express = require("express");
const router = express.Router();
const reservasDb = require("../db/reservasDb.js");
const vehiculosDb = require("../db/vehiculosDb.js");
const userDb = require("../db/userDb.js");

router.get("/", async function (request, response) {
    const vehiculosData = await vehiculosDb.getVehiculos();
    const marcasData = await vehiculosDb.getMarcas();
    const coloresData = await vehiculosDb.getColores();
    const errorMessage = request.session.errorMessage;
    const responseMessage = request.session.responseMessage;

    delete request.session.errorMessage;
    delete request.session.responseMessage;

    response.render("reserva", {
        errorMessage: errorMessage,
        responseMessage: responseMessage,
        user: request.session.user,
        vehiculos: vehiculosData[0],
        marcas: marcasData[0],
        colores: coloresData[0]
    });
});

router.post("/", async function (request, response) {
    try {
        const mail = request.session.user.mail;
        const [rows] = await userDb.getUserByEmail(mail);
        if (!rows || rows.length === 0) {
            throw new Error("Usuario no encontrado en la base de datos");
        }

        const usuario = rows[0];
        const id_usuario = usuario.id;
        const { matricula, fecha_ini, fecha_fin, kilometros, incidencias } = request.body;
        if (!matricula || !fecha_ini || !fecha_fin) {
            throw new Error("Todos los campos de fecha y matrícula son obligatorios");
        }

        const regexFecha = /^\d{4}-\d{2}-\d{2}$/;
        if (!regexFecha.test(fecha_ini) || !regexFecha.test(fecha_fin)) {
            throw new Error("Formato de fecha inválido. Debe ser YYYY-MM-DD");
        }
        const inicio = new Date(fecha_ini);
        const fin = new Date(fecha_fin);
        if (isNaN(inicio.getTime()) || isNaN(fin.getTime())) {
            throw new Error("Fechas inválidas");
        }
        const hoy = new Date();
        hoy.setHours(0, 0, 0, 0);
        const maxInicio = new Date(hoy);
        maxInicio.setFullYear(maxInicio.getFullYear() + 1);
        const maxFinDesdeInicio = new Date(inicio);
        maxFinDesdeInicio.setMonth(maxFinDesdeInicio.getMonth() + 3);

        if (fin <= inicio) {
            throw new Error("La fecha de fin debe ser posterior a la fecha de inicio");
        }
        if (inicio < hoy) {
            throw new Error("La fecha de inicio no puede ser anterior a hoy");
        }
        if (inicio > maxInicio) {
            throw new Error("La fecha de inicio no puede ser superior a un año desde hoy");
        }
        if (fin > maxFinDesdeInicio) {
            throw new Error("La fecha de fin no puede ser más de 3 meses después del inicio");
        }

        const [vehiculo] = await vehiculosDb.getVehiculoByMatricula(matricula);
        if (!vehiculo || vehiculo.length === 0) {
            throw new Error("El vehículo seleccionado no existe");
        }
        const disponible = await vehiculosDb.getDisponibilidadVehiculo(
            matricula,
            fecha_ini,
            fecha_fin
        );
        if (!disponible) {
            throw new Error("El vehículo no está disponible en las fechas seleccionadas");
        }

        const reserva = {
            id: id_usuario,
            matricula,
            fecha_ini,
            fecha_fin,
            kilometros,
            incidencias
        };

        await reservasDb.createReserva(reserva);
        request.session.responseMessage = "Reserva realizada con éxito";
        response.redirect("/reserva");

    } catch (err) {
        request.session.errorMessage = err.message || "Error desconocido";
        response.redirect("/reserva");
    }
});

router.post("/cancelar/:id", async (req, res) => {
    try {
        // Comprobar que el usuario está autenticado
        const mail = req.session.user.mail;
        const [rows] = await userDb.getUserByEmail(mail);
        if (!rows || rows.length === 0) {
            throw new Error("Usuario no encontrado en la base de datos");
        }
        const usuario = rows[0];
        const id_usuario = usuario.id;
        // Comprobar que la reserva tiene un formato válido y existe
        const id_reserva = parseInt(req.params.id);
        if (isNaN(id_reserva)) {
            throw new Error("ID de reserva inválido");
        }
        const [reservas] = await reservasDb.getReservaById(id_reserva);
        if (!reservas || reservas.length === 0) {
            throw new Error("La reserva no existe");
        }
        // Comprobar que la reserva pertenece al usuario
        const reserva = reservas[0];
        if (parseInt(reserva.id_usuario) !== parseInt(id_usuario)) {
            throw new Error("No tienes permiso para cancelar esta reserva");
        }
        // Solo permitir cancelar si es futura
        const hoy = new Date();
        const fecha_ini = new Date(reserva.fecha_ini);
        if (fecha_ini <= hoy) {
            throw new Error("No puedes cancelar una reserva ya iniciada");
        }
        // Si todo va bien, se cancela la reserva
        await reservasDb.cancelReserva(id_reserva);

        req.session.responseMessage = "Reserva cancelada correctamente";
        res.redirect("/misReservas");

    } catch (err) {
        req.session.errorMessage = err.message || "Error al cancelar reserva";
        res.redirect("/misReservas");
    }
});

router.post("/devolver/:id", async (req, res) => {
    try {
        // Comprobar que el usuario está autenticado
        const mail = req.session.user.mail;
        const [rows] = await userDb.getUserByEmail(mail);
        if (!rows || rows.length === 0) {
            throw new Error("Usuario no encontrado en la base de datos");
        }
        const usuario = rows[0];
        const id_usuario = usuario.id;

        //Comprobar que la reserva es válida y pertenece al usuario
        const id_reserva = parseInt(req.params.id);
        if (isNaN(id_reserva)) {
            throw new Error("ID de reserva inválido");
        }
        const [reservas] = await reservasDb.getReservaById(id_reserva);
        if (!reservas || reservas.length === 0) {
            throw new Error("La reserva no existe");
        }
        const reserva = reservas[0];
        if (parseInt(reserva.id_usuario) !== parseInt(id_usuario)) {
            throw new Error("No tienes permiso para modificar esta reserva");
        }

        //Comprobar que la reserva está en curso
        const hoy = new Date();
        const fecha_ini = new Date(reserva.fecha_ini);
        const fecha_fin = new Date(reserva.fecha_fin);
        if (hoy < fecha_ini) {
            throw new Error("La reserva aún no ha comenzado");
        }

        if (hoy > fecha_fin) {
            throw new Error("La reserva ya ha finalizado");
        }
        const hoyStr = hoy.toISOString().split("T")[0];
        await reservasDb.finalizarReserva(id_reserva, hoyStr);
        req.session.responseMessage = "Vehículo devuelto correctamente";
        res.redirect("/misReservas");

    } catch (err) {
        req.session.errorMessage = err.message || "Error al devolver vehículo";
        res.redirect("/misReservas");
    }
});

module.exports = router;