const knex = require('../database')
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
            
            if(Date.parse(data.release_date) > Date.now())
                throw new Error("Release date can't be in future time.")

            await knex('guns').insert(data)
            return res.status(201).send()
        } catch (error) {
            next(error)
        }
    }
}