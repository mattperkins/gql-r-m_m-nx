const express = require("express")
const bodyParser = require("body-parser")
const graphqlHttp = require("express-graphql")
const { buildSchema } = require("graphql")

const app = express()

app.use(bodyParser.json())

// app.get('/', (req, res, next) => {
//   res.send('Endpoint reached!')
// })

// middleware to parse schema queries and resolvers
app.use('/graphql', graphqlHttp({
  // configure graphql api
  schema: buildSchema(`
    type RootQuery {

    }

    type RootMutation {

    }
    schema {
      query: RootQuery
      mutation: RootMutation
    }
  `),
  // resolver functions that match schema endpoints
  rootValue: {

  }
}))

const PORT = 3000
app.listen(PORT, console.log(`Server running on ${PORT}`))