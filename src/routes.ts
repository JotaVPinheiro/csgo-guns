const express = require("express")
export const routes = express.Router()
const multer = require('multer')
import { multerConfig } from "./config/multer";

import { GunController } from "./controllers/GunController";
import { UserController } from "./controllers/UserController";
import { ReviewController } from "./controllers/ReviewController";

routes
  // Gun routes
  .get('/guns', GunController.index)
  .post('/guns', multer(multerConfig).single('image'), GunController.create)
  .put('/guns', GunController.update)
  .delete('/guns', GunController.delete)
  // User routes
  .get('/users', UserController.index)
  .post('/users', UserController.create)
  .post('/login', UserController.login)
  .post('/logout', UserController.logout)
  .get('/auth', UserController.auth)
  // Review routes
  .get('/reviews', ReviewController.index)
  .post('/reviews', ReviewController.create)
  .delete('/reviews', ReviewController.delete)

module.exports = routes