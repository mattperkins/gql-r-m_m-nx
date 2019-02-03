const express = require("express")
const bodyParser = require("body-parser")
const graphqlHttp = require("express-graphql")
const mongoose = require("mongoose")

const graphqlSchema = require("./graphql/schema")
const graphqlResolvers = require("./graphql/resolvers")

const app = express()

app.use(bodyParser.json())

// middleware to parse schema queries and resolvers
app.use('/graphql', graphqlHttp({
  schema: graphqlSchema,
  rootValue: graphqlResolvers,
  graphiql: true
}))

const { MONGO_USER, MONGO_PASS, MONGO_DB, MONGO_PORT, MONGO_NAME } = process.env
const PORT = 3000
mongoose.connect(`mongodb://${MONGO_USER}:${MONGO_PASS}@${MONGO_DB}:${MONGO_PORT}/${MONGO_NAME}`, { useNewUrlParser: true })
  .then(() => {
    app.listen(PORT, console.log(`Server running on ${PORT} with database connection established`))
  }).catch(err => {
    console.log(err)
  })
