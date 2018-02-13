var express = require('express');

var fileUpload = require('express-fileupload');
var fs = require('fs');

var app = express();

var Hospital = require('../models/hospital');
var Medico = require('../models/medico');
var Usuario = require('../models/usuario');

// default options
app.use(fileUpload());


app.put('/:tipo/:id', (req, res, next) => {

    var tipo = req.params.tipo;
    var id = req.params.id;

    // tipos de colección Válidos
    var tiposValidos = ['hospitales', 'medicos', 'usuarios'];
    if (tiposValidos.indexOf(tipo) < 0) {

        return res.status(400).json({
            ok: false,
            mensaje: 'Tipo de colección no válido',
            errors: { message: 'Tipo de colección no válido, sólo son válidos ' + tiposValidos.join(', ') + ' El tipo ' + tipo + ' no es válido' }
        });

    }

    if (!req.files) {

        return res.status(400).json({
            ok: false,
            mensaje: 'No ha seleccionado un archivo',
            errors: { message: 'Debe de seleccionar una imagen' }
        });

    }

    // Obener nombre del archivo

    var archivo = req.files.imagen;
    var nombreCortado = archivo.name.split('.');
    var extensionArchivo = nombreCortado[nombreCortado.length - 1];

    // Solo estas extensiones aceptamos
    var extensionesValidas = ['png', 'jpg', 'gif', 'jpeg'];

    if (extensionesValidas.indexOf(extensionArchivo) < 0) {

        return res.status(400).json({
            ok: false,
            mensaje: 'extensión de archivo inválido',
            errors: { message: 'extensión de archivo inválido Sólo aceptamos: ' + extensionesValidas.join(', ') + ' Este es un archivo ' + extensionArchivo }
        });

    }

    // Nombre de archivo personalizado
    // 1312312312-123.png
    var nombreArchivo = `${ id }-${ new Date().getMilliseconds() }.${ extensionArchivo }`;

    // Mover el archivo del temporal a un path
    var path = `./uploads/${ tipo }/${ nombreArchivo }`;

    // =========================================
    // ANTESION ESTABA AQUI FUNCION PARA MOVER ARCHIVO DE CARPETA
    // AQUÍ LO DEJO POR SI ACASO, PERO LO MOVÍ A LA FUNCIÓN
    // =========================================

    // archivo.mv(path, err => {

    //     if (err) {
    //         return res.status(500).json({
    //             ok: false,
    //             mensaje: 'Error al mover archivo',
    //             errors: err
    //         });
    //     }

    //     subirporTipo(tipo, id, nombreArchivo, path, archivo, res);

    // res.status(200).json({
    //     ok: true,
    //     mensaje: 'Archivo movido correctamente - Upload',
    //     nombreCortado: nombreCortado,
    //     extensionArchivo: extensionArchivo
    // });

    // });

    subirporTipo(tipo, id, nombreArchivo, path, archivo, extensionArchivo, res);

});




function subirporTipo(tipo, id, nombreArchivo, path, archivo, extensionArchivo, res) {

    if (tipo === 'usuarios') {

        Usuario.findById(id, (err, usuario) => {

            if (!usuario) {

                return res.status(401).json({
                    ok: false,
                    mensaje: 'No existe ningún usuario con ese ID',
                    errors: { message: 'No existe ningún usuario con ese ID' + err }
                });
            }

            if (err) {
                return res.status(500).json({
                    ok: false,
                    mensaje: 'Error al subir archivo en carpeta Usario',
                    errors: err
                });
            }


            var pathViejo = './uploads/usuarios/' + usuario.img;

            // Si existe, elimina la imagen anterior
            if (fs.existsSync(pathViejo)) {
                fs.unlink(pathViejo);
            }

            usuario.img = nombreArchivo;

            // =================
            // MOVER EL ARCHIVO
            // =================

            archivo.mv(path, err => {

                if (err) {
                    return res.status(500).json({
                        ok: false,
                        mensaje: 'Error al mover archivo',
                        errors: err
                    });
                }


                usuario.save((err, usuarioActualizado) => {

                    if (err) {
                        return res.status(400).json({
                            ok: false,
                            mensaje: 'Error al actualizar imagen de usuario',
                            errors: err
                        });
                    }

                    usuarioActualizado.password = ':)';

                    return res.status(201).json({
                        ok: true,
                        mensaje: 'Imagen de usuario actualizada ',
                        usuario: usuarioActualizado,
                        extensionArchivo: extensionArchivo
                    });

                });

            }); // cierre mv
        });
    }

    if (tipo === 'medicos') {

        Medico.findById(id, (err, medico) => {

            if (!medico) {

                return res.status(401).json({
                    ok: false,
                    mensaje: 'No existe ningún medico con ese ID',
                    errors: { message: 'No existe ningún medico con ese ID' + err }
                });
            }

            if (err) {
                return res.status(500).json({
                    ok: false,
                    mensaje: 'Error al subir archivo en carpeta del Medico',
                    errors: err
                });
            }

            var pathViejo = './uploads/medicos/' + medico.img;

            // Si existe, elimina la imagen anterior
            if (fs.existsSync(pathViejo)) {
                fs.unlink(pathViejo);
            }

            medico.img = nombreArchivo;

            // =================
            // MOVER EL ARCHIVO
            // =================

            archivo.mv(path, err => {

                if (err) {
                    return res.status(500).json({
                        ok: false,
                        mensaje: 'Error al mover archivo',
                        errors: err
                    });
                }

                medico.save((err, medicoActualizado) => {

                    if (err) {
                        return res.status(400).json({
                            ok: false,
                            mensaje: 'Error al actualizar imagen de medico',
                            errors: err
                        });
                    }

                    medicoActualizado.password = ':)';

                    return res.status(201).json({
                        ok: true,
                        mensaje: 'Imagen de Medico actualizada ',
                        medico: medicoActualizado
                    });

                });

            });

        });

    }

    if (tipo === 'hospitales') {

        Hospital.findById(id, (err, hospital) => {

            if (!hospital) {

                return res.status(401).json({
                    ok: false,
                    mensaje: 'No existe ningún hospital con ese ID',
                    errors: { message: 'No existe ningún hospital con ese ID' + err }
                });
            }

            if (err) {
                return res.status(500).json({
                    ok: false,
                    mensaje: 'Error al subir archivo en carpeta del Hospital',
                    errors: err
                });
            }

            var pathViejo = './uploads/hospitales/' + hospital.img;

            // Si existe, elimina la imagen anterior
            if (fs.existsSync(pathViejo)) {
                fs.unlink(pathViejo);
            }

            hospital.img = nombreArchivo;

            // =================
            // MOVER EL ARCHIVO
            // =================

            archivo.mv(path, err => {

                if (err) {
                    return res.status(500).json({
                        ok: false,
                        mensaje: 'Error al mover archivo',
                        errors: err
                    });
                }

                hospital.save((err, hospitalActualizado) => {

                    if (err) {
                        return res.status(400).json({
                            ok: false,
                            mensaje: 'Error al actualizar imagen de hospital',
                            errors: err
                        });
                    }

                    hospitalActualizado.password = ':)';

                    return res.status(201).json({
                        ok: true,
                        mensaje: 'Imagen de Hospital Actualizada ',
                        hospital: hospitalActualizado
                    });

                });

            });

        });

    }

}


module.exports = app;