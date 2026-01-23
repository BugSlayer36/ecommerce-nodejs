'use strict'
const { product, clothing, electronic } = require('../models/product.model')
const { BadRequestError, ForbiddenError } = require('../core/error.response')
//define factory class to create product

class ProductFactory {

    /*
        type : 'Clothing',
        payload // data
    */
    static async createProduct(type, payload) {
        switch (type) {
            case 'Clothing':
                return new Clothing(payload).createProduct()
            case 'Electronics':
                return new Electronics(payload).createProduct()
            default:
                throw new BadRequestError(`Invalid Product Types ${type}`)
        }
    }
}

//define base product class

class Product {
    constructor({
        product_name, product_thumb, product_description,
        product_price, product_quantity, product_type,
        product_shop, product_attribute
    }) {
        this.product_name = product_name
        this.product_thumb = product_thumb
        this.product_description = product_description
        this.product_price = product_price
        this.product_quantity = product_quantity
        this.product_type = product_type
        this.product_shop = product_shop
        this.product_attribute = product_attribute
    }
    //create new product
    async createProduct() {
        return await product.create(this)
    }
}

// define sub-class for different product types Clothing

class Clothing extends Product {
    async createProduct() {
        const newClothing = await clothing.create(this.product_attribute)
        if (!newClothing) throw BadRequestError('create new clothing error')

        const newProduct = await super.createProduct()
        if (!newProduct) throw BadRequestError('create new product error')

        return newProduct;
    }
}
// define sub-class for different product types Electronics
class Electronics extends Product {
    async createProduct() {
        const newElectronic = await electronic.create(this.product_attribute)
        if (!newElectronic) throw BadRequestError('create new electronic error')

        const newProduct = await super.createProduct()
        if (newProduct) throw BadRequestError('create new product error')

        return newProduct
    }
}

module.exports = ProductFactory;