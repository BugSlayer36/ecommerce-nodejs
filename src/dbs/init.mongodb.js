'use strict'

const mongoose = require('mongoose')
const { countConnect } = require('../helpers/check.connect')
const { db: { host, name, port } } = require('../configs/config.mongodb')
const connectString = `mongodb://${host}:${port}/${name}`

class Database {

    constructor() {
        this.connect()
    }

    // connect 
    connect(type = 'mongodb') {

        mongoose.set('strictQuery', true)

        if (process.env.NODE_ENV !== 'production') {
            mongoose.set('debug', true)
        }

        //connect information
        console.log(`connect string : ${connectString}`)

        mongoose.connect(connectString, {
            maxPoolSize: 50
        }).then(_ => {
            console.log(`Connect mongodb pro success`, countConnect())
        })
            .catch(err => console.log(`Error Connect!`))
    }

    static getInstance() {
        if (!Database.instance) {
            Database.instance = new Database()
        }

        return Database.instance
    }
}

const instanceMongodb = Database.getInstance()
module.exports = instanceMongodb