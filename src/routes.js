const express = require("express")
const routes = express.Router()

const SkinController = require('./controllers/SkinController')

routes
    .get('/index', SkinController.index)

module.exports = routes