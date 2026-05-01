const express = require("express");
const router = express.Router();

const vehiculosDb = require("../../db/vehiculosDb.js");
const concesionariosDb = require("../../db/concesionariosDb.js");

const fs = require("fs");
const path = require("path");

// OBTENER VEHICULOS CON FILTROS
router.get("/", async (req, res) => {
    try {
        const filters = {
            marcaSelect: req.query.marcaSelect || "",
            colorSelect: req.query.colorSelect || "",
            concesionarioSelect: req.query.concesionarioSelect || "",
            autonomiaSelect: req.query.autonomiaSelect || "",
            ciudadSelect: req.query.ciudadSelect || "",
            plazasSelect: req.query.plazasSelect || ""
        };

        let vehiculos;

        // Si hay filtros entonces usar filtro
        if (Object.values(filters).some(v => v !== "")) {
            const [rows] = await vehiculosDb.filterVehiculos(filters);
            vehiculos = rows;
        } else {
            const [rows] = await vehiculosDb.getVehiculos();
            vehiculos = rows;
        }

        res.json(vehiculos);

    } catch (error) {
        res.status(500).json({ error: "Error obteniendo vehículos" });
    }
});


// OBTENER FILTROS
router.get("/filtros", async (req, res) => {
    try {
        const [marcas] = await vehiculosDb.getMarcas();
        const [colores] = await vehiculosDb.getColores();
        const [plazas] = await vehiculosDb.getPlazas();
        const [concesionarios] = await concesionariosDb.getConcesionarios();
        const [ciudades] = await concesionariosDb.getCiudades();

        res.json({
            marcas,
            colores,
            plazas,
            concesionarios,
            ciudades
        });

    } catch (error) {
        res.status(500).json({ error: "Error obteniendo filtros" });
    }
});

// Ruta para obtener las fechas ocupadas de un vehículo
router.get("/fechasOcupado", async (req, res) => {
    const { matricula } = req.query;
    try {
        // Llamar a la función getFechasOcupadas de vehiculosDb
        const [rows] = await vehiculosDb.getFechasOcupadas(matricula);
        // Devolver las fechas ocupadas en formato JSON
        res.json({ ocupadas: rows });
    } catch (error) {
        console.error("Error al obtener fechas ocupadas:", error);
        res.status(500).json({ error: "Error al obtener fechas ocupadas" });
    }
});

router.get("/imagenes", async (req, res) => {
    try {
        const imgDir = path.join(__dirname, "../public/img/vehiculos");
        let imagenesVehiculos = [];
        if (fs.existsSync(imgDir)) {
            imagenesVehiculos = fs.readdirSync(imgDir);
        }

        res.json(imagenesVehiculos);

    } catch (error) {
        console.error("Error al obtener imágenes:", error);
        res.status(500).json({ error: "Error al obtener imágenes" });
    }
});

module.exports = router;