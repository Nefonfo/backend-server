// Requires
// si se queda pegado killall node
var express = require('express');
var mongoose = require('mongoose');


//Inicializar variables

var app = express();


//Conexión a la base de datos

mongoose.connection.openUri('mongodb://localhost:27017/hospitalDB', (err, res) => {
    if (err) throw err;
    console.log('Base de datos: 27017 => \x1b[32m%s\x1b[0m', 'online');
});


//Rutas
app.get('/', (req, res, next) => {
    // request, response, next
    res.status(200).json({
        ok: true,
        mensaje: 'Peticion Se Realizo Correctamente'
    });

});

// Escuchar peticiones

app.listen(3000, () => {
    console.log('Express server corriendo en puerto: 3000 => \x1b[32m%s\x1b[0m', 'online');
});