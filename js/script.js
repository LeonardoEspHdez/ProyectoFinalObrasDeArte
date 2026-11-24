// Obtenemos los elementos del formulario que vamos a utilizar
const formularioBusqueda = document.getElementById("formBusqueda");
const campoBusqueda = document.getElementById("cadenaBusqueda");
const errorBusqueda = document.getElementById("errorBusqueda");
const contenedorResultados = document.getElementById("publicaciones");

// Ocultamos el espacio donde apareceran los resultados al cargar la pagina
const seccionResultados = document.querySelector("#seccion-respuestas");
seccionResultados.style.display = "none";

// Variable donde vamos guardando el contenido de las obras que se mostraran
let contenidoResultados = "";

// Registramos el evento para ejecutar la busqueda cuando se envie el formulario
formularioBusqueda.addEventListener("submit", buscarObras);

// Funcion que realiza la busqueda de obras y espera la respuesta del servidor
async function buscarObras(evento) {

    // Evitamos que el formulario recargue la pagina al enviarse
    evento.preventDefault();

    // Revisamos que el campo de busqueda no este vacio
    if (!campoBusqueda.value.trim()) {
        errorBusqueda.textContent = "Proporciona la cadena de búsqueda";
        campoBusqueda.focus();
        return;
    }

    // Obtenemos la opcion de busqueda que selecciono el usuario
    const radioSeleccionado = formularioBusqueda.querySelector('input[name="criterio"]:checked');

    // Guardamos el parametro de busqueda seleccionado
    const parametroBusqueda = radioSeleccionado.value;

    // Obtenemos el texto que escribio el usuario
    const textoBusqueda = campoBusqueda.value.trim();

    // Creamos una promesa para realizar la peticion al servidor
    let promesaBusqueda = new Promise(function (resolve, reject) {

        // Creamos el objeto XMLHttpRequest para comunicarnos con la API
        let solicitud = new XMLHttpRequest();

        // Construimos la direccion de la API con el parametro y el texto de busqueda
        let urlPeticion = "https://nearness-cyclist-debtor.ngrok-free.dev/pf/obras/index.php?"
            + parametroBusqueda + "=" + encodeURIComponent(textoBusqueda);

        // Abrimos la conexion utilizando el metodo GET
        solicitud.open("GET", urlPeticion);

        // Agregamos el encabezado para evitar el aviso de ngrok
        solicitud.setRequestHeader("ngrok-skip-browser-warning", "true");

        // Funcion que se ejecuta cuando recibimos una respuesta del servidor
        solicitud.onload = function () {

            // Verificamos que la respuesta del servidor sea correcta
            if (solicitud.status >= 200 && solicitud.status < 300) {
                try {
                    // Convertimos la respuesta del servidor a formato JSON
                    resolve(JSON.parse(solicitud.responseText));
                } catch (errorJSON) {
                    // Mostramos un error si la respuesta no tiene un formato JSON valido
                    reject(new Error("La respuesta JSON no es válida"));
                }
            } else {
                // Rechazamos la promesa cuando el servidor devuelve un error
                reject(new Error("Error HTTP " + solicitud.status));
            }
        };

        // Funcion que se ejecuta cuando ocurre un problema de conexion
        solicitud.onerror = function () {
            reject(new Error("Error de red o conexión"));
        };

        // Enviamos la peticion a la API
        solicitud.send();

    });

    // Esperamos la respuesta de la promesa utilizando await
    try {

        // Mostramos el espacio donde apareceran los resultados
        seccionResultados.style.display = "block";

        // Esperamos a recibir los datos del servidor
        const obras = await promesaBusqueda;

        // Limpiamos el contenido de la busqueda anterior
        contenidoResultados = "";

        // Revisamos si la respuesta recibida es un arreglo
        if (Array.isArray(obras)) {

            // Comprobamos si el arreglo no contiene obras
            if (obras.length == 0) {
                contenidoResultados = `<h2>Resultados de la búsqueda</h2>
        <hr>
        <p>No se encontraron resultados</p>`;
            } else {

                // Agregamos el titulo de la seccion de resultados
                contenidoResultados = `<h2>Resultados de la búsqueda</h2>
        <hr>`;

                // Recorremos el arreglo para mostrar cada obra encontrada
                obras.forEach((obra) => {

                    // Construimos la ficha con la imagen y los datos de cada obra
                    contenidoResultados += `<article class="publicacion mb-3">
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
        contenedorResultados.innerHTML = contenidoResultados;

    } catch (errorSolicitud) {

        // Mostramos un mensaje cuando ocurre un error durante la busqueda
        contenidoResultados = `<h2>Resultados de la búsqueda</h2>
        <hr>
        <p class="text-danger">No se pudo realizar la búsqueda. Intenta nuevamente.</p>`;

        // Mostramos el mensaje de error en la pagina
        contenedorResultados.innerHTML = contenidoResultados;
    }
}