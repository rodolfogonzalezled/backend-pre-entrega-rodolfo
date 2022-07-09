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
            cartAdded = { id: newId, ...cart };
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
                    cart.productos.push(product);
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

