require('dotenv').config
const env = process.env
const knex = require('../database')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')

const handleError = require('../exceptions/handler')

const filterProperties = (data) => {
    const { username, email, password } = data
    return { username, email, password }
}

const validEmail = /^.+@.+\..+$/
const saltOrRounds = 10
const expiresIn = 600

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
                return handleError('already_registered', res, 'Username')

            if(password.length < 6)
                return handleError('short_password', res)

            if(!validEmail.test(email))
                return handleError('invalid_email', res)

            for(const property in data) {
                if(!data[property])
                    return handleError('null_property', res, property)
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
            const { username, password } = await req.body
            const user = await knex('users').where('username', username)

            if(user.length == 0)
                return handleError('not_found', res, 'Username')

            const rightPassword = await bcrypt.compare(password, user[0].hash_password)

            if(!rightPassword) {
                return handleError('wrong_password', res)
            } else {
                const token = jwt.sign(user[0], env.secret_key, { expiresIn })
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
                return handleError('not_provided', res, 'jwt token')

            jwt.verify(token, env.secret_key, (err, decoded) => {
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