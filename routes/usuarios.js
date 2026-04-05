const express = require("express");
const router = express.Router();
const usuariosDb = require("../db/userDb.js");

// Crea un usuario
router.post("/create", async function (request, response) {
    try {
        const { name, mail, rol, telefono, id_concesionario } = request.body;

        // Validaciones
        if (!name || name.trim() === "") throw new Error("El nombre no puede estar vacío.");
        if (!mail || mail.trim() === "") throw new Error("El correo no puede estar vacío.");
        if (!rol || rol.trim() === "") throw new Error("El rol no puede estar vacío.");
        if (!telefono || !/^\d{9}$/.test(telefono)) throw new Error("El teléfono debe tener 9 dígitos numéricos.");
        if (!id_concesionario || isNaN(id_concesionario)) throw new Error("ID de concesionario inválido.");

        const [existing] = await usuariosDb.getUserByEmail(mail);
        if (existing) throw new Error("El correo ya está en uso.");

        await usuariosDb.createUser(request.body);
        request.session.responseMessage = "Usuario creado con éxito";
        response.redirect("/admin");

    } catch (error) {
        request.session.errorMessage = error.message;
        response.redirect("/admin");
    }
});

// Actualiza un usuario
router.post("/:id/update", async function (request, response) {
    try {
        const id = request.params.id;
        const { name, mail, rol, telefono, id_concesionario } = request.body;

        if (!id || isNaN(id)) throw new Error("ID inválido.");
        if (!name || name.trim() === "") throw new Error("El nombre no puede estar vacío.");
        if (!mail || mail.trim() === "") throw new Error("El correo no puede estar vacío.");
        if (!rol || rol.trim() === "") throw new Error("El rol no puede estar vacío.");
        if (!telefono || !/^\d{9}$/.test(telefono)) throw new Error("El teléfono debe tener 9 dígitos numéricos.");
        if (!id_concesionario || isNaN(id_concesionario)) throw new Error("ID de concesionario inválido.");

        const [existing] = await usuariosDb.getUserById(id);
        if (!existing || existing.length === 0) throw new Error("El usuario no existe.");

        const [existingUserByEmail] = await usuariosDb.getUserByEmail(mail);
        const [currentUser] = await usuariosDb.getUserById(id);
        const usuarioConCorreo = existingUserByEmail[0];
        const usuarioActual = currentUser[0];
        if (usuarioConCorreo && Number(usuarioConCorreo.id) !== Number(usuarioActual.id)) {
            throw new Error("El correo ya está en uso.");
        }

        await usuariosDb.updateUser(id, request.body);
        request.session.responseMessage = "Usuario modificado con éxito";
        response.redirect("/admin");

    } catch (error) {
        request.session.errorMessage = error.message;
        response.redirect("/admin");
    }
});

// Elimina un usuario
router.post("/:id/delete", async function (request, response) {
    const id = request.params.id;
    try {
        const [existing] = await usuariosDb.getUserById(id);
        if (!existing || existing.length === 0) throw new Error("El usuario no existe.");

        await usuariosDb.deleteUser(id);
        request.session.responseMessage = "Usuario eliminado con éxito";
        response.redirect("/admin");

    } catch (error) {
        request.session.errorMessage = error.message;
        response.redirect("/admin");
    }
});

module.exports = router;