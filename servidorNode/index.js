var http = require('http');
var url = require('url');
var mongo = require('mongodb');
var queryString = require('querystring');
var MongoClient = mongo.MongoClient;
var server = http.createServer();
var urlBD = "mongodb://localhost:27017/";

server.on('request', function(peticion, respuesta) 
{
    let urlContent = url.parse(peticion.url, true).pathname;
    let urlValues = url.parse(peticion.url, true).query;

    //Crea la BD 'harry' y rellena la colección 'personajes' con el archivo JSON del servidor.
    if(urlContent=="/importar"){
        var personajesJSON = require('./harry-potter-characters.json');

        MongoClient.connect(urlBD, { useNewUrlParser: true, useUnifiedTopology: true }, function (err, db) {
            if (err) throw err;

            var dbo = db.db("harry");

            //Se elimina la colección para que no se duplique al importar varias veces.
            dbo.collection("personajes").drop(function (err, deleteOK) {
                if (err) throw err;
                if (deleteOK) {
                    console.log("Colección eliminada");
                }
            });

            dbo.collection("personajes").insertMany(personajesJSON, function (err, res) {
                if (err) throw err;
                console.log("Se han insertado " + res.insertedCount + " documentos");
                db.close();
            });
        });
        respuesta.writeHead(200,{'Content-Type':'text/html;charset=utf-8'});
        respuesta.write("<h1>Base de datos creada y rellenada</h1>");
        respuesta.end();
    }
    //Devuelve el JSON completo o con filtros
    else if(urlContent=="/conectar"){

        respuesta.setHeader('Access-Control-Allow-Origin', '*');
        respuesta.setHeader('Access-Control-Allow-Methods', 'GET, POST,OPTIONS, PUT, PATCH, DELETE');
        respuesta.writeHead(200,{'Content-Type':'application/json'});


        MongoClient.connect(urlBD, { useNewUrlParser: true, useUnifiedTopology: true }, function (err, db) {
            if (err) throw err;

            var dbo = db.db("harry");
            let filtro = {};
            let msg = "JSON completo enviado";
            
            if(urlValues.btn=="humanos"){

                filtro = {species : 'human'};
                msg = "JSON humanos enviado";

            } else if(urlValues.btn=="1979"){

                filtro = { yearOfBirth : {$lt : 1979} };
                msg = "JSON anteriores 1979 enviado";

            } else if(urlValues.btn=="varita"){

                filtro = { "wand.wood" : "holly" };
                msg = "JSON varitas enviado";

            } else if(urlValues.btn=="vivos"){

                filtro = { alive : true , hogwartsStudent : true };
                msg = "JSON vivos y estudiando enviado";

            }

            dbo.collection("personajes").find(filtro).toArray(function (err, result) {
                if (err) throw err;
                respuesta.end(JSON.stringify(result));
                console.log(msg);
                db.close();
            });
        });

    } 
    //Borra un personaje de la BD que tenga el nombre indicado.
    else if(urlContent=="/borrar"){
        let nombre;
        peticion.on('data', function(datos){
            nombre = decodeURI(datos);
        }).on('end', function(){
            MongoClient.connect(urlBD, { useNewUrlParser: true, useUnifiedTopology: true }, function (err, db) {
                if (err) throw err;
                var dbo = db.db("harry");

                dbo.collection("personajes").deleteOne({name : nombre}, function (err, result) {
                    if (err) throw err;
                    console.log(nombre + " eliminado");
                    db.close();
                });
            });

            //Devuelve mensaje
            respuesta.setHeader('Access-Control-Allow-Origin', '*');
            respuesta.setHeader('Access-Control-Allow-Methods', 'GET, POST,OPTIONS, PUT, PATCH, DELETE');
            respuesta.writeHead(200,{'Content-Type':'text/html;charset=utf-8'});
            respuesta.write("<div class='alert alert-success' role='alert'>");
            respuesta.write("Se ha borrado a "+ nombre);
            respuesta.write("</div>");
            respuesta.end();
        })
    } 
    //Añade un personaje a la BD con los datos del formulario
    else if(urlContent=="/agregar"){
        let parametros;
        peticion.on('data', function(datos){
            parametros = decodeURI(datos);
        }).on('end', function(){
            parametros = queryString.parse(parametros);
            let url = parametros.url;
            let nombre = parametros.nombre;
            let especie = parametros.especie;
            let genero = parametros.genero;
            let casa = parametros.casa;
            let nacimiento = parametros.nacimiento;

            MongoClient.connect(urlBD, { useNewUrlParser: true, useUnifiedTopology: true }, function (err, db) {
                if (err) throw err;
                var dbo = db.db("harry");
                var nuevoPersonaje = { name: nombre, species: especie, gender: genero, house: casa, yearOfBirth: nacimiento, image: url };
                dbo.collection("personajes").insertOne(nuevoPersonaje, function (err, res) {
                    if (err) throw err;
                    console.log("1 personaje insertado");
                    db.close();
                });
            });

            //Devuelve mensaje
            respuesta.setHeader('Access-Control-Allow-Origin', '*');
            respuesta.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
            respuesta.writeHead(200,{'Content-Type':'text/html;charset=utf-8'});
            respuesta.write("<div class='alert alert-success' role='alert'>");
            respuesta.write("Se ha agregado a "+ nombre);
            respuesta.write("</div>");
            respuesta.end();
        })
    }
});
server.listen(8082, '127.0.0.2');
console.log('Servidor ejecutándose en http://127.0.0.2:8082/');