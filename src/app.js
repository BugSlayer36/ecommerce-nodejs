const express = require('express')
const morgan = require('morgan')
const { default: helmet } = require('helmet')
const compression = require('compression')
const { countConnect } = require('./helpers/check.connect')
const app = express()


// init middlewares
app.use(morgan("dev")) // khi nào dùng dev thì bật mode này
app.use(helmet()) // giup bao mat ung dung web bang cach tu dong them cac HTTP security header
app.use(compression())

// init db 
require('./dbs/init.mongodb')
const { checkOverload } = require('./helpers/check.connect')
checkOverload()


// init routes
app.get('/', (req, res, next) => {

    const strCompress = 'Quang Trung'

    return res.status(200).json({
        message: 'Hello A Dep zai',
        //metadata: strCompress.repeat(1000)
    })
})
//handling error
module.exports = app