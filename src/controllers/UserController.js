const knex = require('../database')

const handleError = require('../exceptions/handler')

const maxPerPage = 5

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
}