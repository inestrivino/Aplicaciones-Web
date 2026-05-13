const express = require("express");
const router = express.Router();
const userDb = require("../../db/userDb.js");
const {
    comprobarUsuarioAdmin,
    comprobarUsuarioLogueado
} = require('../../app.js');

// DEVUELVE LOS USUARIOS DEL SISTEMA
router.get("/", comprobarUsuarioAdmin, async (req, res) => {
    try {
        const [usuariosData] = await userDb.getUsers();
        const usuarios = usuariosData;

        res.json(usuarios);

    } catch (error) {
        res.status(500).json({ error: "Error obteniendo reservas" });
    }
});

// DEVUELVE LA INFORMACION DEL USUARIO LOGUEADO
router.get("/me", comprobarUsuarioLogueado, async (req, res) => {
    try {
        const userId = req.session?.user?.id;
        if (!userId) {
            return res.status(401).json({ error: "No autenticado" });
        }
        const [rows] = await userDb.getUserById(userId);
        if (rows.length === 0) {
            return res.status(404).json({ error: "Usuario no encontrado" });
        }
        res.json(rows[0]);
    } catch (error) {
        res.status(500).json({ error: "Error obteniendo el usuario" });
    }
});

// ACTUALIZA EL PERFIL DEL USUARIO LOGUEADO
router.put("/updateProfile", comprobarUsuarioLogueado, async (req, res) => {
    try {
        const userId = req.session?.user?.id;

        const { name, email, id_concesionario } = req.body;

        if (!name || !email || !id_concesionario) {
            return res.status(400).json({
                ok: false,
                error: "Todos los campos son obligatorios"
            });
        }

        // Validar email duplicado
        if (email) {
            const [rows] = await userDb.getUserByEmail(email);
            const emailUser = rows?.[0];

            if (emailUser && emailUser.id != userId) {
                return res.status(400).json({
                    ok: false,
                    error: "El email ya está en uso"
                });
            }
        }

        await userDb.updateUser(userId, {
            name,
            email,
            rol: req.session.user.rol,
            id_concesionario
        });

        req.session.user = {
            ...req.session.user,
            name,
            email,
            id_concesionario
        };

        return res.json({
            ok: true,
            message: "Perfil actualizado correctamente",
            data: req.session.user
        });

    } catch (err) {
        console.error(err);

        return res.status(500).json({
            ok: false,
            error: err.message || "Error al actualizar perfil"
        });
    }
}
);

// DEVUELVE LA ACCESIBILIDAD DEL USUARIO
router.get("/accesibilidad", comprobarUsuarioLogueado, async (req, res) => {
    const userId = req.session?.user?.id;

    const [rows] = await userDb.getAccesibilidad(userId);

    res.json(
        rows[0]?.accesibilidad
            ? JSON.parse(rows[0].accesibilidad)
            : null
    );
});

// ACTUALIZA LA ACCESIBILIDAD DEL USUARIO
router.post("/accesibilidad", async (req, res) => {
    const userId = req.session?.user?.id;
    const data = req.body;

    await userDb.updateAccesibilidad(data, userId);

    res.sendStatus(200);
});

// ACCIONES CRUD DE ADMIN
router.post("/", comprobarUsuarioAdmin, async (req, res) => {
    try {
        const user = await userDb.createUser(req.body);

        return res.status(201).json({
            ok: true,
            message: "Usuario creado",
            data: user
        });

    } catch (err) {
        console.error(err);

        return res.status(400).json({
            ok: false,
            error: err.message || "Error al crear usuario"
        });
    }
});

router.put("/:id", comprobarUsuarioAdmin, async (req, res) => {
    try {
        const id = req.params.id;

        // 1. comprobar existencia
        const existing = await userDb.getUserById(id);
        const user = existing?.[0];

        if (!user) {
            return res.status(404).json({
                ok: false,
                error: "Usuario no encontrado"
            });
        }

        // 2. validar email duplicado
        if (req.body.email) {
            const [rows] = await userDb.getUserByEmail(req.body.email);
            const emailUser = rows?.[0];

            if (emailUser && emailUser.id != id) {
                return res.status(400).json({
                    ok: false,
                    error: "El email ya está en uso"
                });
            }
        }

        // 3. actualizar
        await userDb.updateUser(id, req.body);

        // 4. obtener actualizado
        const updated = await userDb.getUserById(id);
        const u = updated?.[0];

        // 5. sync sesión
        if (req.session.user && req.session.user.id == u.id) {
            req.session.user = {
                ...req.session.user,
                name: u.name,
                email: u.email,
                id_concesionario: u.id_concesionario
            };
        }

        return res.json({
            ok: true,
            message: "Usuario actualizado",
            data: u
        });

    } catch (err) {
        console.error(err);

        return res.status(500).json({
            ok: false,
            error: err.message || "Error al actualizar usuario"
        });
    }
});

router.delete("/:id", async (req, res) => {
    try {
        const id = req.params.id;

        const [existing] = await userDb.getUserById(id);

        if (!existing || existing.length === 0) {
            return res.status(404).json({
                ok: false,
                error: "Usuario no existe"
            });
        }

        if (req.body.email) {
            const [rows] = await userDb.getUserByEmail(req.body.email);
            const emailUser = rows?.[0];

            if (emailUser && emailUser.id != id) {
                return res.status(400).json({
                    ok: false,
                    error: "El email ya está en uso"
                });
            }
        }

        await userDb.deleteUser(id);

        return res.json({
            ok: true,
            message: "Usuario eliminado"
        });

    } catch (err) {
        console.error(err);

        return res.status(500).json({
            ok: false,
            error: err.message || "Error al eliminar usuario"
        });
    }
});

module.exports = router;