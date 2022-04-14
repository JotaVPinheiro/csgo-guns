const knex = require('../database')

module.exports = {
    async index(req, res, next) {
        try {
            const query = knex('guns')
            const { id } = req.query

            if(id)
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