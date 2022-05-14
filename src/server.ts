const routes = require('./routes')
const express = require('express')
const app = express()

interface Error {
  status?: number;
  code?: number;
}

app
  .use(express.json())
  .use(express.urlencoded({ extended: true }))
  .use(routes)
  .use((req, res, next) => {
    const error = new Error('Not Found!')
    error.status = 404
    next(error)
  })
  .use((error, req, res, next) => {
    res.status(error.status || 500)
    res.json({ error: error.message })
  })
  .listen(8080, () => console.log('Server running...'))