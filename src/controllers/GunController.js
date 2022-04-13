module.exports = {
    index: (req, res, next) => {
        try {
            return res.json({ "a": "b" })
        } catch (error) {
            next(error)
        }
    }
}