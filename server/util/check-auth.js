const { AuthenticationError } = require('apollo-server')

const jwt = require('jsonwebtoken')
const { SECRET_KEY } = require('../config')

const checkAuth = (context) => {
    const headers = context.req.headers.authorization

    if (headers) {
        const token = headers.split('Bearer ')[1]
        if (token) {
            try {
                const user = jwt.verify(token, SECRET_KEY)
                return user
            } catch (error) {
                throw new AuthenticationError('Invalid/Expired token')
            }
        }
        throw new Error("Authentication token must be 'Bearer [token]")
    }
    throw new Error('Authorization header must be provided')
}

module.exports = { checkAuth }