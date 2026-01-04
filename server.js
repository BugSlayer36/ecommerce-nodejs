const app = require("./src/app");

const mongoose = require('mongoose')


const PORT = 3636

// server chi co 1 nhiem vu khai bao port de khoi dong server
const server = app.listen(PORT, () => {
    console.log(`WSV eCommerce start with ${PORT}`)
})

const shutdown = async (signal) => {
    console.log(`\nReceived ${signal}. Shutting down...`)

    server.close(async () => {
        console.log('Exit server Express')

        await mongoose.connection.close(false)
        console.log('MongoDB disconnected')

        process.exit(0)
    })
}

process.once('SIGINT', shutdown)
process.once('SIGTERM', shutdown)