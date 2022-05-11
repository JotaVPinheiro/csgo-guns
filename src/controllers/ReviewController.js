require('dotenv').config
const env = process.env
const knex = require('../database')
const jwt = require('jsonwebtoken')

const formatError = require('../exceptions/formatError')

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
                throw formatError('not_provided', 'gun_id')

            const query = knex('reviews')
                .where('gun_id', params.gun_id)

            // Filtering
            if(params.user_id)
                query.where('user_id', params.user_id)

            query
                .limit(env.max_per_page)
                .offset((page - 1) * env.max_per_page)

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
            const token = req.headers['x-access-token']
            const user = jwt.verify(token, env.secret_key)

            // Exception handling
            if(gun_id == 0)
                throw formatError('not_provided', 'gun_id')

            if(data.rating < 0 || data.rating > 5)
                throw formatError('bad_rating')

            for(const property in data) {
                if(!data[property])
                    throw formatError('null_property', property)
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
            const user = jwt.verify(token, env.secret_key)
            const review = await knex('reviews').where({ id })
            
            if(review.length == 0)
                throw formatError('not_found', 'Review')

            if(!user.is_admin && user.id != review[0].user_id)
                throw formatError('access_denied')

            if(id == 0)
                throw formatError('not_provided', 'id')

            await knex('reviews').where({ id }).del()
            return res.status(201).send()
        } catch (error) {
            next(error)
        }
    }
}