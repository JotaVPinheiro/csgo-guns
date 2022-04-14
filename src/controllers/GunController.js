const knex = require('../database')
const maxPerPage = 5

module.exports = {
    async index(req, res, next) {
        try {
            const params = req.query
            console.log(params)
            const page = params.page || 1
            const query = knex('guns')
                .limit(5)
                .offset((page - 1) * 5)

            if(params.id)
                query.where('id', params.id)
            else {
                if(params.name)
                    query.whereILike('name', `${params.name}%`)
                if(params.maxPrice)
                    query.where('price', '<=', params.maxPrice)
                if(params.minPrice)
                    query.where('price', '>=', params.minPrice)
                if(params.category)
                    query.whereLike('category', params.category)
                if(params.used_by)
                    query.whereLike('used_by', `%${params.used_by}%`)
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
            await knex('guns').insert(data)
            return res.status(201).send()
        } catch (error) {
            next(error)
        }
    }
}