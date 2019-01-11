var express = require('express');


var app = express();
//Rutas
app.get('/', (req, res, next) => {
    // request, response, next
    res.status(200).json({
        ok: true,
        mensaje: 'Peticion Se Realizo Correctamente'
    });

});

module.exports = app;