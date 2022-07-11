import * as fs from 'fs';

const fsPromises = fs.promises;

export default class CartContainer {
    constructor(name) {
        this.name = name;
    }

    async add(cart) {
        let carts = await this.getAll();
        let cartAdded;
        let newId;

        if (carts.length) {
            newId = carts[carts.length - 1].id + 1;
        } else {
            newId = 1;
        }

        try {
            cartAdded = { id: newId, timestamp: new Date(Date.now()).toLocaleString(), productos: [{...cart.producto, cantidad: 1}] };
            carts.push(cartAdded);
            await fsPromises.writeFile(`${this.name}.json`, JSON.stringify(carts, null, 2));
            return newId;
        } catch (error) {
            console.log(error);
        }
    }

    async deleteById(id) {
        let carts = await this.getAll();

        if (carts.find(cart => cart.id == id)) {
            carts = carts.filter(cart => cart.id != id);
            try {
                await fsPromises.writeFile(`${this.name}.json`, JSON.stringify(carts, null, 2))
            } catch (error) {
                console.log(error);
            }
        } else {
            return { error: "Carrito no encontrado" };
        }
    }

    async getCartProducts(id) {
        let carts = await this.getAll();
        let cart = carts.find(cart => cart.id == id);
        if (cart) {
            return cart.productos;
        } else {
            return { error: "Carrito no encontrado" };
        }
    }

    async addProduct(id, product) {
        let carts = await this.getAll();
        let cartUpdate;

        if (carts.find(cart => cart.id == id)) {
            carts.map(cart => {
                if (cart.id == id) {
                    // let productos = [];

                    // cart.productos.map(x => {
                    let producto = cart.productos.find(y => y.id == product.id);
                    console.log("first", producto)
                    if (producto) {
                        cart.productos.map(x => {
                            if (x.id == producto.id) {
                                x.cantidad = producto.cantidad + 1;
                            }
                        });



                        // productos.push({ cantidad: producto.cantidad++, ...product })
                    } else {
                        cart.productos.push({ cantidad: 1, ...product });
                    }
                    //     let cantidad = cart.productos.find(y => y.id == x.id).length;
                    //     console.log('cantidad: ', cantidad)
                    //     if (cantidad > 1) {
                    //         if (!productos.find(el => el.id == x.id)) {
                    //             productos.push({ cantidad, ...x })
                    //         }
                    //     } else {
                    //         productos.push({cantidad: 1, ...x})
                    //     }
                    // })

                    cartUpdate = cart;
                }
            })
            try {
                await fsPromises.writeFile(`${this.name}.json`, JSON.stringify(carts, null, 2))
                return cartUpdate;
            } catch (error) {
                console.log(error);
            }
        } else {
            return { error: "Carrrito no encontrado" };
        }
    }

    async deleteProductById(id, idProduct) {
        let carts = await this.getAll();

        if (carts.find(cart => cart.id == id)) {
            carts.map(cart => {
                if (cart.id == id) {
                    cart.productos = cart.productos.filter(product => product.id != idProduct);
                }
            });
            try {
                await fsPromises.writeFile(`${this.name}.json`, JSON.stringify(carts, null, 2))
            } catch (error) {
                console.log(error);
            }
        } else {
            return { error: "Carrito no encontrado" };
        }
    }

    async getAll() {
        try {
            let carts = await fsPromises.readFile(`${this.name}.json`, 'utf8');
            if (carts) {
                return JSON.parse(carts);
            } else {
                return [];
            }
        } catch (error) {
            console.log(error)
            return [];
        }
    }
}

