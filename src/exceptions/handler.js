const knownErrors = {
    already_registered: {
        status: 400,
        message: "Gun already registered."
    },
    future_release_date: {
        status: 400,
        message: "Release date can't be in future time."
    },
    null_property: {
        status: 400,
        message: "[param] can't be null."
    },
    negative_value: {
        status: 400,
        message: "[param] can't be negative or 0."
    },
    short_password: {
        status: 400,
        message: 'Your password needs to be at least 6 characters long.'
    },
    invalid_email: {
        status: 400,
        message: 'Invalid email.',
    },
    user_not_found: {
        status: 400,
        message: 'Username not found.'
    },
    wrong_password: {
        status: 400,
        message: 'Wrong password.'
    },
    no_token: {
        status: 400,
        message: 'No token provided.'
    },
    auth_fail: {
        status: 500,
        message: 'Failed to authenticate token.'
    }
}

const handleError = async (err, res, param = '') => {
    if(!knownErrors[err])
        return res.status(500).json({ error: 'Error in handler.js' })

    const status = knownErrors[err].status
    const message = knownErrors[err].message.replace('[param]', param)

    return res.status(status).json({ error: message })
}

module.exports = handleError