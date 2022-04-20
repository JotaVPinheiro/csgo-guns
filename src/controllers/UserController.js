require('dotenv').config
const knex = require('../database')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

const handleError = require('../exceptions/handler')

const validEmail = /^.+@.+\..+$/
const maxPerPage = 5
const saltOrRounds = 10
const expiresIn = 600

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

    async login(req, res, next) {
        try {
            const { username, password } = await req.body
            const user = await knex('users').where('username', username)

            if(user.length == 0)
                return handleError('user_not_found', res)

            const rightPassword = await bcrypt.compare(password, user[0].hash_password)

            if(!rightPassword) {
                return handleError('wrong_password', res)
            } else {
                const token = jwt.sign(user[0], process.env.secret_key, { expiresIn })
                return res.json({ auth: true, token })
            }
        } catch (error) {
            next(error)
        }
    },

    async logout(req, res, next) {
        const token = await req.headers['x-access-token']

        return res.json({ auth: false, token: null})
    },

    async auth(req, res, next) {
        try {
            const token = await req.headers['x-access-token']

            if(!token)
                return handleError('no_token', res)

            jwt.verify(token, process.env.secret_key, (err, decoded) => {
                if(err) {
                    return handleError('auth_fail', res)
                } else {
                    return res.status(200).send()
                }
            })
        } catch (error) {
            next(error)
        }
    }
    
}