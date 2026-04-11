const express = require('express');
const router = express.Router();
router.use(express.json()); //para parsear el body
const multer = require("multer"); //para subir archivos
const upload = multer({ dest: 'uploads/' }); //carpeta temporal para subir archivos

const vechiculosDb = require("../db/vehiculosDb.js"); //db
const concesionariosDb = require("../db/concesionariosDb.js"); //db
const usuariosDb = require("../db/userDb.js") //db
const reservasDb = require("../db/reservasDb.js") //db

const fs = require("fs");
const path = require("path");

router.get("/", async function (request, response, next) {
    try {
        const errorMessage = request.session.errorMessage;
        delete request.session.errorMessage;
        const responseMessage = request.session.responseMessage;
        delete request.session.responseMessage;

        // Recuperar resultados de inserción si vienen de /rellenar
        const insertadosCon = request.session.insertadosCon || [];
        const erroresCon = request.session.erroresCon || [];
        const pendientesCon = request.session.pendientesCon || [];
        const VehiculosInsertados = request.session.VehiculosInsertados || [];
        const VehiculosPendientes = request.session.VehiculosPendientes || [];
        const VehiculosErrores = request.session.VehiculosErrores || [];

        // Limpiar después de leer
        delete request.session.insertadosCon;
        delete request.session.erroresCon;
        delete request.session.pendientesCon;
        delete request.session.VehiculosInsertados;
        delete request.session.VehiculosPendientes;
        delete request.session.VehiculosErrores;

        // Obtener datos de DB
        const [vehiculos, concesionarios, usuarios] = await Promise.all([
            vechiculosDb.getVehiculos(),
            concesionariosDb.getConcesionarios(),
            usuariosDb.getUsers()
        ]);
        const [topConcesionarios] = await reservasDb.getTopConcesionarios();
        const [topVehiculos] = await reservasDb.getTopVehiculos();

        const [rowsVehiculos] = vehiculos;
        const [rowsConcesionarios] = concesionarios;
        const [rowsUsuarios] = usuarios;

        // Leer imágenes de /public/img/vehiculos
        const imgDir = path.join(__dirname, "../public/img/vehiculos");
        let imagenesVehiculos = [];
        if (fs.existsSync(imgDir)) {
            imagenesVehiculos = fs.readdirSync(imgDir);
        }

        response.render("admin", {
            user: request.session.user,
            vehiculosList: true,
            concesionarios: true,

            insertadosCon,
            erroresCon,
            pendientesCon,
            VehiculosInsertados,
            VehiculosPendientes,
            VehiculosErrores,

            vehiculos: rowsVehiculos,
            concesionarios: rowsConcesionarios,
            usuarios: rowsUsuarios,
            topConcesionarios,
            topVehiculos,

            errorMessage,
            responseMessage,
            imagenesVehiculos
        });
    } catch (err) {
        next(err);
    }
});

router.post("/rellenar", upload.single("file"), async function (request, response, next) {
    try {
        if (!request.file) {
            throw new Error("Ningún archivo seleccionado");
        }
        const pathArchivo = request.file.path;
        const file = fs.readFileSync(pathArchivo, "utf8");
        const json = JSON.parse(file);
        fs.unlinkSync(pathArchivo);

        // Insertar concesionarios
        const concesionarios = json.concesionarios;
        const [insertadosCon, pendientesCon, erroresCon] = await introducirConcesionarios(concesionarios);

        // Insertar vehículos
        const vehiculos = json.vehiculos;
        const [VehiculosInsertados, VehiculosPendientes, pendientesCompleto, VehiculosErrores] = await introducirVehiculos(vehiculos);

        // Guardar resultados en session
        request.session.insertadosCon = insertadosCon;
        request.session.erroresCon = erroresCon;
        request.session.pendientesCon = pendientesCon;
        request.session.VehiculosInsertados = VehiculosInsertados;
        request.session.VehiculosErrores = VehiculosErrores;
        request.session.VehiculosPendientes = VehiculosPendientes;
        request.session.pendientes = pendientesCompleto;
        request.session.insertados = VehiculosInsertados.slice();
        request.session.errores = VehiculosErrores.slice();

        // Redirigir a /admin para mostrar resultados
        response.redirect("/admin/");
    } catch (err) {
        next(err);
    }
});

