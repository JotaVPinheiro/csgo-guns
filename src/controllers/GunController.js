qconst knex = require('../database')

module.exports = {
    async index(req, res, next) {
        try {
            const query = await knex('guns')
            return res.json(query)
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