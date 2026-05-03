const express = require("express");
const router = express.Router();
const userDb = require("../db/userDb.js");
const bcrypt = require("bcrypt");

//FUNCIONES DE VALIDACION
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

// AUTENTIFICACION
// REGISTER
router.post(
    "/register",
    validarEmail("signUpEmail"),
    validarPassword("signUpPassword"),
    validarPassword2("signUpPassword"),
    validarNombre,
    async (req, res) => {
        try {

            if (req.body.signUpPassword !== req.body.signUpConfirmPassword) {
                return res.status(400).json({
                    ok: false,
                    error: "Las contraseñas no coinciden"
                });
            }

            const [rows] = await userDb.getUserByEmail(req.body.signUpEmail);
            const emailUser = rows?.[0];

            if (emailUser) {
                return res.status(400).json({
                    ok: false,
                    error: "Ya existe un usuario con ese correo"
                });
            }

            const hash = await bcrypt.hash(req.body.signUpPassword, 10);

            const result = await userDb.createUser({
                email: req.body.signUpEmail,
                name: req.body.signUpName,
                password: hash,
                concesionario: Number(req.body.signUpDealer)
            });

            const [newRows] = await userDb.getUserByEmail(req.body.signUpEmail);
            const newUser = newRows?.[0];

            req.session.user = {
                id: newUser.id,
                name: newUser.name,
                email: newUser.email,
                rol: newUser.rol,
                id_concesionario: newUser.id_concesionario
            };

            return res.json({
                ok: true,
                message: "Usuario registrado y sesión iniciada",
                user: req.session.user
            });

        } catch (err) {
            console.error(err);
            return res.status(500).json({
                ok: false,
                error: err.message
            });
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
                return res.status(400).json({
                    ok: false,
                    error: "No existe el usuario"
                });
            }

            const user = rows[0];

            const ok = await bcrypt.compare(
                req.body.signInPassword,
                user.password
            );

            if (!ok) {
                return res.status(400).json({
                    ok: false,
                    error: "Contraseña incorrecta"
                });
            }

            req.session.user = {
                id: user.id,
                name: user.name,
                email: user.email,
                rol: user.rol,
                id_concesionario: user.id_concesionario
            };

            return res.json({
                ok: true,
                message: "Login correcto",
                user: req.session.user
            });

        } catch (err) {
            console.error(err);
            return res.status(500).json({
                ok: false,
                error: err.message
            });
        }
    }
);

// LOGOUT
router.get("/logout", (req, res) => {
    req.session.destroy();
    res.redirect("/");
});

module.exports = router;