const express = require("express")
const bodyParser = require("body-parser")
const graphqlHttp = require("express-graphql")
const { buildSchema } = require("graphql")
const mongoose = require("mongoose")
const bcrypt = require("bcryptjs")

// consume model / schema
const Event = require("./models/event")
const User = require("./models/user")

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
      creator: User!
    }

    type User {
      _id: ID!
      email: String!
      password: String
      createdEvents: [Event!]
    }

    input EventInput {
      title: String! 
      description: String! 
      price: Float! 
      date: String!
    }

    input UserInput {
      email: String!
      password: String!
    }

    type RootQuery {
      events: [Event!]!
    }

    type RootMutation {
      createEvent(eventInput: EventInput): Event
      createUser(userInput: UserInput): User
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
    createEvent: args => {
      const event = new Event({
        title: args.eventInput.title,
        description: args.eventInput.description,
        price: +args.eventInput.price,
        date: new Date(args.eventInput.date),
        creator: "5c570b25a8bd972b93f853b3"
      })
      console.log(args)
      let createdEvent
      // Event object based on mongoose model
      return event
        .save()
        .then(result => {
          createdEvent = { ...result._doc, _id: result._doc._id.toString() }
          return User.findById('5c5711f9759fc62c1785d591')
          console.log(result)
        }).then(user => {
          if (!user) {
            throw new Error('User not found')
          }
          user.createdEvents.push(event)
          return user.save()
        }).then(result => {
          return createdEvent
        })
        .catch(err => {
          console.log(err)
          throw err
        })
      return event
    },
    createUser: args => {
      return User.findOne({
        email: args.userInput.email
      }).then(user => {
        if (user) {
          throw new Error('User already exists!')
        }
        // 12 rounds of salt
        return bcrypt
          .hash(args.userInput.password, 12)
      }).then(hashedPassword => {
        // add logic to create user in db
        const user = new User({
          // from graphql UserInput schema definitions
          email: args.userInput.email,
          password: hashedPassword
        })
        return user.save()
      })
        .then(result => {
          // using virtual mongoose getter for _id (see other _id comments)
          return { ...result._doc, password: null, _id: result.id }
        })
        .catch(err => {
          throw err
        })
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
