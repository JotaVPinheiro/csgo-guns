const express = require("express")
export const routes = express.Router()
const multer = require('multer')
import { multerConfig } from "./config/multer";

import { GunController } from "./controllers/GunController";
import { UserController } from "./controllers/UserController";
import { ReviewController } from "./controllers/ReviewController";

routes
  // Gun routes
  .get('/guns/:id?', GunController.index)
  .post('/guns', multer(multerConfig).single('image'), GunController.create)
  .put('/guns/:id', GunController.update)
  .delete('/guns/:id', GunController.delete)
  // User routes
  .get('/users/:id?', UserController.index)
  .post('/users', UserController.create)
  .put('/users/:id', UserController.update)
  .delete('/users/:id', UserController.delete)
  .post('/login', UserController.login)
  .post('/logout', UserController.logout)
  .get('/auth', UserController.auth)
  // Review routes
  .get('/reviews', ReviewController.index)
  .post('/reviews', ReviewController.create)
  .delete('/reviews', ReviewController.delete)

module.exports = routes