const { model, Schema } = require('mongoose')

const userSchem = new Schema({
    username: String,
    password: String,
    email: String,
    createdAt: String
})

module.exports = model('User', userSchem)