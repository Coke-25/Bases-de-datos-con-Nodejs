let tbody = document.getElementById('tbody');
var httpRequest = new XMLHttpRequest();

mostrarTodo();


function mostrarTodo(){

    var url = "http://127.0.0.2:8082/conectar";

    httpRequest.onload = procesarRespuesta;
    httpRequest.open('GET', url, true)
    httpRequest.overrideMimeType('text/plain');
    httpRequest.send(null);
}


//Botones
let btnTodos = document.getElementById('btnTodos');
let btnHumanos = document.getElementById('btnHumanos');
let btn1979 = document.getElementById('btn1979');
let btnVaritas = document.getElementById('btnVaritas');
let btnVivos = document.getElementById('btnVivos');
let btnAgregar = document.getElementById('btnAgregar');

btnTodos.addEventListener('click', mostrarTodo);

btnHumanos.addEventListener('click', function(){
    var url = "http://127.0.0.2:8082/conectar?btn=humanos";

    httpRequest.onload = procesarRespuesta;
    httpRequest.open('GET', url, true)
    httpRequest.overrideMimeType('text/plain');
    httpRequest.send(null);
});

btn1979.addEventListener('click', function(){
    var url = "http://127.0.0.2:8082/conectar?btn=1979";

    httpRequest.onload = procesarRespuesta;
    httpRequest.open('GET', url, true)
    httpRequest.overrideMimeType('text/plain');
    httpRequest.send(null);
});

btnVaritas.addEventListener('click', function(){
    var url = "http://127.0.0.2:8082/conectar?btn=varita";

    httpRequest.onload = procesarRespuesta;
    httpRequest.open('GET', url, true)
    httpRequest.overrideMimeType('text/plain');
    httpRequest.send(null);
});

btnVivos.addEventListener('click', function(){
    var url = "http://127.0.0.2:8082/conectar?btn=vivos";

    httpRequest.onload = procesarRespuesta;
    httpRequest.open('GET', url, true)
    httpRequest.overrideMimeType('text/plain');
    httpRequest.send(null);
});

btnAgregar.addEventListener('click', function(){
    let url = document.getElementById('url');
    let nombre = document.getElementById('nombre');
    let especie = document.getElementById('especie');
    let genero = document.getElementById('genero');
    let casa = document.getElementById('casa');
    let nacimiento = document.getElementById('nacimiento');

    if(nombre.value!=""&&especie.value!=""&&genero.value!=""&&casa.value!=""&&nacimiento.value!=""){
        let datos = "url=" + encodeURI(url.value) + "&nombre=" + encodeURI(nombre.value) + "&especie=" + encodeURI(especie.value) + "&genero=" + 
        encodeURI(genero.value) + "&casa=" + encodeURI(casa.value) + "&nacimiento=" + encodeURI(nacimiento.value);

        httpRequest.open('POST', "http://127.0.0.2:8082/agregar", true)
        httpRequest.overrideMimeType('text/plain');
        httpRequest.send(datos);
        httpRequest.onload = function(){
            let divMSG = document.getElementById('divMSG');
            divMSG.innerHTML = httpRequest.responseText;
            mostrarTodo();
            window.scrollTo(0, 0);
        }
    } else {
        let divMSG = document.getElementById('divMSG');
        let alert = "<div class='alert alert-warning' role='alert'>Debes rellenar los campos obligatorios (Todos menos la imagen).</div>"
        divMSG.innerHTML = alert;
        window.scrollTo(0, 0);
    }
});

//Borra el personaje seleccionado de la BD
function borrar(id){
    let elementoNombre = document.getElementById("n"+id);
    let nombre = elementoNombre.textContent;

    httpRequest.open("POST", "http://127.0.0.2:8082/borrar", true);
    httpRequest.overrideMimeType('text/plain');
    httpRequest.send(nombre);
    httpRequest.onload = function(){
        let divMSG = document.getElementById('divMSG');
        divMSG.innerHTML = httpRequest.responseText;
        mostrarTodo();
        window.scrollTo(0, 0);
    }
}


//Con el JSON recibido construye el resto de la tabla
function procesarRespuesta() {

    tbody.innerHTML = "";
    let objJSON = JSON.parse(httpRequest.responseText);
    

    for(let i=0;i<objJSON.length;i++){
        //Crear elementos
        let tr = document.createElement('tr');

        let tdImagen = document.createElement('td');
        let tdNombre = document.createElement('td');
        let tdEspecie = document.createElement('td');
        let tdGenero = document.createElement('td');
        let tdCasa = document.createElement('td');
        let tdNacimiento = document.createElement('td');
        let tdBorrar = document.createElement('td');

        let img = document.createElement('img');
        let btn = document.createElement('button');

        //Crear la imagen y meterla en su td
        img.setAttribute("src", objJSON[i].image);
        tdImagen.append(img);
        //Introducir el nombre
        tdNombre.innerHTML = objJSON[i].name;
        tdNombre.setAttribute("id","n"+i);
        //Introducir especie
        tdEspecie.innerHTML = objJSON[i].species;
        //Introducir genero
        tdGenero.innerHTML = objJSON[i].gender;
        //Introducir casa
        tdCasa.innerHTML = objJSON[i].house;
        //Introducir año nacimiento
        if(objJSON[i].yearOfBirth==""){
            tdNacimiento.innerHTML = "Desconocido";
        } else {
            tdNacimiento.innerHTML = objJSON[i].yearOfBirth;
        }
        //Introducir botón de borrar
        btn.innerHTML = "Borrar";
        btn.setAttribute("onclick", "borrar("+i+")");
        btn.setAttribute("class", "btn btn-danger");
        tdBorrar.append(btn);
        
        tr.append(tdImagen, tdNombre, tdEspecie, tdGenero, tdCasa, tdNacimiento, tdBorrar);
        tbody.append(tr);
    }
}