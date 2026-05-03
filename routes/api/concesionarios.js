const express = require("express");
const router = express.Router();
const concesionariosDb = require("../../db/concesionariosDb.js");

// OBTENER LOS CONCESIONARIOS
router.get("/", async (req, res) => {
    try {
        const data = await concesionariosDb.getConcesionarios();
        res.json(data[0]);
    } catch (error) {
        res.status(500).json({ error: "Error obteniendo concesionarios" });
    }
});

// VALIDACIONES Y PARSERS
function validarConcesionario({ nombre, ciudad, direccion, telefono }) {
    if (!nombre || nombre.trim().length === 0)
        throw new Error("El nombre no puede estar vacío.");

    if (!ciudad || ciudad.trim().length === 0)
        throw new Error("La ciudad no puede estar vacía.");

    if (!direccion || direccion.trim().length === 0)
        throw new Error("La dirección no puede estar vacía.");

    if (!telefono || telefono.trim().length === 0)
        throw new Error("El teléfono no puede estar vacío.");

    if (!/^\d{9}$/.test(telefono))
        throw new Error("El teléfono debe tener 9 dígitos numéricos.");
}

function parseGeo(latitud, longitud) {
    if (!latitud || !longitud) {
        return {
            latitud: 40.4168,
            longitud: -3.7038
        };
    }

    const lat = parseFloat(latitud);
    const lng = parseFloat(longitud);

    if (isNaN(lat) || isNaN(lng)) {
        throw new Error("Latitud o longitud inválidas.");
    }

    return { latitud: lat, longitud: lng };
}

// CREAR CONCESIONARIO
router.post("/create", async function (request, response) {
    try {
        let { nombre, ciudad, direccion, telefono, latitud, longitud } = request.body;

        validarConcesionario({ nombre, ciudad, direccion, telefono });
        ({ latitud, longitud } = parseGeo(latitud, longitud));

        await concesionariosDb.createConcesionario({
            nombre,
            ciudad,
            direccion,
            telefono,
            latitud,
            longitud
        });

        return response.json({
            ok: true,
            message: "Concesionario creado con éxito"
        });

    } catch (error) {
        return response.status(400).json({
            ok: false,
            error: error.message
        });
    }
});

// ACTUALIZAR CONCESIONARIO
router.put("/:id", async (req, res) => {
    try {
        const id = req.params.id;

        if (!id || isNaN(id)) {
            return res.status(400).json({ error: "ID inválido" });
        }

        const { nombre, ciudad, direccion, telefono, latitud, longitud } = req.body;

        validarConcesionario({ nombre, ciudad, direccion, telefono });

        const [existing] = await concesionariosDb.getConcesionarioById(id);
        if (!existing || existing.length === 0) {
            return res.status(404).json({ error: "El concesionario no existe" });
        }

        const geo = parseGeo(latitud, longitud);

        await concesionariosDb.updateConcesionario(id, {
            nombre,
            ciudad,
            direccion,
            telefono,
            latitud: geo.latitud,
            longitud: geo.longitud
        });

        res.json({ success: true });

    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// ELIMINAR CONCESIONARIO
router.delete("/:id", async (req, res) => {
    try {
        const id = req.params.id;

        const [existing] = await concesionariosDb.getConcesionarioById(id);
        if (!existing || existing.length === 0) {
            return res.status(404).json({ error: "El concesionario no existe" });
        }

        await concesionariosDb.deleteConcesionario(id);

        res.json({ success: true });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;