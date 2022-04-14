const express = require("express")
const routes = express.Router()

const GunController = require('./controllers/GunController')

routes
    .get('/index', GunController.index)

module.exports = routes