const express = require("express")
const routes = express.Router()

const GunController = require('./controllers/GunController')

routes
    .get('/guns', GunController.index)
    .post('/guns', GunController.create)

module.exports = routes