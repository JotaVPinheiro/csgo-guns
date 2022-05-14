require('dotenv').config
const knex = require('../database')
const jwt = require('jsonwebtoken')

const filterProperties = (data) => {
  const { rating, message } = data
  return { rating, message, user_id: 0, gun_id: 0 }
}

interface Review {
  rating: number
  message?: string
  user_id: number
  gun_id: number
}

// module.exports = {
export const ReviewController = {
  async index(req, res, next) {
    try {
      const params = req.query
      const page = params.page || 1

      // Exeption handling
      if (params.gun_id == 0)
        throw new Error('No gun id provided.')

      const query = knex('reviews')
        .where('gun_id', params.gun_id)

      // Filtering
      if (params.user_id)
        query.where('user_id', params.user_id)

      query
        .limit(process.env.max_per_page)
        .offset((page - 1) * Number(process.env.max_per_page))

      const reviews = await query
      return res.json(reviews)
    } catch (error) {
      next(error)
    }
  },

  async create(req, res, next) {
    try {
      const data: Review = filterProperties(req.body)
      const { gun_id = 0 } = req.query
      const token = req.headers['x-access-token']
      const user = jwt.verify(token, process.env.secret_key)

      // Exception handling
      if (gun_id == 0)
        throw new Error('No gun_id provided.')

      if (data.rating < 0 || data.rating > 5)
        throw new Error('Rating needs to be between 0 and 5.')

      for (const property in data) {
        if (!data[property])
          throw new Error(`${property} can't be null.`)
      }

      data.gun_id = gun_id
      data.user_id = user.id

      await knex('reviews').insert(data)
      return res.status(201).send()
    } catch (error) {
      next(error)
    }
  },

  async delete(req, res, next) {
    try {
      const { id = 0 } = req.query
      const token = req.headers['x-access-token']
      const user = jwt.verify(token, process.env.secret_key)
      const review = await knex('reviews').where({ id })

      if (review.length == 0)
        throw new Error('Review not found.')

      if (!user.is_admin && user.id != review[0].user_id)
        throw new Error('Access denied.')

      if (id == 0)
        throw new Error('No id provided.')

      await knex('reviews').where({ id }).del()
      return res.status(201).send()
    } catch (error) {
      next(error)
    }
  }
}