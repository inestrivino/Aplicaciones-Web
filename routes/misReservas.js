const express = require("express");
const router = express.Router();
const reservasDb = require("../db/reservasDb.js");
const userDb = require("../db/userDb.js");

router.get("/", async function (request, response, next) {
    try {
        const errorMessage = request.session.errorMessage;
        const responseMessage = request.session.responseMessage;

        delete request.session.errorMessage;
        delete request.session.responseMessage;

        const idUsuario = request.session.user.id;
        const [rows] = await userDb.getUserById(idUsuario);
        if (!rows || rows.length === 0) {
            throw new Error("Usuario no encontrado en la base de datos");
        }
        const reservasData = await reservasDb.getMisReservas(idUsuario);
        const reservas = reservasData[0];

        const hoy = new Date();
        hoy.setHours(0, 0, 0, 0);

        const enCurso = [];
        const proximas = [];
        const pasadas = [];

        for (const r of reservas) {
            const inicio = new Date(r.fecha_ini);
            const fin = new Date(r.fecha_fin);

            inicio.setHours(0, 0, 0, 0);
            fin.setHours(0, 0, 0, 0);

            if (inicio > hoy) {
                proximas.push(r);
            }
            else if (r.estado === "finalizada") {
                pasadas.push(r);
            }
            else {
                enCurso.push(r);
            }
        }

        response.render("misReservas", {
            reservas,
            enCurso,
            proximas,
            pasadas,
            user: request.session.user,
            errorMessage: errorMessage,
            responseMessage: responseMessage
        });
    } catch (err) {
        next(err);
    }
});

router.post("/cancelar/:id", async (req, res) => {
    try {
        // Comprobar que el usuario está autenticado
        const idUsuario = req.session.user.id;
        const [rows] = await userDb.getUserById(idUsuario);
        if (!rows || rows.length === 0) {
            throw new Error("Usuario no encontrado en la base de datos");
        }

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
        if (parseInt(reserva.id_usuario) !== parseInt(idUsuario)) {
            throw new Error("No tienes permiso para cancelar esta reserva");
        }
        // Solo permitir cancelar si es futura
        const hoy = new Date().toISOString().split("T")[0];
        const fecha_ini = new Date(reserva.fecha_ini).toISOString().split("T")[0];
        if (fecha_ini < hoy) {
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
        const idUsuario = req.session.user.id;
        const [rows] = await userDb.getUserById(idUsuario);
        if (!rows || rows.length === 0) {
            throw new Error("Usuario no encontrado en la base de datos");
        }

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
        if (parseInt(reserva.id_usuario) !== parseInt(idUsuario)) {
            throw new Error("No tienes permiso para modificar esta reserva");
        }

        //Comprobar que la reserva está en curso
        const hoy = new Date().toISOString().split("T")[0];
        const fecha_ini = new Date(reserva.fecha_ini).toISOString().split("T")[0];

        if (hoy < fecha_ini) {
            throw new Error("La reserva aún no ha comenzado");
        }

        if (reserva.estado === "finalizada") {
            throw new Error("La reserva ya ha finalizado");
        }

        if (reserva.estado === "cancelada") {
            throw new Error("La reserva fue cancelada");
        }

        // Devolver el vehículo
        await reservasDb.finalizarReserva(id_reserva, hoy);

        // Añadir el feedback
        if (req.body.accion === "feedback") {
            const puntuacion = parseInt(req.body.puntuacion);
            const comentario = req.body.comentario || null;

            if (isNaN(puntuacion) || puntuacion < 1 || puntuacion > 5) {
                throw new Error("Puntuación inválida");
            }

            await reservasDb.insertFeedback({
                id_reserva,
                puntuacion,
                comentario
            });
        }

        req.session.responseMessage = "Vehículo devuelto correctamente";
        res.redirect("/misReservas");

    } catch (err) {
        req.session.errorMessage = err.message || "Error al devolver vehículo";
        res.redirect("/misReservas");
    }
});

module.exports = router;
