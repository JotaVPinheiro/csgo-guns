require('dotenv').config
const knex = require('../database')
const jwt = require('jsonwebtoken')

const handleError = require('../exceptions/handler')
const { use } = require('bcrypt/promises')

const maxPerPage = 5

module.exports = {
    async index(req, res, next) {
        try {
            const params = req.query
            console.log(params)
            const page = params.page || 1
            const query = knex('guns')
                .limit(maxPerPage)
                .offset((page - 1) * maxPerPage)

            if(!params) {
                const results = await query
                return res.json(results)
            }
            
            if(params.id) {
                query.where('id', params.id)
                const results = await query
                return res.json(results)
            }
            
            // Filtering
            if(params.name)
                query.whereILike('name', `${params.name}%`)
            if(params.max_price)
                query.where('price', '<=', params.max_price)
            if(params.min_price)
                query.where('price', '>=', params.min_price)
            if(params.category)
                query.whereLike('category', params.category)
            if(params.used_by)
                query.whereLike('used_by', `%${params.used_by}%`)
                
            // Ordenation
            if(params.by_price) {
                query.orderBy('price', params.desc ? 'desc' : '')
                const results = await query
                return res.json(results)
            }
            
            if(params.by_name) {
                query.orderBy('name', params.desc ? 'desc' : '')
                const results = await query
                return res.json(results)
            }

            if(params.by_release) {
                query.orderBy('release_date', params.desc ? 'desc' : '')
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
            const data = req.body
            const token = await req.headers['x-access-token']

            const user = jwt.verify(token, process.env.secret_key)

            if(!token)
                return handleError('not_provided', res, 'jwt token')

            if(!user)
                return handleError('auth_fail', res)

            if(!user.is_admin)
                return handleError('access_denied', res)

            if(req.file)
                data.img_path = req.file.filename
            
            if(await knex('guns').where('name', data.name).length > 0)
                return handleError('already_registered', res)

            if(Date.parse(data.release_date) > Date.now())
                return handleError('future_release_date', res)

            for(const element in data) {
                if(data[element] == '')
                    return handleError('null_property', res, element)

                if(typeof data[element] == 'number' && data[element] <= 0)
                    return handleError('negative_value', res, element)
            }

            // await knex('guns').insert(data)
            // return res.status(201).send()
        } catch (error) {
            next(error)
        }
    }

}