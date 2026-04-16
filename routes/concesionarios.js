const express = require("express");
const router = express.Router();

const concesionariosDb = require("../db/concesionariosDb.js");

//mete un nuevo concesionario
router.post("/create", async function (request, response) {
    try {
        let { nombre, ciudad, direccion, telefono, latitud, longitud } = request.body;

        // Validaciones básicas
        if (!nombre || nombre.trim().length === 0) {
            throw new Error("El nombre no puede estar vacío.");
        }
        if (!ciudad || ciudad.trim().length === 0) {
            throw new Error("La ciudad no puede estar vacía.");
        }
        if (!direccion || direccion.trim().length === 0) {
            throw new Error("La dirección no puede estar vacía.");
        }
        if (!telefono || telefono.trim().length === 0) {
            throw new Error("El teléfono no puede estar vacío.");
        }
        if (!/^\d{9}$/.test(telefono)) {
            throw new Error("El teléfono debe contener solo números y tener 9 dígitos.");
        }

        // geolocalización (opcional, si no hay establece puerta del sol)
        if (!latitud || !longitud) {
            latitud = 40.4168;
            longitud = -3.7038;
        } else {
            latitud = parseFloat(latitud);
            longitud = parseFloat(longitud);

            if (isNaN(latitud) || isNaN(longitud)) {
                throw new Error("Latitud o longitud inválidas.");
            }
        }

        await concesionariosDb.createConcesionario({
            nombre,
            ciudad,
            direccion,
            telefono,
            latitud,
            longitud
        });

        request.session.responseMessage = "Concesionario creado con éxito";
        response.redirect("/admin");

    } catch (error) {
        request.session.errorMessage = error.message;
        response.redirect("/admin");
    }
});

// actualiza un concesionario
router.post("/:id/update", async function (request, response) {
    try {
        let { nombre, ciudad, direccion, telefono, latitud, longitud } = request.body;
        const id = request.params.id;

        if (!id || isNaN(id)) {
            throw new Error("El ID debe ser un número válido.");
        }

        if (!nombre || nombre.trim().length === 0) {
            throw new Error("El nombre no puede estar vacío.");
        }
        if (!ciudad || ciudad.trim().length === 0) {
            throw new Error("La ciudad no puede estar vacía.");
        }
        if (!direccion || direccion.trim().length === 0) {
            throw new Error("La dirección no puede estar vacía.");
        }
        if (!telefono || telefono.trim().length === 0) {
            throw new Error("El teléfono no puede estar vacío.");
        }
        if (!/^\d{9}$/.test(telefono)) {
            throw new Error("El teléfono debe contener solo números y tener 9 dígitos.");
        }

        // geolocalización opcional
        if (!latitud || !longitud) {
            latitud = 40.4168;
            longitud = -3.7038;
        } else {
            latitud = parseFloat(latitud);
            longitud = parseFloat(longitud);

            if (isNaN(latitud) || isNaN(longitud)) {
                throw new Error("Latitud o longitud inválidas.");
            }
        }

        const [existing] = await concesionariosDb.getConcesionarioById(id);
        if (!existing || existing.length === 0) {
            throw new Error("El concesionario no existe.");
        }

        await concesionariosDb.updateConcesionario(id, {
            nombre,
            ciudad,
            direccion,
            telefono,
            latitud,
            longitud
        });

        request.session.responseMessage = "Concesionario modificado con éxito";
        response.redirect("/admin");

    } catch (error) {
        request.session.errorMessage = error.message;
        response.redirect("/admin");
    }
});

// elimina un concesionario
router.post("/:id/delete", async function (request, response) {
    try {
        const id = request.params.id;

        const [existing] = await concesionariosDb.getConcesionarioById(id);
        if (!existing || existing.length === 0) {
            throw new Error("El concesionario no existe.");
        }

        await concesionariosDb.deleteConcesionario(id);
        request.session.responseMessage = "Concesionario eliminado con éxito"
        response.redirect("/admin");

    } catch (error) {
        request.session.errorMessage = error.message;
        response.redirect("/admin");
    }
});

module.exports = router;