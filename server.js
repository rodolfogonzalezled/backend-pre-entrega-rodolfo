import express from 'express';
import CartContainer from './cartContainer.js';
import ProductContainer from './productContainer.js';
import { createServer } from "http";
import { Server } from "socket.io";


const app = express()
const router = express.Router()

const httpServer = createServer(app);
const io = new Server(httpServer);

app.use('/api', router);

router.use(express.json());
router.use(express.urlencoded({ extended: true }));

app.use(express.static('public'))         // con http://localhost:8080/
// app.use('/static', express.static('public')) // con http://localhost:8080/static/

app.set("views", "./public/views");
app.set("view engine", "ejs");
// -----------------------------------------------------------------------------------

const products = new ProductContainer("productos");

io.on("connection", async (socket) => {
    console.log(`Nuevo cliente conectado ${socket.id}`);

    socket.emit("productos", await products.getAll());

    socket.on('buscarProducto', async () => {
        socket.emit("productos", await products.getAll());
    });
});

// --- Conexxion del Servidor ------------------------------------------------------
const PORT = 8080;
const connectedServer = httpServer.listen(PORT, () => {
    console.log(`Servidor http escuchando en el puerto ${connectedServer.address().port}`)
});
connectedServer.on("error", error => console.log(`Error en servidor ${error}`));

app.get("/", (req, res) => {
    res.render("pages/index");
});

// -----Api de Productos -----------------------------------------------------------

router.get('/productos/:id?', async (req, res) => {
    let id = req.params.id;
    if (id) {
        res.json(await products.getById(id));
    } else {
        res.json(await products.getAll());
    }
})

router.post('/productos', async (req, res) => {
    let product = await products.add(req.body);
    res.json(product);
})

router.put('/productos/:id', async (req, res) => {
    res.json(await products.put(req.params.id, req.body));
})

router.delete('/productos/:id', async (req, res) => {
    let result = await products.deleteById(req.params.id);
    if (result) {
        res.json(result);
    } else {
        res.sendStatus(200);
    }
})

//------ Api de carritos -----------------------------------------------------------
const carts = new CartContainer("carritos");

router.post('/carrito', async (req, res) => {
    let cart = await carts.add(req.body);
    res.json(cart);
})

router.delete('/carrito/:id', async (req, res) => {
    let result = await carts.deleteById(req.params.id);
    if (result) {
        res.json(result);
    } else {
        res.sendStatus(200);
    }
})

router.get('/carrito/:id/productos', async (req, res) => {
    let id = req.params.id;
    res.json(await carts.getCartProducts(id));
})

router.post('/carrito/:id/productos', async (req, res) => {
    let cart = await carts.addProduct(req.params.id, req.body);
    res.json(cart);
})

router.delete('/carrito/:id/productos/:id_prod', async (req, res) => {
    let result = await carts.deleteProductById(req.params.id, req.params.id_prod);
    if (result) {
        res.json(result);
    } else {
        res.sendStatus(200);
    }
});