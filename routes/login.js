var express = require('express');
var bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');

var SEED = require('../config/config').SEED;

var app = express();

// importar Schema de usuarios.
var Usuario = require('../models/usuario');

// Google config
const GOOGLE_CLIENT_ID = require('../config/config').GOOGLE_CLIENT_ID;
const GOOGLE_SECRET = require('../config/config').GOOGLE_SECRET;

const { OAuth2Client } = require('google-auth-library');
const client = new OAuth2Client(GOOGLE_CLIENT_ID, GOOGLE_SECRET, '');


// ================================================
// login google
// ================================================
app.post('/google', (req, res) => {

    const token = req.body.token || 'XXX';

    client.verifyIdToken({ idToken: token, audience: GOOGLE_CLIENT_ID }, (e, login) => {

        if (e) {
            return res.status(400).json({
                ok: true,
                mensaje: 'Token no valido',
                error: e
            });
        }

        var payload = login.getPayload();
        var userid = payload['sub'];


        Usuario.findOne({ email: payload.email }, (err, usuario) => {

            if (err) {
                return res.status(500).json({
                    ok: true,
                    mensaje: 'Error al buscar el usuario.',
                    error: err
                });
            }

            if (usuario) {
                if (usuario.google === false) {

                    return res.status(400).json({
                        ok: true,
                        mensaje: 'Debe de utilizar su autenticación normal.',
                        error: err
                    });

                } else {
                    usuario.password = ':)';

                    // crear token
                    var token = jwt.sign({ usuario: usuario }, SEED, { expiresIn: 14400 });

                    res.status(200).json({
                        ok: true,
                        usuario: usuario,
                        id: usuario._id,
                        token: token
                    });
                }
                // no lo encontramos por el correo.
            } else {
                var usuario = new Usuario();

                usuario.nombre = payload.name;
                usuario.email = payload.email;
                usuario.img = payload.picture;
                usuario.password = ':)';
                usuario.google = true;

                usuario.save((err, usuarioDB) => {

                    if (err) {
                        return res.status(500).json({
                            ok: true,
                            mensaje: 'Error al crear el usuario - google',
                            error: err
                        });
                    }

                    // crear token
                    var token = jwt.sign({ usuario: usuarioDB }, SEED, { expiresIn: 14400 });

                    res.status(200).json({
                        ok: true,
                        usuario: usuarioDB,
                        id: usuarioDB._id,
                        token: token
                    });

                });
            }

        });





    });

});


// ================================================
// login normal
// ================================================
app.post('/', (req, res, next) => {

    var body = req.body;

    Usuario.findOne({ email: body.email }, (err, usuarioDB) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar usuario.',
                errors: err
            });
        }

        if (!usuarioDB) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Credenciales incorrectas - email',
                errors: err
            });
        }

        if (!bcrypt.compareSync(body.password, usuarioDB.password)) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Credenciales incorrectas - password',
                errors: err
            });
        }

        // ocultar la contraseña en la respuesta, no se persiste en bd.
        usuarioDB.password = ':)';

        // crear token
        var token = jwt.sign({ usuario: usuarioDB }, SEED, { expiresIn: 14400 });

        res.status(200).json({
            ok: true,
            usuario: usuarioDB,
            id: usuarioDB._id,
            token: token
        });

    });

});

module.exports = app;