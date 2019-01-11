var express = require('express');
var bcrypt = require('bcryptjs');
var Usuario = require('../models/usuario');
var jwt = require('jsonwebtoken');

var mdAutentificacion = require('../middlewares/autenticacion');

var app = express();
//Rutas
app.get('/', (req, res, next) => {
    // request, response, next
    // ===================================================
    // obtener todos los usuarios
    // ===================================================
    Usuario.find({}, 'nombre email img role')
        .exec(
            (err, usuarios) => {
                if (err) {
                    return res.status(500).json({
                        ok: false,
                        mensaje: 'Error cargando Usuarios',
                        errors: err
                    });
                }

                res.status(200).json({
                    ok: true,
                    usuarios: usuarios,
                    usuariotoken: req.usuario
                });

            });

});







// =================================================================
// Actualizar usuario
// =================================================================

app.put('/:id', (req, res) => {
    var id = req.params.id;
    var body = req.body;


    Usuario.findById(id, (err, usuario) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar usuario',
                errors: err
            });
        }

        if (!usuario) {
            return res.status(400).json({
                ok: false,
                mensaje: 'El usuario con el id: ' + id + ' no existe',
                errors: { message: 'No exite un usuario con ese id' }
            });
        }

        usuario.nombre = body.nombre;
        usuario.email = body.email;
        usuario.role = body.role;

        usuario.save((err, usuarioGuardado) => {

            if (err) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Error al actualizar usuario',
                    errors: err
                });
            }

            usuarioGuardado.password = ':)';
            return res.status(200).json({
                ok: true,
                usuario: usuarioGuardado
            });

        });
    });
});


// =================================================================
// Crear un nuevo usuario
// =================================================================

app.post('/', mdAutentificacion.verificaToken, (req, res) => {
    var body = req.body;

    var usuario = new Usuario({
        nombre: body.nombre,
        email: body.email,
        password: bcrypt.hashSync(body.password, 10),
        img: body.img,
        role: body.role
    });

    usuario.save((err, usuarioGuardado) => {
        if (err) {
            res.status(400).json({
                ok: false,
                mensaje: 'Error al crear usuario',
                errors: err
            });
        } else {
            res.status(201).json({
                ok: true,
                usuario: usuarioGuardado
            });
        }
    });


});

// =================================================================
//   Borrar un Usuario
// =================================================================

app.delete('/:id', (req, res) => {
    var id = req.params.id;

    Usuario.findByIdAndRemove(id, (err, usuarioBorrado) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al borrar Usuario',
                errors: err
            });
        }

        if (!usuarioBorrado) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Usuario No Encontrado',
                errors: { menssage: 'Usuario No Encontrado' }
            });
        }

        res.status(200).json({
            ok: true,
            usuarios: usuarioBorrado
        });
    });
});


module.exports = app;