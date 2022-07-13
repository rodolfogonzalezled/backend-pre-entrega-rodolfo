import express from 'express';
import CartContainer from './cartContainer.js';
import ProductContainer from './productContainer.js';
import { createServer } from "http";
import { Server } from "socket.io";
import { isAdmin } from './public/middlewares/isAdmin.js';

const app = express()
const router = express.Router()

const httpServer = createServer(app);
const io = new Server(httpServer);

app.use('/api', router);

router.use(express.json());
router.use(express.urlencoded({ extended: true }));

app.use(express.static('public'))               // con http://localhost:8080/
// app.use('/static', express.static('public')) // con http://localhost:8080/static/

app.set("views", "./public/views");
app.set("view engine", "ejs");

// --- Conexxion del Servidor ------------------------------------------------------
const PORT = 8080;
const connectedServer = httpServer.listen(PORT, () => {
    console.log(`Servidor http escuchando en el puerto ${connectedServer.address().port}`)
});
connectedServer.on("error", error => console.log(`Error en servidor ${error}`));

// ----- WEBSOCKETS -----------------------------------------------------------

const products = new ProductContainer("productos");
const carts = new CartContainer("carritos");

app.get("/", (req, res) => {
    res.render("pages/index");
});

app.get('/carrito', (req, res) => {
    res.render('pages/carrito')
});

io.on("connection", async (socket) => {
    console.log(`Nuevo cliente conectado ${socket.id}`);

    socket.emit("productos", await products.getAll());

    socket.on('buscarProducto', async () => {
        socket.emit("productos", await products.getAll());
    });

    socket.on('buscarCarrito', async (id) => {
        socket.emit("carritos", await carts.getCartProducts(id));
    });
});

// -----Api de Productos -----------------------------------------------------------

router.get('/productos/', async (req, res) => {
    res.json(await products.getAll());
});

router.get('/productos/:id?', isAdmin, async (req, res) => {
    res.json(await products.getById(req.params.id));
})

router.post('/productos', isAdmin, async (req, res) => {
    res.json({ id: await products.add(req.body) });
})

router.put('/productos/:id', isAdmin, async (req, res) => {
    res.json(await products.put(req.params.id, req.body));
})

router.delete('/productos/:id', isAdmin, async (req, res) => {
    let result = await products.deleteById(req.params.id);
    if (result) {
        res.json(result);
    } else {
        res.sendStatus(200);
    }
})

//------ Api de carritos -----------------------------------------------------------

router.post('/carrito', async (req, res) => {
    res.json({ id: await carts.add(req.body) });
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
    res.json(await carts.getCartProducts(req.params.id));
})

router.post('/carrito/:id/productos', async (req, res) => {
    res.json(await carts.addProduct(req.params.id, req.body));
})

router.delete('/carrito/:id/productos/:id_prod', async (req, res) => {
    let result = await carts.deleteProductById(req.params.id, req.params.id_prod);
    if (result) {
        res.json(result);
    } else {
        res.sendStatus(200);
    }
});