require('dotenv').config
const env = process.env
const knex = require('../database')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')

const formatError = require('../exceptions/formatError')

const filterProperties = (data) => {
    const { username, email, password } = data
    return { username, email, password }
}

const validEmail = /^.+@.+\..+$/
const saltOrRounds = 10
const expiresIn = 60 * 60
const expiredTokens = []

module.exports = {
    async index(req, res, next) {
        try {
            const params = req.query
            const page = params.page || 1
            const query = knex('users')
            
            // Filtering
            if(params.id) {
                query.where('id', params.id)
                const users = await query
                return res.json(users)
            }

            query
                .limit(env.max_per_page)
                .offset((page - 1) * env.max_per_page)

            const users = await query
            return res.json(users)
        } catch (error) {
            next(error)
        }
    },

    async create(req, res, next) {
        try {
            const data = filterProperties(req.body)

            // Exception handling
            if((await knex('users').where('username', data.username)).length > 0)
                throw formatError('already_registered', 'Username')

            if(password.length < 6)
                throw formatError('short_password')

            if(!validEmail.test(email))
                throw formatError('invalid_email')

            for(const property in data) {
                if(!data[property])
                    throw formatError('null_property', property)
            }
    
            data.is_admin = false
            data.hash_password = await bcrypt.hash(password, saltOrRounds)
            
            await knex('users').insert(data)
            return res.status(201).send()
        } catch (error) {
            next(error)
        }
    },

    async login(req, res, next) {
        try {
            const { username, password } = req.body
            const user = await knex('users').where('username', username)

            if(user.length == 0)
                throw formatError('not_found', 'Username')

            const rightPassword = await bcrypt.compare(password, user[0].hash_password)

            if(!rightPassword) {
                throw formatError('wrong_password')
            } else {
                const token = jwt.sign(user[0], env.secret_key, { expiresIn })
                return res.json({ auth: true, token })
            }
        } catch (error) {
            next(error)
        }
    },

    async logout(req, res, next) {
        const token = req.headers['x-access-token']
        expiredTokens.push(token)

        return res.json({ auth: false, token: null})
    },

    async auth(req, res, next) {
        try {
            const token = req.headers['x-access-token']

            if(!token)
                throw formatError('not_provided', 'jwt token')

            if(expiredTokens.indexOf(token) >= 0)
                return res.status(403).send()

            jwt.verify(token, env.secret_key, (error, decoded) => {
                if(error)
                    next(error)
                
                return res.status(200).send()
            })

        } catch (error) {
            next(error)
        }
    }
    
}