//funcion auxiliar para introducir vehiculos
async function introducirVehiculos(vehiculos) {
    let insertados = [];
    let pendientes = [];
    let pendientesCompleto = [];
    let errores = [];

    for (let vehiculo of vehiculos) {
        try {
            // 1. Validar que todos los campos obligatorios existan y no sean NULL
            const camposObligatorios = [
                "matricula", "marca", "modelo", "plazas", "autonomia",
                "color", "imagen", "id_concesionario"
            ];
            for (const campo of camposObligatorios) {
                if (!vehiculo[campo]) {
                    throw new Error(`CAMPO_FALTANTE_${campo.toUpperCase()}`);
                }
            }

            // 2. Validar que el concesionario exista
            const resCon = await concesionariosDb.getConcesionarioById(vehiculo.id_concesionario);
            if (!resCon[0] || resCon[0].length === 0) {
                errores.push(`${vehiculo.matricula} CONCESIONARIO_NO_EXISTE`);
                continue;
            }

            // 3. Validar y asignar valor por defecto a 'imagen' si es necesario
            vehiculo.imagenCompleto = vehiculo.imagen;
            if (!vehiculo.imagenCompleto || vehiculo.imagenCompleto.trim() === "")
                vehiculo.imagenCompleto = "/img/vehiculos/byd_seal1.png"; // Ruta por defecto

            // 4. Convertir la fecha a DATETIME si es necesario
            if (vehiculo.fecha && typeof vehiculo.fecha === "string") {
                // Si la fecha está en formato "YYYY-MM-DD", añadir "00:00:00"
                if (!vehiculo.fecha.includes(" ")) {
                    vehiculo.fecha = `${vehiculo.fecha} 00:00:00`;
                }
            } else {
                // Si no hay fecha, usar la fecha actual
                vehiculo.fecha = new Date().toISOString().slice(0, 19).replace("T", " ");
            }

            // 5. Intentar insertar el vehículo
            const res = await vechiculosDb.createVehiculo(vehiculo);
            const [rows] = res;
            if (rows.affectedRows > 0) {
                insertados.push(vehiculo.matricula);
            } else {
                errores.push(`${vehiculo.matricula} ERROR_INSERCION`);
            }
        } catch (error) {
            if (error.message.includes("Duplicate")) {
                pendientes.push(vehiculo.matricula);
                pendientesCompleto.push(vehiculo);
            } else {
                errores.push(`${vehiculo.matricula} ${error.message}`);
            }
        }
    }

    return [insertados, pendientes, pendientesCompleto, errores];
}

//funcion auxiliar para introducir concesionarios
async function introducirConcesionarios(concesionarios) {
    let insertados = [];
    let errores = [];
    let pendientesCon = [];

    // Traer todos los concesionarios de la base de datos una sola vez
    const [existentes] = await concesionariosDb.getConcesionarios();

    for (let concesionario of concesionarios) {
        try {
            const duplicado = existentes.find(c =>
                String(c.nombre).trim().toLowerCase() === String(concesionario.nombre).trim().toLowerCase() &&
                String(c.direccion).trim().toLowerCase() === String(concesionario.direccion).trim().toLowerCase() &&
                String(c.telefono).trim() === String(concesionario.telefono).trim()
            );

            if (duplicado) {
                pendientesCon.push(concesionario.nombre);
                continue;
            }

            const res = await concesionariosDb.createConcesionario(concesionario);
            const [rows] = res;
            if (rows.affectedRows > 0) {
                insertados.push(concesionario.nombre);
            } else {
                errores.push(concesionario.nombre);
            }
        } catch (error) {
            errores.push(concesionario.nombre + " " + error.code);
        }
    }

    return [insertados, pendientesCon, errores];
}

router.post("/modificarPendientes", async function (request, response, next) {
    try {
        // Recuperar datos de sesión
        let insertados = request.session.insertados || [];
        let errores = request.session.errores || [];
        let pendientes = request.session.pendientes || [];

        // Procesar cada vehículo pendiente
        for (let vehiculo of pendientes) {
            try {
                const res = await vechiculosDb.updateVehiculo(vehiculo.matricula, vehiculo);
                const [rows] = res;
                if (rows.affectedRows > 0) {
                    insertados.push(vehiculo.matricula);
                } else {
                    errores.push(vehiculo.matricula);
                }
            } catch (error) {
                errores.push(vehiculo.matricula + " " + error.code);
            }
        }

        // Guardar resultados en la sesión
        request.session.insertados = insertados;
        request.session.errores = errores;
        request.session.pendientes = [];

        // Redirigir a /admin para que el GET se encargue del render
        response.redirect("/admin/");
    } catch (err) {
        next(err);
    }
});

module.exports = router;