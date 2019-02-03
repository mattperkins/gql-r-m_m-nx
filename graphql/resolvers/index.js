const bcrypt = require("bcryptjs")

// consume model / schema
const Event = require("../../models/event")
const User = require("../../models/user")

const events = async eventIds => {
  try {
    const events = await Event.find({ _id: { $in: eventIds } })
    events.map(event => {
      return {
        ...event._doc,
        _id: event.id,
        date: new Date(event._doc.date).toISOString(),
        creator: user.bind(this, event.creator)
      }
    })
    return events
  } catch (err) {
    throw err
  }
}



const user = async userId => {
  try {
    const user = await User.findById(userId)
    return {
      ...user._doc,
      _id: user.id,
      createdEvents: events.bind(this, user._doc.createdEvents)
    }
  } catch (err) {
    throw err
  }
}



module.exports = {
  events: async () => {
    try {
      const events = await Event.find()
      return events.map(event => {
        return {
          ...event._doc,
          _id: event.id,
          date: new Date(event._doc.date).toISOString(),
          creator: user.bind(this, event._doc.creator)
        }
      })
    } catch (err) {
      throw err
    }
  },

  createEvent: async args => {
    const event = new Event({
      title: args.eventInput.title,
      description: args.eventInput.description,
      price: +args.eventInput.price,
      date: new Date(args.eventInput.date),
      creator: '5c57480aaea91030abe18c8b'
    })
    console.log(args)
    let createdEvent
    try {
      const result = await event
        .save()
      createdEvent = {
        ...result._doc,
        _id: result._doc._id.toString(),
        creator: user.bind(this, result._doc.creator)
      }
      const user = await User.findById('5c57480aaea91030abe18c8b')
      if (!user) {
        throw new Error('User not found')
      }
      user.createdEvents.push(event)
      await user.save()

      return createdEvent
    } catch (err) {
      console.log(err)
      throw err
    }
    return event
  },
  createUser: args => {
    return User.findOne({
      email: args.userInput.email
    }).then(user => {
      if (user) {
        throw new Error('User already exists!')
      }
      return bcrypt
        .hash(args.userInput.password, 12)
    }).then(hashedPassword => {
      const user = new User({
        email: args.userInput.email,
        password: hashedPassword
      })
      return user.save()
    })
      .then(result => {
        return { ...result._doc, password: null, _id: result.id }
      })
      .catch(err => {
        throw err
      })
  }
}