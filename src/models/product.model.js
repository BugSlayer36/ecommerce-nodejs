'use strict'

const { Schema, model } = require('mongoose');

const DOCUMENT_NAME = 'Product'
const COLLECTION_NAME = 'Products'


const productSchema = new Schema({
    product_name: {
        type: String,
        required: true
    },
    product_thumb: {
        type: String,
        required: true
    },
    product_description: {
        type: String,
        required: false
    },
    product_price: {
        type: Number,
        required: true
    },
    product_quantity: {
        type: Number,
        required: true
    },
    product_type: {
        type: String,
        required: true,
        enum: ['Electronics', 'Clothings', 'Furniture']
    },
    product_shop: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    product_attributes: {
        type: Schema.Types.Mixed, required: true
    },
}, {
    collection: COLLECTION_NAME,
    timestamps: true
})

// define the product type = clothing 
const electronicSchema = new Schema({
    manufacturer: {
        type: String,
        required: true
    },
    model: {
        type: String
    },
    color: {
        type: String
    }
}, {
    collection: 'clothes',
    timeseries: 'true'
})

// define the product type = electronic 
const clothingSchema = new Schema({
    brand: {
        type: String,
        required: true
    },
    size: {
        type: String
    },
    material: {
        type: String
    }
}, {
    collection: 'electronics',
    timeseries: 'true'
})

module.exports = {
    product: model(DOCUMENT_NAME, productSchema),
    electronic: model('Electronics', electronicSchema),
    clothing: model('Clothings', clothingSchema)
}