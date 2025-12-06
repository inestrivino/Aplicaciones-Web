const express = require('express');
const router = express.Router();
const userDb = require("../db/userDb.js");
const bcrypt = require("bcrypt");

//validar correo
function validarEmail(campo) {
    return function (request, response, next) {
        const texto1 = !/[._-]{2,}/.test(request.body[campo]);
        if (!texto1) {
            request.session.error = "El email no puede contener caracteres especiales (._-) repetidos.";
            return response.redirect("/");
        }
        const texto2 = /^[A-Za-z0-9@._-]+$/.test(request.body[campo]);
        if (!texto2) {
            request.session.error = "El email solo debe contener simbolos alfanuméricos y ._-";
            return response.redirect("/");
        }
        const texto3 = /^[^@]+@[^@]+$/.test(request.body[campo]);
        if (!texto3) {
            request.session.error = "El email debe serguir el formato usuario@ucm.";
            return response.redirect("/");
        }
        if (request.body[campo].length > 50) {
            request.session.error = "El email no puede tener más de 50 caracteres.";
            return response.redirect("/");
        }
        next();
    };
}
function validarPassword(campo) {
    return function (request, response, next) {
        const texto1 = /['\/]/.test(request.body[campo]);
        if (texto1) {
            request.session.error = "La contraseña no puede contener los caracteres ' o /.";
            return response.redirect("/");
        }
        if (request.body[campo].length < 8) {
            request.session.error = "La contraseña debe tener al menos 8 caracteres.";
            return response.redirect("/");
        }
        if (request.body[campo].length > 50) {
            request.session.error = "La contraseña no puede tener más de 50 caracteres.";
            return response.redirect("/");
        }
        next();
    }
}

function validarNombre(request, response, next) {
    const texto1 = /['\/]/.test(request.body.signUpName);
    if (texto1) {
        request.session.error = "El nombre de usario no puede contener los caracteres ' o /.";
        return response.redirect("/");
    }
    if (request.body.signUpName.length < 1) {
        request.session.error = "El nombre de usuario debe tener al menos 1 caracter.";
        return response.redirect("/");
    }
    if (request.body.signUpName.length > 50) {
        request.session.error = "El nombre de usuario no puede tener más de 50 caracteres.";
        return response.redirect("/");
    }
    next();
}

//MIDLLEWARES
router.use(["/register"], validarEmail("signUpEmail"));
router.use(["/login"], validarEmail("signInEmail"));
router.use(["/register"], validarPassword("signUpPassword"));
router.use(["/login"], validarPassword("signInPassword"));
router.use(["/register"], validarNombre);

router.post("/register", function (request, response, next) {
    if (request.body.signUpPassword !== request.body.signUpConfirmPassword) {
        request.session.error = "Las contraseñas no coinciden.";
        return response.redirect("/");
    }

    //crear hash de la contraseña
    bcrypt.hash(request.body.signUpPassword, 10).then(hash => {
        //guardar en la base de datos
        userDb.createUser({
            email: request.body.signUpEmail,
            name: request.body.signUpName,
            password: hash
        })
        .then(() => {
            request.session.user = request.body.signUpName;
            response.redirect("/");
        })
        .catch(err => {
            next(err);
            return;
        });
    });
});

router.post("/login", function (request, response) {
    if (!users[request.body.signInEmail]) {
        request.session.error = "El correo no está registrado.";
        return response.redirect("/");
    }
    if (request.body.signInPassword !== users[request.body.signInEmail]?.password) {
        request.session.error = "Contraseña incorrecta.";
        return response.redirect("/");
    }
    request.session.user = users[request.body.signInEmail].name;
    response.redirect("/");
});

router.get("/logout", function (request, response) {
    request.session.destroy();
    response.redirect("/");
});

module.exports = router;