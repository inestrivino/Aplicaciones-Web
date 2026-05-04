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