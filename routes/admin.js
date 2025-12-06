const express = require('express');
const router = express.Router();
router.use(express.json()); //para parsear el body
const multer = require("multer"); //para subir archivos
const upload = multer({ dest: 'uploads/' }); //carpeta temporal para subir archivos

const vechiculosDb = require("../db/vehiculosDb.js"); //db
const concesionariosDb = require("../db/concesionariosDb.js"); //db

router.get("/", function (request, response) {
    response.render("admin", { user: request.session.user, concesionarios:undefined, vehiculos: undefined, });
});

router.post("/rellenar", upload.single("file"), async function (request, response, next) {
    const fs = require('fs');
    if (!request.file) {
        const error = new Error("Ningun archivo seleccionado");
        next(error);
        return;
    }
    const pathArchivo = request.file.path;
    const file = fs.readFileSync(pathArchivo, 'utf8');
    const json = JSON.parse(file);
    fs.unlinkSync(pathArchivo);
    
    const concesionarios = json.concesionarios;
    [insertadosCon, erroresCon] = await introducirConcesionarios(concesionarios);

    const vehiculos = json.vehiculos;
    [insertados, pendientes, pendientesCompleto, errores] = await introducirVehiculos(vehiculos);
    
    request.session.insertados = insertados;
    request.session.errores = errores;
    request.session.pendientes = pendientesCompleto;
    response.render("admin", {
        user: request.session.user,
        vehiculos: true,
        concesionarios: true,
        insertadosCon: insertadosCon,
        erroresCon: erroresCon,
        VehiculosInsertados: insertados,
        VehiculosPendientes: pendientes,
        VehiculosErrores: errores
    });
});

//funcion auxiliar para introducir vehiculos
async function introducirVehiculos(vehiculos) {
    let insertados = [];
    let pendientes = [];
    let pendientesCompleto = [];
    let errores = [];
    for (let vehiculo of vehiculos) {
        try {
            resCon = await concesionariosDb.getConcesionarioById(vehiculo.id_concesionario);
            if (resCon[0].length === 0) {
                errores.push(vehiculo.matricula + " CONCESIONARIO_NO_EXISTE");
                continue;
            }
            res = await vechiculosDb.createVehiculo(vehiculo);
        } catch (error) {
            if (error.code === 'ER_DUP_ENTRY') {
                pendientes.push(vehiculo.matricula);
                pendientesCompleto.push(vehiculo);
                continue;
            }
            errores.push(vehiculo.matricula + " " + error.code);
            continue;
        }
        [rows] = res;
        if (rows.affectedRows > 0) {
            insertados.push(vehiculo.matricula);
        }
        else {
            errores.push(vehiculo.matricula);
        }
    }
    return [ insertados, pendientes, pendientesCompleto, errores ];
}

//funcion auxiliar para introducir concesionarios
async function introducirConcesionarios(concesionarios) {
    let insertados = [];
    let errores = [];
    for (let concesionario of concesionarios) {
        try {
            res = await concesionariosDb.createConcesionario(concesionario);
        } catch (error) {
            errores.push(concesionario.nombre + " " + error.code);
            continue;
        }
        [rows] = res;
        if (rows.affectedRows > 0) {
            insertados.push(concesionario.nombre);
        }
        else {
            errores.push(concesionario.nombre);
        }
    }
    return [ insertados, errores ];
}

router.post("/modificarPendientes", async function (request, response) {
    let insertados = request.session.insertados;
    const pendientes = request.session.pendientes;
    let errores = request.session.errores;
    for (let vehiculo of pendientes) {
        try {
            res = await vechiculosDb.updateVehiculo(vehiculo);
        } catch (error) {
            errores.push(vehiculo.matricula + " " + error.code);
            continue;
        }
        [rows] = res;
        if (rows.affectedRows > 0) {
            insertados.push(vehiculo.matricula);
        }
        else {
            errores.push(vehiculo.matricula);
        }
    }
    response.render("admin", {
        user: request.session.user,
        vehiculos: true,
        VehiculosInsertados: insertados,
        VehiculosPendientes: [],
        VehiculosErrores: errores
    });
});

module.exports = router;