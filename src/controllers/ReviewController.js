require('dotenv').config
const knex = require('../database')
const jwt = require('jsonwebtoken')

const handleError = require('../exceptions/handler')

const maxPerPage = 5

module.exports = {
    async index(req, res, next) {
        const { gun_id = 0 } = await req.query

        if(gun_id == 0)
            return handleError('no_gun_id', res)
        
        const gun_reviews = await knex('reviews').where({ gun_id })

        return res.json(gun_reviews)
    },
    async create(req, res, next) {
        try {
            const data = req.body

            if(data.rating < 0 || data.rating > 5)
                return handleError('bad_rating', res)

            data.gun_id = req.query.gun_id
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
    }
}