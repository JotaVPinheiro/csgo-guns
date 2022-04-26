require('dotenv').config
const knex = require('../database')
const jwt = require('jsonwebtoken')

const handleError = require('../exceptions/handler')
const { handle } = require('express/lib/application')

const maxPerPage = 5

module.exports = {
    async index(req, res, next) {
        try {
            const { gun_id = 0, page = 1 } = await req.query
    
            if(gun_id == 0)
                return handleError('not_provided', res, 'gun_id')
                
            const gun_reviews = await knex('reviews')
                .where({ gun_id })
                .limit(maxPerPage)
                .offset((page - 1) * maxPerPage)
    
            return res.json(gun_reviews)
        } catch (error) {
            next(error)   
        }
    },

    async create(req, res, next) {
        try {
            const data = req.body
            const { gun_id = 0 } = req.query

            if(data.rating < 0 || data.rating > 5)
                return handleError('bad_rating', res)
            
            if(gun_id == 0)
                return handleError('not_provided', res, 'gun_id')

            data.gun_id = gun_id
            const token = await req.headers['x-access-token']

            jwt.verify(token, process.env.secret_key, (err, decoded) => {
                if(err) {
                    return handleError('auth_fail', res)
                } else {
                    data.user_id = decoded.id
                }
            })

            await knex('reviews').insert(data)
            return res.status(201).send()
        } catch (error) {
            next(error)
        }
    },

    async delete(req, res, next) {
        try {
            const token = await req.headers['x-access-token']
            const user = jwt.verify(token, process.env.secret_key)

            if(!user.is_admin)
                return handleError('access_denied', res)
            
            const { id = 0 } = req.query

            if(id == 0)
                return handleError('not_provided', res, 'id')

            const review = await knex('reviews').where({ id })

            if(review.length == 0)
                return handleError('not_found', res, 'Review')
            
            await knex('reviews').where({ id }).del()
            return res.status(201).send()
        } catch (error) {
            next(error)
        }
    }
}