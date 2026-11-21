// Obtenemos el formulario, el campo de búsqueda, el elemento para mostrar un error y el elemento respuesta
const formulario = document.getElementById("formBusqueda");
const campoBusqueda = document.getElementById("cadenaBusqueda");
const errorBusqueda = document.getElementById("errorBusqueda");
const respuesta = document.getElementById("publicaciones");

// Ocultamos el row donde se mostrarán los resultados
const respuestas = document.querySelector("#seccion-respuestas");
respuestas.style.display = "none";

// Variable para formatear los datos junto con el HTML y mostrar las obras o mensajes de error
let salida = "";

// Registramos la función buscarProductos mediante addEventListener
formulario.addEventListener("submit", buscarProductos);

async function buscarProductos(evento) {

    // Cancelamos el envío habitual del formulario
    evento.preventDefault();

    // Verificamos que el usuario haya escrito algo
    if (!campoBusqueda.value.trim()) {
        errorBusqueda.textContent = "Proporciona la cadena de búsqueda";
        campoBusqueda.focus();
        return;
    }

    // Obtenemos qué radio fue seleccionado
    const radioSeleccionado = formulario.querySelector('input[name="criterio"]:checked');

    // Leemos el valor del radio
    const criterio = radioSeleccionado.value;

    // Obtenemos el texto escrito en el campo de búsqueda
    const valorBusqueda = campoBusqueda.value.trim();
    // Creamos una promesa que realizará la solicitud al servidor
    let myPromise = new Promise(function (resolve, reject) {

        // Creamos el objeto XMLHttpRequest
        let request = new XMLHttpRequest();

        // Definimos la URL para hacer la solicitud al API
        let peticion = "https://nearness-cyclist-debtor.ngrok-free.dev/pf/obras/index.php?"
            + criterio + "=" + encodeURIComponent(valorBusqueda);

        // Abrimos la conexión con el método GET
        request.open("GET", peticion);

        // Indicamos que enviaremos los datos en formato JSON
        request.setRequestHeader("ngrok-skip-browser-warning", "true");

        // Evento que se ejecuta cuando el servidor responde
        request.onload = function () {

            if (request.status >= 200 && request.status < 300) {
                try {
                    // Convertimos la respuesta a JSON
                    resolve(JSON.parse(request.responseText));
                } catch (e) {
                    reject(new Error("La respuesta JSON no es válida"));
                }
            } else {
                reject(new Error("Error HTTP " + request.status));
            }
        };

        // Evento que se ejecuta si hay un error de red
        request.onerror = function () {
            reject(new Error("Error de red o conexión"));
        };

        // Enviamos la petición
        request.send();

    });

    // Esperamos la resolución de la promesa con await
    try {

        // Hacemos visible el elemento de salida
        respuestas.style.display = "block";

        // Esperamos la respuesta del servidor
        const data = await myPromise;

        // Limpiamos la salida anterior
        salida = "";

        // Verificamos que la respuesta sea un arreglo
        if (Array.isArray(data)) {

            // Verificamos si el arreglo está vacío
            if (data.length == 0) {
                salida = `<h2>Resultados de la búsqueda</h2>
        <hr>
        <p>No se encontraron resultados</p>`;
            } else {

                // Mostramos el encabezado de los resultados
                salida = `<h2>Resultados de la búsqueda</h2>
        <hr>`;

                // Recorremos las obras recibidas de la API
                data.forEach((obra) => {

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
            throw new Error("La respuesta de la API no es válida");
        }

        // Mostramos los resultados en la página
        respuesta.innerHTML = salida;

    } catch (error) {
        // Mostramos un mensaje cuando ocurre un error
        salida = `<h2>Resultados de la búsqueda</h2>
        <hr>
        <p class="text-danger">No se pudo realizar la búsqueda. Intenta nuevamente.</p>`;

        // Mostramos el mensaje en la página
        respuesta.innerHTML = salida;
    }
}