const express = require("express");
const router = express.Router();

const concesionariosDb = require("../db/concesionariosDb.js");

//mete un nuevo concesionario
router.post("/create", async function (request, response) {
    try {
        // Validar los datos del concesionario
        const { nombre, ciudad, direccion, telefono } = request.body;
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
        await concesionariosDb.createConcesionario(request.body);
        request.session.responseMessage = "Concesionario creado con éxito"
        response.redirect("/admin");

    } catch (error) {
        request.session.errorMessage = error.message;
        response.redirect("/admin");
    }
});

// actualiza un concesionario
router.post("/:id/update", async function (request, response) {
    try {
        const { nombre, ciudad, direccion, telefono } = request.body;
        const id = request.params.id;

        // Validaciones
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

        // Verificar que exista el concesionario
        const [existing] = await concesionariosDb.getConcesionarioById(id);
        if (!existing || existing.length === 0) {
            throw new Error("El concesionario no existe.");
        }

        await concesionariosDb.updateConcesionario(id, request.body);
        request.session.responseMessage = "Concesionario modificado con éxito"
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