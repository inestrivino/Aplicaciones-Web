const express = require("express");
const router = express.Router();
const vehiculosDb = require("../db/vehiculosDb.js");
const concesionariosDb = require("../db/concesionariosDb.js");

router.get("/", async function (req, res, next) {
    try {
        const user = req.session.user;

        // Revisar si hay resultados filtrados en sesión
        let vehiculos = req.session.vehiculosFiltrados;
        let filters = req.session.filtrosAplicados || {};

        // Si no hay vehículos filtrados, traer todos
        if (!vehiculos) {
            const [todosVehiculos] = await vehiculosDb.getVehiculos();
            vehiculos = todosVehiculos;
        }

        // Limpiar la sesión para la siguiente carga
        delete req.session.vehiculosFiltrados;
        delete req.session.filtrosAplicados;

        // Obtener los selects para filtros
        const [concesionarios] = await concesionariosDb.getConcesionarios();
        const [marcas] = await vehiculosDb.getMarcas();
        const [colores] = await vehiculosDb.getColores();
        const [ciudades] = await concesionariosDb.getCiudades();
        const [plazas] = await vehiculosDb.getPlazas();

        res.render("vehiculos", {
            vehiculos,
            concesionarios,
            marcas,
            colores,
            filters,
            user,
            ciudades,
            plazas
        });

    } catch (error) {
        next(error);
    }
});

module.exports = router;