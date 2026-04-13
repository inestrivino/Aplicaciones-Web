const express = require("express");
const router = express.Router();
const userDb = require("../db/userDb.js");
const bcrypt = require("bcrypt");


// ============================
// 🔐 VALIDACIONES
// ============================

function validarEmail(campo) {
    return function (req, res, next) {
        const value = req.body[campo];

        if (/[._-]{2,}/.test(value)) {
            req.session.error = "Email inválido.";
            return res.redirect("/");
        }

        if (!/^[A-Za-z0-9@._-]+$/.test(value)) {
            req.session.error = "Email con caracteres inválidos.";
            return res.redirect("/");
        }

        if (!/^[^@]+@ucm\.[^@]+$/.test(value)) {
            req.session.error = "Debe ser @ucm.";
            return res.redirect("/");
        }

        next();
    };
}

function validarPassword(campo) {
    return function (req, res, next) {
        const p = req.body[campo];

        if (!/[0-9]/.test(p)) {
            req.session.error = "Falta número";
            return res.redirect("/");
        }

        if (!/[A-Z]/.test(p)) {
            req.session.error = "Falta mayúscula";
            return res.redirect("/");
        }

        if (!/[a-z]/.test(p)) {
            req.session.error = "Falta minúscula";
            return res.redirect("/");
        }

        if (p.length < 8) {
            req.session.error = "Muy corta";
            return res.redirect("/");
        }

        if (p.length > 50) {
            req.session.error = "Demasiado larga";
            return res.redirect("/");
        }

        next();
    };
}

function validarPassword2(campo) {
    return function (req, res, next) {
        if (/['\/]/.test(req.body[campo])) {
            req.session.error = "Caracteres inválidos en contraseña";
            return res.redirect("/");
        }
        next();
    };
}

function validarNombre(req, res, next) {
    if (/['\/]/.test(req.body.signUpName)) {
        req.session.error = "Nombre inválido";
        return res.redirect("/");
    }
    next();
}


// ============================
// AUTENTIFICACION
// ============================

// REGISTER
router.post(
    "/register",
    validarEmail("signUpEmail"),
    validarPassword("signUpPassword"),
    validarPassword2("signUpPassword"),
    validarNombre,
    async (req, res, next) => {
        try {
            if (req.body.signUpPassword !== req.body.signUpConfirmPassword) {
                req.session.error = "Las contraseñas no coinciden.";
                return res.redirect("/");
            }

            const hash = await bcrypt.hash(req.body.signUpPassword, 10);

            await userDb.createUser({
                email: req.body.signUpEmail,
                name: req.body.signUpName,
                password: hash,
                id_concesionario: req.body.signUpDealer
            });

            req.session.user = {
                name: req.body.signUpName,
                email: req.body.signUpEmail,
                rol: "user",
                id_concesionario: req.body.signUpDealer
            };

            res.redirect("/");
        } catch (err) {
            next(err);
        }
    }
);


// LOGIN
router.post(
    "/login",
    validarEmail("signInEmail"),
    validarPassword2("signInPassword"),
    async (req, res) => {
        try {
            const [rows] = await userDb.getUserByEmail(req.body.signInEmail);

            if (!rows.length) {
                req.session.error = "No existe usuario";
                return res.redirect("/");
            }

            const ok = bcrypt.compareSync(
                req.body.signInPassword,
                rows[0].password
            );

            if (!ok) {
                req.session.error = "Contraseña incorrecta";
                return res.redirect("/");
            }

            req.session.user = {
                id: rows[0].id,
                name: rows[0].name,
                email: rows[0].email,
                rol: rows[0].rol,
                id_concesionario: rows[0].id_concesionario
            };

            res.redirect("/");
        } catch (err) {
            res.status(500).send(err.message);
        }
    }
);


// LOGOUT
router.get("/logout", (req, res) => {
    req.session.destroy();
    res.redirect("/");
});


// ============================
// PERFIL
// ============================

router.post(
    "/updateProfile",
    validarEmail("email"),
    async (req, res, next) => {
        try {
            const userId = req.session.user.id;

            await userDb.updateUser(userId, {
                name: req.body.name,
                email: req.body.email,
                rol:req.session.user.rol,
                id_concesionario: req.body.id_concesionario
            });

            req.session.user = {
                ...req.session.user,
                name: req.body.name,
                email: req.body.email,
                id_concesionario: req.body.id_concesionario
            };

            res.redirect(req.get("Referrer") || "/");
        } catch (err) {
            next(err);
        }
    }
);


// ============================
// ACCIONES CRUD ADMIN
// ============================

// CREATE
router.post("/create", async (req, res) => {
    try {
        await userDb.createUser(req.body);

        req.session.responseMessage = "Usuario creado";
        res.redirect("/admin");
    } catch (err) {
        req.session.errorMessage = err.message;
        res.redirect("/admin");
    }
});

// UPDATE
router.post("/:id/update", async (req, res) => {
    try {
        await userDb.updateUser(req.params.id, req.body);
        const [updated] = await userDb.getUserById(req.params.id);
        const u = updated[0];
        // si es el mismo usuario logueado entonces actualizar sesión
        if (req.session.user && req.session.user.id == u.id) {
            req.session.user = {
                ...req.session.user,
                name: u.name,
                email: u.email,
                id_concesionario: u.id_concesionario
            };
        }
        req.session.responseMessage = "Usuario actualizado";
        res.redirect("/admin");
    } catch (err) {
        req.session.errorMessage = err.message;
        res.redirect("/admin");
    }
});

// DELETE
router.post("/:id/delete", async (req, res) => {
    try {
        await userDb.deleteUser(req.params.id);

        req.session.responseMessage = "Usuario eliminado";
        res.redirect("/admin");
    } catch (err) {
        req.session.errorMessage = err.message;
        res.redirect("/admin");
    }
});


module.exports = router;