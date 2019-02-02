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
      events: [String!]!
    }
    type RootMutation {
      createEvent(name: String): String
    }

    schema {
      query: RootQuery
      mutation: RootMutation
    }
  `),
  // schema logic 'resolvers' = functions that match schema endpoints 
  rootValue: {
    // 'events' resolver corresponding to the 'events' RootQuery 
    events: () => {
      return ['C8691', 'NBr252', 'Le9175']
    },
    // 'createEvent' resolver corresponding to the 'createEvent' RootMutation (which accepts arguments (args) === name: String)
    createEvent: (args) => {
      const eventName = args.name
      return eventName
    }
  },
  graphiql: true
}))

const PORT = 3000
app.listen(PORT, console.log(`Server running on ${PORT}`))