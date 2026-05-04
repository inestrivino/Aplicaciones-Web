const express = require("express");
const router = express.Router();

const alertasDb = require("../../db/alertasDb");

router.get("/", async (req, res) => {
    try {
        const id_usuario = req.session.user.id;
        const [alertas] = await alertasDb.getAlertas(id_usuario);
        const noVistas = alertas.filter(a => !a.vista).length;

        return res.json({
            ok: true,
            alertas,
            noVistas
        });

    } catch (err) {
        console.error(err);
        return res.status(500).json({
            ok: false,
            error: "Error al obtener alertas"
        });
    }
});

router.post("/", async (req, res) => {
    try {
        // 1. Comprobar usuario logueado
        if (!req.session?.user) {
            return res.status(401).json({
                ok: false,
                error: "Usuario no autenticado"
            });
        }

        const id_usuario = req.session.user.id;

        // 2. Recoger datos del body
        const { matricula, id_reserva, texto, tipo } = req.body;

        // 3. Validación básica
        if (!texto || !tipo) {
            return res.status(400).json({
                ok: false,
                error: "Faltan datos obligatorios (texto, tipo)"
            });
        }

        // 4. Crear alerta
        const [resultado] = await alertasDb.createAlerta({
            id_usuario,
            matricula: matricula || null,
            id_reserva: id_reserva || null,
            texto,
            fecha: new Date(),
            tipo,
            vista: false
        });

        return res.status(201).json({
            ok: true,
            alerta: {
                id: resultado.insertId,
                id_usuario,
                matricula,
                id_reserva,
                texto,
                tipo,
                vista: false
            }
        });

    } catch (err) {
        console.error(err);
        return res.status(500).json({
            ok: false,
            error: "Error al crear la alerta"
        });
    }
});

router.delete("/:id", async (req, res) => {
    try {
        const id = parseInt(req.params.id);

        if (!id || isNaN(id)) {
            return res.status(400).json({
                ok: false,
                error: "ID inválido"
            });
        }

        await alertasDb.deleteAlerta(id);

        return res.json({
            ok: true,
            message: "Alerta eliminada"
        });

    } catch (err) {
        console.error(err);
        return res.status(500).json({
            ok: false,
            error: "Error al eliminar alerta"
        });
    }
});

router.put("/vista/:id", async (req, res) => {
    try {
        const id = parseInt(req.params.id);

        if (!id || isNaN(id)) {
            return res.status(400).json({
                ok: false,
                error: "ID inválido"
            });
        }

        await alertasDb.marcarVista(id);

        return res.json({
            ok: true,
            message: "Alerta marcada como vista"
        });

    } catch (err) {
        console.error(err);
        return res.status(500).json({
            ok: false,
            error: "Error al actualizar alerta"
        });
    }
});

module.exports = router;