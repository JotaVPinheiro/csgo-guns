const knownErrors = {
    already_registered: {
        status: 400,
        message: "[param] already registered."
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
        message: "[param] can't be negative."
    },
    short_password: {
        status: 400,
        message: 'Your password needs to be at least 6 characters long.'
    },
    invalid_email: {
        status: 400,
        message: 'Invalid email.',
    },
    not_found: {
        status: 404,
        message: '[param] not found.'
    },
    wrong_password: {
        status: 400,
        message: 'Wrong password.'
    },
    not_provided: {
        status: 400,
        message: 'No [param] provided'
    },
    bad_rating: {
        status: 400,
        message: 'Rating must be between 0 and 5.'
    },
    access_denied: {
        status: 403,
        message: 'Access denied.'
    }
}

const formatError = async (err, param = '') => {
    if(!knownErrors[err])
        return new Error('Error in handler.js')

    const status = knownErrors[err].status
    const message = knownErrors[err].message.replace('[param]', param)

    const error = new Error(message)
    error.status = status

    return error
}

module.exports = formatError