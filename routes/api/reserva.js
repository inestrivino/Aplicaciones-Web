const express = require("express");
const router = express.Router();
const reservasDb = require("../../db/reservasDb.js");
const vehiculosDb = require("../../db/vehiculosDb.js");
const userDb = require("../../db/userDb.js");
const alertasDb = require("../../db/alertasDb.js");

// CREA UNA RESERVA
router.post("/", async function (request, response) {
    try {
        const id_usuario = request.session.user.id;
        const [rows] = await userDb.getUserById(id_usuario);
        if (!rows || rows.length === 0) {
            throw new Error("Usuario no encontrado en la base de datos");
        }

        const { matricula, fecha_ini, fecha_fin } = request.body;
        if (!matricula || !fecha_ini || !fecha_fin) {
            throw new Error("Todos los campos de fecha y matrícula son obligatorios");
        }

        const regexFecha = /^\d{4}-\d{2}-\d{2}$/;
        if (!regexFecha.test(fecha_ini) || !regexFecha.test(fecha_fin)) {
            throw new Error("Formato de fecha inválido. Debe ser YYYY-MM-DD");
        }
        const inicio = new Date(fecha_ini);
        const fin = new Date(fecha_fin);
        if (isNaN(inicio.getTime()) || isNaN(fin.getTime())) {
            throw new Error("Fechas inválidas");
        }
        const hoy = new Date();
        hoy.setHours(0, 0, 0, 0);
        const maxInicio = new Date(hoy);
        maxInicio.setFullYear(maxInicio.getFullYear() + 1);
        const maxFinDesdeInicio = new Date(inicio);
        maxFinDesdeInicio.setMonth(maxFinDesdeInicio.getMonth() + 3);

        if (fin <= inicio) {
            throw new Error("La fecha de fin debe ser posterior a la fecha de inicio");
        }
        if (inicio < hoy) {
            throw new Error("La fecha de inicio no puede ser anterior a hoy");
        }
        if (inicio > maxInicio) {
            throw new Error("La fecha de inicio no puede ser superior a un año desde hoy");
        }
        if (fin > maxFinDesdeInicio) {
            throw new Error("La fecha de fin no puede ser más de 3 meses después del inicio");
        }

        const [vehiculos] = await vehiculosDb.getVehiculoByMatricula(matricula);
        if (!vehiculos || vehiculos.length === 0) {
            throw new Error("El vehículo seleccionado no existe");
        }
        const vehiculo = vehiculos?.[0];

        const disponible = await vehiculosDb.getDisponibilidadVehiculo(
            matricula,
            fecha_ini,
            fecha_fin
        );
        if (!disponible) {
            throw new Error("El vehículo no está disponible en las fechas seleccionadas");
        }

        const reserva = {
            id: id_usuario,
            matricula,
            fecha_ini,
            fecha_fin
        };

        const id_reserva = await reservasDb.createReserva(reserva);

        // Comprobar si se debe insertar una nueva alerta
        if (vehiculo.autonomia < 300) {
            await alertasDb.createAlerta({
                id_usuario,
                matricula,
                id_reserva,
                texto: `El vehículo ${vehiculo.matricula} recientemente reservado tiene baja autonomía (${vehiculo.autonomia} km).`,
                fecha: new Date(),
                tipo: `otro`,
                vista: false
            });
        }

        return response.json({
            ok: true,
            message: "Reserva realizada con éxito"
        });

    } catch (err) {
        response.status(400).json({
            ok: false,
            error: err.message
        });
    }
});

module.exports = router;