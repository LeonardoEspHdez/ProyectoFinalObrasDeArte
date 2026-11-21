// Obtenemos los elementos del formulario que vamos a utilizar
const formulario = document.getElementById("formBusqueda");
const campoBusqueda = document.getElementById("cadenaBusqueda");
const errorBusqueda = document.getElementById("errorBusqueda");
const respuesta = document.getElementById("publicaciones");

// Ocultamos el espacio donde apareceran los resultados al cargar la pagina
const respuestas = document.querySelector("#seccion-respuestas");
respuestas.style.display = "none";

// Variable donde vamos guardando el contenido que se mostrara en la pagina
let salida = "";

// Registramos el evento para ejecutar la busqueda cuando se envie el formulario
formulario.addEventListener("submit", buscarProductos);

// Funcion que realiza la busqueda y espera la respuesta del servidor
async function buscarProductos(evento) {

    // Evitamos que el formulario recargue la pagina al enviarse
    evento.preventDefault();

    // Revisamos que el campo de busqueda no este vacio
    if (!campoBusqueda.value.trim()) {
        errorBusqueda.textContent = "Proporciona la cadena de búsqueda";
        campoBusqueda.focus();
        return;
    }

    // Obtenemos la opcion de busqueda que selecciono el usuario
    const radioSeleccionado = formulario.querySelector('input[name="criterio"]:checked');

    // Guardamos el valor del criterio seleccionado
    const criterio = radioSeleccionado.value;

    // Obtenemos el texto que escribio el usuario
    const valorBusqueda = campoBusqueda.value.trim();

    // Creamos una promesa para realizar la peticion al servidor
    let myPromise = new Promise(function (resolve, reject) {

        // Creamos el objeto XMLHttpRequest para comunicarnos con la API
        let request = new XMLHttpRequest();

        // Construimos la direccion de la API con el parametro y el texto de busqueda
        let peticion = "https://nearness-cyclist-debtor.ngrok-free.dev/pf/obras/index.php?"
            + criterio + "=" + encodeURIComponent(valorBusqueda);

        // Abrimos la conexion utilizando el metodo GET
        request.open("GET", peticion);

        // Agregamos el encabezado para evitar el aviso de ngrok
        request.setRequestHeader("ngrok-skip-browser-warning", "true");

        // Funcion que se ejecuta cuando recibimos una respuesta del servidor
        request.onload = function () {

            // Verificamos que la respuesta del servidor sea correcta
            if (request.status >= 200 && request.status < 300) {
                try {
                    // Convertimos la respuesta del servidor a formato JSON
                    resolve(JSON.parse(request.responseText));
                } catch (e) {
                    // Mostramos un error si la respuesta no tiene un formato JSON valido
                    reject(new Error("La respuesta JSON no es válida"));
                }
            } else {
                // Rechazamos la promesa cuando el servidor devuelve un error
                reject(new Error("Error HTTP " + request.status));
            }
        };

        // Funcion que se ejecuta cuando ocurre un problema de conexion
        request.onerror = function () {
            reject(new Error("Error de red o conexión"));
        };

        // Enviamos la peticion a la API
        request.send();

    });

    // Esperamos la respuesta de la promesa utilizando await
    try {

        // Mostramos el espacio donde apareceran los resultados
        respuestas.style.display = "block";

        // Esperamos a recibir los datos del servidor
        const data = await myPromise;

        // Limpiamos el contenido de la busqueda anterior
        salida = "";

        // Revisamos si la respuesta recibida es un arreglo
        if (Array.isArray(data)) {

            // Comprobamos si el arreglo no contiene obras
            if (data.length == 0) {
                salida = `<h2>Resultados de la búsqueda</h2>
        <hr>
        <p>No se encontraron resultados</p>`;
            } else {

                // Agregamos el titulo de la seccion de resultados
                salida = `<h2>Resultados de la búsqueda</h2>
        <hr>`;

                // Recorremos el arreglo para mostrar cada obra encontrada
                data.forEach((obra) => {

                    // Construimos la ficha con la imagen y los datos de cada obra
                    salida += `<article class="publicacion mb-3">
                <div class="row">
                    <div class="col-md-6">
                        <img src="https://nearness-cyclist-debtor.ngrok-free.dev/pf/obras${obra.imagen}"
                        class="img-fluid" alt="${obra.titulo}">
                    </div>

                    <div class="col-md-6">
                        <h3>${obra.titulo}</h3>

                        <p>${obra.descripcion || "Sin descripción"}</p>

                        <p><strong>Artista:</strong> ${obra.artista || "Desconocido"}</p>

                        <p><strong>Año:</strong> ${obra.anio ?? "----"}</p>

                        <p><strong>Tipo:</strong> ${obra.tipo || "----"}</p>

                        <p><strong>Movimiento:</strong> ${obra.movimiento || "----"}</p>
                    </div>
                </div>
            </article>`;
                });
            }

        } else {
            // Generamos un error cuando la respuesta no tiene el formato esperado
            throw new Error("La respuesta de la API no es válida");
        }

        // Colocamos las obras encontradas dentro del contenedor HTML
        respuesta.innerHTML = salida;

    } catch (error) {

        // Mostramos un mensaje cuando ocurre un error durante la busqueda
        salida = `<h2>Resultados de la búsqueda</h2>
        <hr>
        <p class="text-danger">No se pudo realizar la búsqueda. Intenta nuevamente.</p>`;

        // Mostramos el mensaje de error en la pagina
        respuesta.innerHTML = salida;
    }
}