const express = require('express');
const router = express.Router();
router.use(express.json()); 
const multer = require("multer");
const upload = multer({ dest: 'uploads/' }); 

const vechiculosDb = require("../db/vehiculosDb.js"); 
const concesionariosDb = require("../db/concesionariosDb.js");
const fs = require("fs");

// CARGA LA PÁGINA DE ADMIN
router.get("/", (req, res) => {
    res.render("admin", {
        user: req.session.user || null
    });
});

// PARA AÑADIR ELEMENTOS MASIVAMENTE CON UN JSON
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
        const [insertadosCon, erroresCon] = await introducirConcesionarios(concesionarios);

        // Insertar vehículos
        const vehiculos = json.vehiculos;
        const [VehiculosInsertados, VehiculosErrores] = await introducirVehiculos(vehiculos);

        // Guardar resultados en session
        request.session.insertadosCon = insertadosCon;
        request.session.erroresCon = erroresCon;
        request.session.VehiculosInsertados = VehiculosInsertados;
        request.session.VehiculosErrores = VehiculosErrores;
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

            // 4. Añadir fecha si es necesario
            if (!vehiculo.fecha) {
                vehiculo.fecha = new Date();
            }

            // 5. Comprobar si el vehículo ya existe por matrícula
            const [rowsExistente] = await vechiculosDb.getVehiculoByMatricula(vehiculo.matricula);
            if (rowsExistente.length > 0) {
                const [resUpdate] = await vechiculosDb.updateVehiculo(vehiculo.matricula, vehiculo);
                if (resUpdate.affectedRows > 0) {
                    insertados.push(vehiculo.matricula + " (actualizado)");
                } else {
                    errores.push(`${vehiculo.matricula} NO_ACTUALIZADO`);
                }
            } else {
                try {
                    const [resInsert] = await vechiculosDb.createVehiculo(vehiculo);
                    if (resInsert.affectedRows > 0) {
                        insertados.push(vehiculo.matricula + " (nuevo)");
                    } else {
                        errores.push(`${vehiculo.matricula} ERROR_INSERCION`);
                    }
                } catch (error) {
                    errores.push(`${vehiculo.matricula} ${error.code}`);
                }
            }
        } catch (error) {
            errores.push(`${vehiculo.matricula} ${error.message}`);
        }
    }

    return [insertados, errores];
}

//funcion auxiliar para introducir concesionarios
async function introducirConcesionarios(concesionarios) {
    let insertados = [];
    let errores = [];

    for (let concesionario of concesionarios) {
        try {
            // 1. Validar campos obligatorios
            const camposObligatorios = ["nombre", "ciudad", "direccion", "telefono", "latitud", "longitud"];
            for (const campo of camposObligatorios) {
                if (
                    concesionario[campo] === undefined ||
                    concesionario[campo] === null ||
                    concesionario[campo].toString().trim() === ""
                ) {
                    throw new Error(`CAMPO_FALTANTE_${campo.toUpperCase()}`);
                }
            }

            // 2. Normalizar datos
            concesionario.nombre = concesionario.nombre.trim();
            concesionario.ciudad = concesionario.ciudad.trim();
            concesionario.direccion = concesionario.direccion.trim();
            concesionario.telefono = concesionario.telefono.toString().trim();

            // Convertir las coordenadas
            concesionario.latitud = parseFloat(concesionario.latitud);
            concesionario.longitud = parseFloat(concesionario.longitud);

            // 3. Validaciones básicas
            if (!/^[0-9]+$/.test(concesionario.telefono)) {
                throw new Error("TELEFONO_INVALIDO");
            }

            if (concesionario.nombre.length < 3) {
                throw new Error("NOMBRE_DEMASIADO_CORTO");
            }

            // Validamos las geolocalizaciones
            if (isNaN(concesionario.latitud) || isNaN(concesionario.longitud)) {
                throw new Error("COORDENADAS_INVALIDAS");
            }

            if (concesionario.latitud < -90 || concesionario.latitud > 90) {
                throw new Error("LATITUD_INVALIDA");
            }

            if (concesionario.longitud < -180 || concesionario.longitud > 180) {
                throw new Error("LONGITUD_INVALIDA");
            }

            // 4. Comprobar si existe por nombre
            const [rowsExistente] = await concesionariosDb.getConcesionarioByNombre(concesionario.nombre);

            if (rowsExistente.length > 0) {
                const id = rowsExistente[0].id;

                const [resUpdate] = await concesionariosDb.updateConcesionario(id, concesionario);

                if (resUpdate.affectedRows > 0) {
                    insertados.push(concesionario.nombre + " (actualizado)");
                } else {
                    errores.push(concesionario.nombre + " NO_ACTUALIZADO");
                }

            } else {
                const [resInsert] = await concesionariosDb.createConcesionario(concesionario);

                if (resInsert.affectedRows > 0) {
                    insertados.push(concesionario.nombre + " (nuevo)");
                } else {
                    errores.push(concesionario.nombre + " NO_INSERTADO");
                }
            }

        } catch (error) {
            errores.push(`${concesionario.nombre || "SIN_NOMBRE"} ${error.message}`);
        }
    }

    return [insertados, errores];
}

module.exports = router;