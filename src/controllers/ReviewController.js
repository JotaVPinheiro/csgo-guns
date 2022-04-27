require('dotenv').config
const env = process.env
const knex = require('../database')
const jwt = require('jsonwebtoken')

const handleError = require('../exceptions/handler')

const filterProperties = (data) => {
    const { rating, message } = data
    return { rating, message }
}

module.exports = {
    async index(req, res, next) {
        try {
            const params = req.query
            const page = params.page || 1

            // Exeption handling
            if(params.gun_id == 0)
                return handleError('not_provided', res, 'gun_id')

            const query = knex('reviews')
                .where('gun_id', params.gun_id)
                .limit(env.max_per_page)
                .offset((page - 1) * env.max_per_page)

            // Filtering
            if(params.user_id)
                query.where('user_id', params.user_id)

            const reviews = await query
            return res.json(reviews)
        } catch (error) {
            next(error)   
        }
    },

    async create(req, res, next) {
        try {
            const data = filterProperties(req.body)
            const { gun_id = 0 } = req.query
            const token = await req.headers['x-access-token']
            const user = jwt.verify(token, env.secret_key)

            // Exception handling
            if(gun_id == 0)
                return handleError('not_provided', res, 'gun_id')

            if(data.rating < 0 || data.rating > 5)
                return handleError('bad_rating', res)

            for(const property in data) {
                if(!data[property])
                    return handleError('null_property', res, property)
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
            const token = await req.headers['x-access-token']
            const { id = 0 } = req.query

            const user = jwt.verify(token, env.secret_key)
            const review = await knex('reviews').where({ id })

            if(!user.is_admin && user.id != review[0].user_id)
                return handleError('access_denied', res)

            if(id == 0)
                return handleError('not_provided', res, 'id')

            if(review.length == 0)
                return handleError('not_found', res, 'Review')
            
            await knex('reviews').where({ id }).del()
            return res.status(201).send()
        } catch (error) {
            next(error)
        }
    }
}