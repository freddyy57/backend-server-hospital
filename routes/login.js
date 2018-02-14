var express = require('express');
var bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');

var SEED = require('../config/config').SEED;

var app = express();
var Usuario = require('../models/usuario');

var GoogleAuth = require('google-auth-library');
var auth = new GoogleAuth;

const GOOGLE_CLIENT_ID = require('../config/config').GOOGLE_CLIENT_ID;
const GOOGLE_SECRET = require('../config/config').GOOGLE_SECRET;


// ====================================================
//  AUTENTICACIÓN GOOGLE
// ====================================================

app.post('/google', (req, res) => {

    var token = req.body.token || 'XXX';

    var client = new auth.OAuth2(GOOGLE_CLIENT_ID, GOOGLE_SECRET, '');

    client.verifyIdToken(
        token,
        GOOGLE_CLIENT_ID, // Specify the CLIENT_ID of the app that accesses the backend
        // Or, if multiple clients access the backend:
        //[CLIENT_ID_1, CLIENT_ID_2, CLIENT_ID_3],
        function(e, login) {

            if (e) {
                res.status(400).json({
                    ok: false,
                    errors: 'Error al autenticarse con google sign in' + e
                });
            }

            var payload = login.getPayload();
            var userid = payload['sub'];
            // If request specified a G Suite domain:
            //var domain = payload['hd'];

            Usuario.findOne({ email: payload.email }, (err, usuario) => {

                if (err) {
                    res.status(500).json({
                        ok: false,
                        errors: 'Error al buscar usuario - login google' + err
                    });
                }

                if (usuario) {
                    if (!usuario.google) {
                        return res.status(400).json({
                            ok: false,
                            errors: 'Usted ya está autenticado, debe usar el login normal'
                        });
                    } else {

                        // Crear un token!!!
                        usuario.password = ':)';
                        // usuario.google = true;
                        var token = jwt.sign({ usuario: usuario }, SEED, { expiresIn: 14400 }); // 4 horas


                        res.status(200).json({
                            ok: true,
                            Usuario: usuario,
                            token: token,
                            id: usuario._id
                        });

                    }
                    // Si el usuario no existe en la BD por el correo
                } else {

                    var usuario = new Usuario();

                    usuario.nombre = payload.name;
                    usuario.email = payload.email;
                    usuario.password = ':)';
                    usuario.img = payload.picture;
                    usuario.google = true;

                    usuario.save((err, usuarioDB) => {

                        if (err) {
                            res.status(500).json({
                                ok: false,
                                errors: 'Error al crear usuario - login google' + err
                            });
                        }

                        var token = jwt.sign({ usuario: usuarioDB }, SEED, { expiresIn: 14400 }); // 4 horas


                        res.status(200).json({
                            ok: true,
                            Usuario: usuarioDB,
                            token: token,
                            id: usuarioDB._id
                        });


                    });

                }

            });

        });
});


// ====================================================
//  AUTENTICACIÓN NORMAL
// ====================================================

app.post('/', (req, res) => {

    var body = req.body;

    Usuario.findOne({ email: body.email }, (err, usuarioDB) => {


        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar usuario con ese email',
                errors: err
            });
        }

        if (!usuarioDB) {
            return res.status(400).json({
                ok: false,
                mensaje: 'No existe un usuario con esas credenciales - correo',
                errors: { message: 'No existe un usuario con esas credenciales - correo' }
            });
        }

        if (!bcrypt.compareSync(body.password, usuarioDB.password)) {
            return res.status(400).json({
                ok: false,
                mensaje: 'No existe un usuario con esas credenciales - password',
                errors: { message: 'No existe un usuario con esas credenciales - password' }
            });
        }

        // Crear un token!!!
        usuarioDB.password = ':)';
        var token = jwt.sign({ usuario: usuarioDB }, SEED, { expiresIn: 14400 }); // 4 horas


        res.status(200).json({
            ok: true,
            Usuario: usuarioDB,
            token: token,
            id: usuarioDB._id
        });

    });

});



module.exports = app;