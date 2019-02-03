const express = require("express")
const bodyParser = require("body-parser")
const graphqlHttp = require("express-graphql")
const { buildSchema } = require("graphql")
const mongoose = require("mongoose")

// consume model / schema
const Event = require("./models/event")

const app = express()

app.use(bodyParser.json())

// app.get('/', (req, res, next) => {
//   res.send('Endpoint reached!')
// })

// middleware to parse schema queries and resolvers
app.use('/graphql', graphqlHttp({
  // configure graphql api
  schema: buildSchema(`
    type Event {
      _id: ID!
      title: String!
      description: String!
      price: Float!
      date: String!
    }

    input EventInput {
      title: String! 
      description: String! 
      price: Float! 
      date: String!
    }

    type RootQuery {
      events: [Event!]!
    }

    type RootMutation {
      createEvent(eventInput: EventInput): Event
    }

    schema {
      query: RootQuery
      mutation: RootMutation
    }
  `),
  // schema logic 'resolvers' = functions that match schema endpoints 
  rootValue: {
    // 'events' resolver corresponding to the 'events:[Event!]' RootQuery 
    events: () => {
      // mongoose call static methods on the Event constructor 
      //  'return' indicates it as async to graphql
      return Event.find()
        .then(events => {
          return events.map(event => {
            // core event data properties sans meta (via mongoose)
            // _id:event.id = mongoose method/convesion of id to graphql id
            return { ...event._doc, _id: event.id }
          })
        })
        .catch(err => {
          throw err
        })
    },
    // 'createEvent' resolver corresponding to the 'createEvent' RootMutation (which accepts arguments (args) === name: String)
    createEvent: (args) => {
      const event = new Event({
        title: args.eventInput.title,
        description: args.eventInput.description,
        price: +args.eventInput.price,
        date: new Date(args.eventInput.date)
      })
      console.log(args)
      // Event object based on mongoose model
      return event
        .save()
        .then(result => {
          console.log(result)
          // core event data properties sans meta (via mongoose)
          // _id = alternative mongoose method/convesion of id to graphql id
          return { ...result._doc, _id: result._doc._id.toString() }
        }).catch(err => {
          console.log(err)
          throw err
        })
      return event
    }
  },
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
