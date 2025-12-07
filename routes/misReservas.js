const express = require('express');
const router = express.Router();

const reservas = [
    {
        vehiculo: {
            imagen: '/img/vehiculos/byd_seal1.png',
            nombre: 'Tesla Model 3',
            matricula: "1234ABC",
            autonomia: "450 km",
            plazas: 5,  // Asumiendo que faltaba esta propiedad
            concesionario: "Concesionario A"  // Agregado concesionario
        },
        fechaIni: "19-10-2025",
        fechaFin: "22-10-2025"
    },
    {
        vehiculo: {
            imagen: '/img/vehiculos/tesla_model_x.png',
            nombre: 'Tesla Model X',
            matricula: "5678XYZ",
            autonomia: "500 km",
            plazas: 7,
            concesionario: "Concesionario B"
        },
        fechaIni: "15-11-2025",
        fechaFin: "18-11-2025"
    }
];

router.get("/", async function (request, response) {
    response.render("misReservas", { user: request.session.user, reservas: reservas });
});

module.exports = router;
