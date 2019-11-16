const { ApolloServer, PubSub } = require('apollo-server')
const mongoose = require('mongoose')

const MONGODB = require('./config')
const typeDefs = require('./graphql/types/typeDefs')
const resolvers = require('./graphql/resolvers')

const pubsub = new PubSub();

const server = new ApolloServer({
    typeDefs,
    resolvers,
    context: ({ req }) => ({ req, pubsub })
})

mongoose.connect(MONGODB.MONGODB, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => {
    console.log('MONGODB CONNECTED!!')
    return server.listen({ port: process.env.PORT || 5000 })
})
.then( res => console.log(`SERVER RUNNING AT ${res.port}`))
.catch(err => console.log(err))