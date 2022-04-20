const express = require("express")
const routes = express.Router()
const multer = require('multer')
const multerConfig = require('./config/multer')

const GunController = require('./controllers/GunController')
const UserController = require('./controllers/UserController')
const ReviewController = require('./controllers/ReviewController')

routes
    // Gun routes
    .get('/guns', GunController.index)
    .post('/guns', multer(multerConfig).single('image'), GunController.create)
    // User routes
    .get('/users', UserController.index)
    .post('/users', UserController.create)
    .post('/login', UserController.login)
    .post('/logout', UserController.logout)
    .get('/auth', UserController.auth)
    // Review routes
    .get('/reviews', ReviewController.index)
    .post('/reviews', ReviewController.create)

module.exports = routes