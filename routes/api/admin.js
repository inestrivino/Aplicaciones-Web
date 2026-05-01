const express = require("express");
const router = express.Router();
const vehiculosDb = require("../../db/vehiculosDb.js");
const reservasDb = require("../../db/reservasDb.js");

router.get("/estadisticas", async (req, res) => {
    try {

        const results = await Promise.all([
            reservasDb.getTopConcesionarios(),
            reservasDb.getTopVehiculos(),
            vehiculosDb.getMediaVehiculos(),
            vehiculosDb.getKilometrosVehiculos()
        ]);

        const [
            topConcesionariosRaw,
            topVehiculosRaw,
            mediaVehiculosRaw,
            kmVehiculosRaw
        ] = results;

        const extractRows = (result) => Array.isArray(result) ? result[0] : result;

        res.json({
            topConcesionarios: extractRows(topConcesionariosRaw),
            topVehiculos: extractRows(topVehiculosRaw),
            mediaVehiculos: extractRows(mediaVehiculosRaw),
            kmVehiculos: extractRows(kmVehiculosRaw)
        });

    } catch (err) {
        console.error("Error en /estadisticas:", err);
        res.status(500).json({ error: "Error al obtener estadísticas" });
    }
});

router.get("/incidencias", async (req, res) => {
    try {
        const result = await vehiculosDb.getIncidenciasConVehiculo();
        const incidencias = Array.isArray(result) ? result[0] : result;

        res.json(incidencias);

    } catch (err) {
        console.error("Error en /incidencias:", err);
        res.status(500).json({ error: "Error al obtener incidencias" });
    }
});

module.exports = router;