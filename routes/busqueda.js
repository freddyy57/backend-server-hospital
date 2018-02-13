var express = require('express');

var app = express();

var Hospital = require('../models/hospital');
var Medico = require('../models/medico');
var Usuario = require('../models/usuario');


// ================================
// Busqueda Especifica (Tabla)
// ================================

app.get('/coleccion/:tabla/:busqueda', (req, res, next) => {

    var busqueda = req.params.busqueda;
    var regex = new RegExp(busqueda, 'i');
    var tabla = req.params.tabla;
    // var regex2 = new RegExp(tabla, 'i');
    var promesa;

    switch (tabla) {
        case 'usuario':
            promesa = buscarUsuario(busqueda, regex);
            break;

        case 'usuarios':
            promesa = buscarUsuario(busqueda, regex);
            break;

        case 'Usuario':
            promesa = buscarUsuario(busqueda, regex);
            break;

        case 'Usuarios':
            promesa = buscarUsuario(busqueda, regex);
            break;

        case 'Medico':
            promesa = buscarMedicos(busqueda, regex);
            break;

        case 'Medicos':
            promesa = buscarMedicos(busqueda, regex);
            break;

        case 'medico':
            promesa = buscarMedicos(busqueda, regex);
            break;

        case 'medicos':
            promesa = buscarMedicos(busqueda, regex);
            break;

        case 'Hospital':
            promesa = buscarHospitales(busqueda, regex);
            break;

        case 'Hospitales':
            promesa = buscarHospitales(busqueda, regex);
            break;

        case 'hospital':
            promesa = buscarHospitales(busqueda, regex);
            break;

        case 'hospitales':
            promesa = buscarHospitales(busqueda, regex);
            break;

        default:
            return res.status(400).json({
                ok: false,
                mensaje: 'No hay tabla con ese nombre, solo son válidos: Medico, Hospital o Usuario',
                error: { message: 'No hay tabla con ese nombre' }
            });
    }

    promesa.then(data => {

        res.status(200).json({
            ok: true,
            [tabla]: data
        });

    });





    // if ((tabla === 'Medico') || (tabla === 'medico')) {

    //     buscarMedicos(busqueda, regex)
    //         .then(medicos => {

    //             res.status(200).json({
    //                 ok: true,
    //                 medicos: medicos
    //             });

    //         });

    // } else if ((tabla === 'Usuario') || (tabla === 'usuario')) {

    //     buscarUsuario(busqueda, regex)
    //         .then(usuarios => {

    //             res.status(200).json({
    //                 ok: true,
    //                 usuarios: usuarios
    //             });

    //         });

    // } else if ((tabla == 'Hospital') || (tabla === 'hospital')) {

    //     buscarHospitales(busqueda, regex)
    //         .then(hospitales => {

    //             res.status(200).json({
    //                 ok: true,
    //                 hospitales: hospitales
    //             });

    //         });
    // } else {
    //     res.status(401).json({
    //         ok: false,
    //         mensaje: 'No hay tabla con ese nombre, solo son válidos: Medicos, Hospitales o Usuarios',
    //         error: { message: 'No hay tabla con ese nombre' }
    //     });
    // }

});


// ================================
// Busqueda General (Todo)
// ================================

app.get('/todo/:busqueda', (req, res, next) => {

    var busqueda = req.params.busqueda;
    var regex = new RegExp(busqueda, 'i');

    Promise.all([buscarHospitales(busqueda, regex),
            buscarMedicos(busqueda, regex),
            buscarUsuario(busqueda, regex),
        ])
        .then(respuestas => {

            res.status(200).json({
                ok: true,
                hospitales: respuestas[0],
                medicos: respuestas[1],
                usuarios: respuestas[2]
            });

        });

});


function buscarHospitales(busqueda, regex) {

    return new Promise((resolve, reject) => {

        Hospital.find({ nombre: regex })
            .populate('usuario', 'nombre email')
            .exec((err, hospitales) => {

                if (err) {
                    reject('Error al cargar hospitales', err);
                } else {
                    resolve(hospitales);
                }
            });

    });

}

function buscarMedicos(busqueda, regex) {

    return new Promise((resolve, reject) => {

        Medico.find({ nombre: regex })
            .populate('usuario', 'nombre email')
            .populate('hospital')
            .exec((err, medicos) => {

                if (err) {
                    reject('Error al cargar medicos', err);
                } else {
                    resolve(medicos);
                }
            });

    });

}


function buscarUsuario(busqueda, regex) {

    return new Promise((resolve, reject) => {

        Usuario.find({}, 'nombre email role')
            .or([{ 'nombre': regex }, { 'email': regex }])
            .exec((err, usuarios) => {

                if (err) {
                    reject('Error al cargar usuario', err);
                } else {
                    resolve(usuarios);
                }
            });

    });

}

module.exports = app;