const bcrypt = require("bcryptjs")

// consume model / schema
const Event = require("../../models/event")
const User = require("../../models/user")

const events = eventsId => {
  return Event.find({
    _id: { $in: eventsId }
  }).then(events => {
    return events.map(event => {
      return {
        ...event._doc,
        _id: event.id,
        date: new Date(event._doc.date).toISOString(),
        creator: user.bind(this, event.creator)
      }
    })
  })
    .catch(err => { throw err })
}

// used by creator:
const user = userId => {
  return User.findById(userId)
    .then(user => {
      return {
        ...user._doc,
        _id: user.id,

        createdEvents: events.bind(this, user._doc.createdEvents)
      }
    })
    .catch(err => {
      throw err
    })
}


module.exports = {
  // 'events' resolver corresponding to the 'events:[Event!]' RootQuery 
  events: () => {
    // mongoose call static methods on the Event constructor 
    //  'return' indicates it as async to graphql
    return Event.find()
      .then(events => {
        return events.map(event => {
          return {
            ...event._doc,
            _id: event.id,
            date: new Date(event._doc.date).toISOString(),
            creator: user.bind(this, event._doc.creator)
          }
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
      creator: '5c57480aaea91030abe18c8b'
    })
    console.log(args)
    let createdEvent
    // Event object based on mongoose model
    return event
      .save()
      .then(result => {
        createdEvent = {
          ...result._doc,
          _id: result._doc._id.toString(),
          creator: user.bind(this, result._doc.creator)
        }
        return User.findById('5c57480aaea91030abe18c8b')
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
}