const knex = require('../database')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

const handleError = require('../exceptions/handler')

const validEmail = /^.+@.+\..+$/
const maxPerPage = 5
const saltOrRounds = 10

module.exports = {
    async index(req, res, response) {
        try {
            const params = req.query
            console.log(params)
            const page = params.page || 1
            const query = knex('users')
                .limit(maxPerPage)
                .offset((page - 1) * maxPerPage)
            
            if(params.id) {
                query.where('id', params.id)
                const results = await query
                return res.json(results)
            }

            const results = await query
            return res.json(results)
        } catch (error) {
            next(error)
        }
    },

    async create(req, res, next) {
        try {
            try {
                const { username, email, password } = req.body
    
                if(password.length < 6)
                    return handleError('short_password', res)
    
                if(!validEmail.test(email))
                    return handleError('invalid_email', res)
    
                const hash_password = await bcrypt.hash(password, saltOrRounds)
                await knex('users').insert({ username, email, hash_password })
    
                return res.status(201).send()
            } catch (error) {
                next(error)
            }
        } catch (error) {
            next(error)
        }
    },

    
}