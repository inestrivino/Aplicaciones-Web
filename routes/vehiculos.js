const express = require("express");
const router = express.Router();
const vechiculosDb = require("../db/vehiculosDb.js");
const vehiculosDb = require("../db/vehiculosDb.js");

router.get("/", async function(request, response) {
    try {
        const vehiculosData = await vechiculosDb.getVehiculos();
        const marcasData = await vechiculosDb.getMarcas();
        const coloresData = await vechiculosDb.getColores();

        const vehiculos = vehiculosData[0];
        const marcas = marcasData[0];
        const colores = coloresData[0];

        response.render("vehiculos", {
            user: request.session.user,
            vehiculos,
            marcas,
            colores
        });

    } catch (err) {
        console.error(err);
        response.status(500).send("Error al cargar vehículos");
    }
});

//mete un nuevo vehiculo
router.post("/create", function(request, response) {
    vehiculosDb.createVehiculo(request.body);
    response.redirect("/admin");
});

router.get("/filter", async function (request, response) {
    const { marcaSelect, autonomiaSelect, concesionarioSelect, colorSelect } = request.query;

    let filters = {};
    if (marcaSelect) filters.marcaSelect = marcaSelect;
    if (autonomiaSelect) filters.autonomiaSelect = autonomiaSelect;
    if (concesionarioSelect) filters.concesionarioSelect = concesionarioSelect;
    if (colorSelect) filters.colorSelect = colorSelect;

    console.log(filters);

    try {
        const vehiculos = await vehiculosDb.filterVehiculos(filters);
        const marcas = (await vehiculosDb.getMarcas())[0];
        const colores = (await vehiculosDb.getColores())[0];

        response.render("vehiculos", {
            user: request.session.user,
            vehiculos: vehiculos[0],
            marcas,
            colores,
            concesionarios: response.locals.concesionarios 
        });

    } catch (err) {
        console.error(err);
        response.status(500).send("Error aplicando filtros");
    }
});


//actualiza un vehiculo
router.post("/:matricula/update", function(request, response) {
    console.log(request.body);
    vehiculosDb.updateVehiculo(request.params.matricula, request.body);
    response.redirect("/admin");
});

//elimina un vehiculo
router.post("/:matricula/delete", function(request, response) {
    vehiculosDb.deleteVehiculo(request.params.matricula);
    response.redirect("/admin");
});

module.exports = router;