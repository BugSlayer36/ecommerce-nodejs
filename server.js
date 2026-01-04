const app = require("./src/app");
const PORT = process.env.PORT || 3636
// server chi co 1 nhiem vu khai bao port de khoi dong server
const server = app.listen(PORT, () => {
    console.log(`WSV eCommerce start with ${PORT}`)
})