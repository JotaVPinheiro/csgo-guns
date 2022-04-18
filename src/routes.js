const express = require("express")
const routes = express.Router()
const multer = require('multer')
const multerConfig = require('./config/multer')

const GunController = require('./controllers/GunController')

routes
    .get('/guns', GunController.index)
    .post('/guns', multer(multerConfig).single('image'), GunController.create)

module.exports = routes