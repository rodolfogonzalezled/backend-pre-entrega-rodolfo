let contenedorProductosCarrito = document.getElementById('productosCarrito');

let btnBorrarCarrito = document.getElementById(`btnBorrarCarrito`);
btnBorrarCarrito.addEventListener('click', () => {
    borrarCarrito(window.localStorage.getItem('idCarrito'))
});

function agregarAlCarrito(id) {
    let idCarrito = window.localStorage.getItem('idCarrito');
    obtenerProductoPorId(id)
        .then(producto => {
            if (producto) {
                if (idCarrito) {
                    fetch(`/api/carrito/${idCarrito}/productos`, {
                        method: 'POST',
                        body: JSON.stringify(producto),
                        headers: {
                            'Content-Type': 'application/json'
                        }
                    })
                        .catch(error => console.error('Error:', error));
                } else {
                    fetch(`/api/carrito`, {
                        method: 'POST',
                        body: JSON.stringify({producto}),
                        headers: {
                            'Content-Type': 'application/json'
                        }
                    })
                        .then(result => result.json())
                        .then(id => window.localStorage.setItem('idCarrito', id))
                        .catch(error => console.error('Error:', error));
                }
            }
        })
        .catch(error => console.error('Error:', error));
}

function obtenerProductos() {
    let idCarrito = window.localStorage.getItem('idCarrito');
    fetch(`/api/carrito/${idCarrito}/productos`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    })
        .then(result => result.json())
        .then(productos => {
            pintarCarrito(productos);
        })
        .catch(error => console.error('Error:', error));
}

obtenerProductos();


function borrarProductoCarrito(idProducto) {
    let idCarrito = window.localStorage.getItem('idCarrito');
    fetch(`/api/carrito/${idCarrito}/productos/${idProducto}`, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json'
        }
    })
        .then(() => socket.emit("buscarCarrito", idCarrito))
        .catch(error => console.error('Error:', error));
}

function borrarCarrito() {
    let idCarrito = window.localStorage.getItem('idCarrito');
    fetch(`/api/carrito/${idCarrito}`, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json'
        }
    })
        .then(() => {
            socket.emit("buscarCarrito", idCarrito);
            window.localStorage.removeItem('idCarrito');
        })
        .catch(error => console.error('Error:', error));
}

// if (productos.length > 0) {
//     document.getElementById('sinProductos').style.display = 'none';
// } else {
//     document.getElementById('sinProductos').style.display = 'block';
// }

socket.on("carritos", (productos) => {
    pintarCarrito(productos);

});

function pintarCarrito(productos) {
    contenedorProductosCarrito.innerHTML = '';
    productos.map((producto) => {
        
        let divContenedor = document.createElement("li");
        divContenedor.classList.add("list-group-item");
        divContenedor.innerHTML = `
            <div class="row" style="text-align: center">
                <div class="col">
                    <img style="border-radius: 8%; width: 45%; border: solid 1px" src="${producto.foto}">
                </div>
                <div class="col text-left">
                    <div class="col"><b>Nombre:</b> ${producto.nombre}</div>
                    <div class="col"><b>Precio:</b> ${producto.precio}</div>
                    <div class="col"><b>Fecha:</b> ${producto.timestamp}</div>
                </div>
                <div class="col text-left">
                    <div class="col py-4"><b>Cantidad:</b> ${producto.cantidad}</div>
                </div>
                <div class="col text-center">
                    <a><i id="btnBorrarPorId${producto.id}" class="bi bi-trash btn btn-danger"></i></a>
                </div>
            </div>
            `;
        contenedorProductosCarrito.appendChild(divContenedor);

        let btnBorrarPorId = document.getElementById(`btnBorrarPorId${producto.id}`);
        btnBorrarPorId.addEventListener('click', () => {
            borrarProductoCarrito(producto.id)
        });
    })
}