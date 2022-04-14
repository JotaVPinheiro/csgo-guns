const knex = require('../database')
const maxPerPage = 5

module.exports = {
    async index(req, res, next) {
        try {
            const params = req.query
            const query = knex('guns')
                .limit(5)
                .offset((params.page - 1) * 5)

            if(params.id)
                query.where({ id })

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