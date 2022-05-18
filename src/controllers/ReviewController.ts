require('dotenv').config
const jwt = require('jsonwebtoken')

import { PrismaClient } from "@prisma/client"
const prisma = new PrismaClient()

function filterProperties(data: Review): Review {
  const { rating, message } = data
  return { rating, message, user_id: null, gun_id: null }
}

interface Review {
  rating: number
  message?: string
  user_id: string
  gun_id: string
}

export const ReviewController = {

  async index(req, res, next) {
    const maxPerPage = 10

    try {
      const { page = 1 } = req.query
      const pagination = { skip: (page - 1) * maxPerPage, take: maxPerPage }
      const select = { rating: true, message: true }
      const { gun_id } = req.params

      if (gun_id == undefined)
        throw new Error('No gun_id provided.')

      const reviews = await prisma.review.findMany({ where: { gun_id }, ...pagination, select })

      return res.json(reviews)
    } catch (error) {
      next(error)
    }
  },

  async create(req, res, next) {
    try {
      const data: Review = filterProperties(req.body)
      const { gun_id } = req.params
      const token = req.headers['x-access-token']
      const user = jwt.verify(token, process.env.secret_key)

      // Exception handling
      if (gun_id == null)
        throw new Error('No gun_id provided.')
      
      if (data.rating == null)
        throw new Error(`Rating can't be null.`)

      if (data.rating < 0 || data.rating > 5)
        throw new Error('Rating needs to be between 0 and 5.')

      data.gun_id = gun_id
      data.user_id = user.id

      await prisma.review.create({ data })
      return res.status(201).send()
    } catch (error) {
      next(error)
    }
  },

  async delete(req, res, next) {
    try {
      const { id } = req.params
      const token = req.headers['x-access-token']
      const user = jwt.verify(token, process.env.secret_key)

      if (!user.is_admin)
        throw new Error('Access denied.')
      
      if (id == undefined)
        throw new Error('No id provided.')

      const review = await prisma.review.findFirst({ where: { id }})
      
      if (review == null)
        throw new Error('Review not found.')

      await prisma.review.delete({ where: { id } })
      return res.status(201).send()
    } catch (error) {
      next(error)
    }
  }
}