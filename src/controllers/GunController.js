require('dotenv').config
const env = process.env
const knex = require('../database')
const jwt = require('jsonwebtoken')

const formatError = require('../exceptions/formatError')

const filterProperties = (data) => {
    const { name, category, release_date, price, used_by, damage, 
        fire_rate, fire_mode, magazine_capacity, max_ammo, reload_time, 
        running_speed } = data
    return { name, category, release_date, price, used_by, damage, 
        fire_rate, fire_mode, magazine_capacity, max_ammo, reload_time, 
        running_speed }
}

module.exports = {
    async index(req, res, next) {
        try {
            const params = req.query
            const page = params.page || 1
            
            const query = knex('guns')
            
            // Filtering
            if(params.id) {
                query.where('id', params.id)
                const results = await query
                return res.json(results)
            }
            
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
            if(params.by_price)
                query.orderBy('price', params.desc ? 'desc' : '')
            else if(params.by_name)
                query.orderBy('name', params.desc ? 'desc' : '')
            else if(params.by_release)
                query.orderBy('release_date', params.desc ? 'desc' : '')
            
            query
                .limit(env.max_per_page)
                .offset((page - 1) * env.max_per_page)

            const guns = await query

            for(const index in guns) {
                const reviews = await knex('reviews')
                    .where('gun_id', guns[index].id)
                
                let rating = 0

                for(const review of reviews) {
                    rating += review.rating
                }

                guns[index].rating = rating
                                     ? (rating/reviews.length).toFixed(1)
                                     : 'none'
            }
            
            return res.json(guns)
        } catch (error) {
            next(error)
        }
    },

    async create(req, res, next) {
        try {
            const data = filterProperties(req.body)
            const token = req.headers['x-access-token']
            const user = jwt.verify(token, env.secret_key)

            // Exception handling
            if(!user.is_admin)
                throw formatError('access_denied')
            
            if((await knex('guns').where('name', data.name)).length > 0)
                throw formatError('already_registered', 'Gun')

            if(Date.parse(data.release_date) > Date.now())
                throw formatError('future_release_date')

            for(const element in data) {
                if(!data[element] || data[element] == 0)
                    throw formatError('null_property', element)

                if(data[element] < 0)
                    throw formatError('negative_value', element)
            } 

            if(req.file)
                data.img_path = req.file.filename

            await knex('guns').insert(data)
            return res.status(201).send()
        } catch (error) {
            next(error)
        }
    },

    async update(req, res, next) {
        try {
            const data = filterProperties(req.body)
            const { id = 0 } = req.query
            const token = req.headers['x-access-token']
            const user = jwt.verify(token, env.secret_key)

            // Exception handling
            if(!user.is_admin)
                throw formatError('access_denied')

            if(id == 0)
                throw formatError('not_provided', 'id')

            const gun = await knex('guns').where({ id })

            // Exception handling
            if(gun.length == 0)
                throw formatError('not_found', 'Gun')

            data.updated_at = new Date()
            await knex('guns').update(data).where({ id })
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

            if(!user.is_admin)
                throw formatError('access_denied')

            if(id == 0)
                throw formatError('not_provided', 'id')

            const gun = await knex('guns').where({ id })

            if(gun.length == 0)
                throw formatError('not_found', 'Gun')

            await knex('guns').where({ id }).del()
            return res.status(201).send()
        } catch (error) {
            next(error)
        }
    }

}