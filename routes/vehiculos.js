const express = require("express");
const router = express.Router();
const vehiculosDb = require("../db/vehiculosDb.js");
const concesionariosDb = require("../db/concesionariosDb.js");
const fs = require("fs");
const path = require("path");

const matriculaRegex = /^\d{4}[A-Z]{3}$/;

// Crea un vehículo
router.post("/create", async function (req, res) {
    try {
        const { matricula, marca, modelo, plazas, autonomia, color, imagen, id_concesionario}  = req.body;

        // Validaciones
        if (!matricula || !matriculaRegex.test(matricula)) throw new Error("Matrícula inválida. Debe ser 4 números y 3 letras mayúsculas (1234ABC).");
        if (!marca || marca.trim() === "") throw new Error("La marca no puede estar vacía.");
        if (!modelo || modelo.trim() === "") throw new Error("El modelo no puede estar vacío.");
        if (!plazas || isNaN(plazas)) throw new Error("Plazas inválidas.");
        if (!autonomia || isNaN(autonomia)) throw new Error("Autonomía inválida.");
        if (!color || color.trim() === "") throw new Error("El color no puede estar vacío.");
        if (!id_concesionario || isNaN(id_concesionario)) throw new Error("ID de concesionario inválido.");

        // Verificar existencia del concesionario
        const [existingCon] = await concesionariosDb.getConcesionarioById(id_concesionario);
        if (!existingCon || existingCon.length === 0) throw new Error("El concesionario no existe.");

        // Validar imagen
        const imgPath = path.join(__dirname, "../public/img/vehiculos", imagen);
        if (!fs.existsSync(imgPath)) throw new Error("La imagen seleccionada no existe.");

        // Estado siempre disponible al crear
        const vehiculo = { matricula, marca, modelo, plazas, autonomia, color, estado: "disponible", id_concesionario, imagen };

        await vehiculosDb.createVehiculo(vehiculo);
        req.session.responseMessage = "Vehículo creado con éxito";
        res.redirect("/admin");

    } catch (error) {
        req.session.errorMessage = error.message;
        res.redirect("/admin");
    }
});

// Actualiza un vehículo
router.post("/:matricula/update", async function (req, res) {
    try {
        const matricula = req.params.matricula;
        const { marca, modelo, fecha, plazas, autonomia, color, estado, id_concesionario, imagen } = req.body;

        if (!marca || marca.trim() === "") throw new Error("La marca no puede estar vacía.");
        if (!modelo || modelo.trim() === "") throw new Error("El modelo no puede estar vacío.");
        if (!fecha) throw new Error("La fecha es obligatoria.");
        if (!plazas || isNaN(plazas)) throw new Error("Plazas inválidas.");
        if (!autonomia || isNaN(autonomia)) throw new Error("Autonomía inválida.");
        if (!color || color.trim() === "") throw new Error("El color no puede estar vacío.");
        if (!id_concesionario || isNaN(id_concesionario)) throw new Error("ID de concesionario inválido.");
        if (!["disponible", "reservado"].includes(estado)) throw new Error("El estado debe ser 'disponible' o 'reservado'.");

        // Verificar existencia del vehículo
        const [existingVeh] = await vehiculosDb.getVehiculoByMatricula(matricula);
        if (!existingVeh || existingVeh.length === 0) throw new Error("El vehículo no existe.");

        // Verificar existencia del concesionario
        const [existingCon] = await concesionariosDb.getConcesionarioById(id_concesionario);
        if (!existingCon || existingCon.length === 0) throw new Error("El concesionario no existe.");

        // Validar imagen
        const imgPath = path.join(__dirname, "../public/img/vehiculos", imagen);
        if (!fs.existsSync(imgPath)) throw new Error("La imagen seleccionada no existe.");

        const vehiculo = { marca, modelo, fecha, plazas, autonomia, color, estado, id_concesionario, imagen };
        await vehiculosDb.updateVehiculo(matricula, vehiculo);

        req.session.responseMessage = "Vehículo modificado con éxito";
        res.redirect("/admin");

    } catch (error) {
        req.session.errorMessage = error.message;
        res.redirect("/admin");
    }
});

// Elimina un vehículo
router.post("/:matricula/delete", async function (req, res) {
    try {
        const matricula = req.params.matricula.toUpperCase();

        const [existingVeh] = await vehiculosDb.getVehiculoByMatricula(matricula);
        if (!existingVeh || existingVeh.length === 0) {
            throw new Error("El vehículo no existe.");
        }

        await vehiculosDb.deleteVehiculo(matricula);
        req.session.responseMessage = "Vehículo eliminado con éxito";
        res.redirect("/admin");

    } catch (error) {
        req.session.errorMessage = error.message;
        res.redirect("/admin");
    }
});

module.exports = router;