const express = require("express");
const router = express.Router();
const reservasDb = require("../../db/reservasDb.js");
const vehiculosDb = require("../../db/vehiculosDb.js");

router.get("/", async (req, res) => {
    try {
        const id_usuario = req.session?.user?.id;

        if (!id_usuario) {
            return res.status(401).json({ error: "No autenticado" });
        }

        const [reservasData] = await reservasDb.getMisReservas(id_usuario);
        const reservas = reservasData;

        res.json(reservas);

    } catch (error) {
        res.status(500).json({ error: "Error obteniendo reservas" });
    }
});

router.post("/cancelar/:id", async (req, res) => {
    try {
        const idUsuario = req.session.user.id;

        const id_reserva = parseInt(req.params.id);
        if (isNaN(id_reserva)) {
            return res.status(400).json({ ok: false, error: "ID inválido" });
        }

        const [reservas] = await reservasDb.getReservaById(id_reserva);
        const reserva = reservas[0];

        if (!reserva || reserva.id_usuario != idUsuario) {
            return res.status(403).json({ ok: false, error: "No autorizado" });
        }

        const hoy = new Date();
        if (new Date(reserva.fecha_ini) < hoy) {
            return res.status(400).json({ ok: false, error: "No se puede cancelar" });
        }

        await reservasDb.cancelReserva(id_reserva);

        return res.json({
            ok: true,
            message: "Reserva cancelada correctamente"
        });

    } catch (err) {
        return res.status(500).json({ ok: false, error: err.message });
    }
});

router.post("/devolver/:id", async (req, res) => {
    try {
        const idUsuario = req.session.user.id;
        const id_reserva = parseInt(req.params.id);

        const [reservas] = await reservasDb.getReservaById(id_reserva);
        const reserva = reservas[0];

        if (!reserva || reserva.id_usuario != idUsuario) {
            return res.status(403).json({ ok: false, error: "No autorizado" });
        }

        const km = parseInt(req.body.kilometros);
        if (!isNaN(km) && km >= 0) {
            await vehiculosDb.actualizarKilometros(id_reserva, km);
        }

        const hoy = new Date();
        await reservasDb.finalizarReserva(id_reserva, hoy);

        if (req.body.accion === "feedback") {

            const puntuacionRaw = req.body.puntuacion;
            const comentarioRaw = req.body.comentario;

            const puntuacion = puntuacionRaw
                ? parseInt(puntuacionRaw)
                : null;

            const comentario = comentarioRaw?.trim() || null;

            if (puntuacion !== null && (puntuacion < 1 || puntuacion > 5)) {
                return res.status(400).json({
                    ok: false,
                    error: "Puntuación inválida"
                });
            }

            if (puntuacion !== null || comentario) {
                await reservasDb.insertFeedback({
                    id_reserva,
                    puntuacion,
                    comentario
                });
            }
        }

        return res.json({
            ok: true,
            message: "Vehículo devuelto correctamente"
        });

    } catch (err) {
        return res.status(500).json({ ok: false, error: err.message });
    }
});

router.post("/incidencia/:id", async (req, res) => {
    try {
        const idUsuario = req.session.user.id;
        const id_reserva = parseInt(req.params.id);

        const [reservas] = await reservasDb.getReservaById(id_reserva);
        const reserva = reservas[0];

        if (!reserva || reserva.id_usuario != idUsuario) {
            return res.status(403).json({ ok: false, error: "No autorizado" });
        }

        const { comentario } = req.body;
        console.log("COMENTARIO:", comentario);

        if (!comentario || comentario.trim() === "") {
            return res.status(400).json({
                ok: false,
                error: "Comentario obligatorio"
            });
        }

        await vehiculosDb.enviarIncidencia(
            reserva.id_usuario,
            reserva.matricula,
            comentario,
            new Date()
        );

        return res.json({
            ok: true,
            message: "Incidencia enviada"
        });

    } catch (err) {
        return res.status(500).json({ ok: false, error: err.message });
    }
});

module.exports = router;