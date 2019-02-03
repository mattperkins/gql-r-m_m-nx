const mongoose = require("mongoose")

const Schema = mongoose.Schema

const userSchema = new Schema({
  email: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  // mongoose methods to create relationship with Event model
  createdEvents: [
    {
      type: Schema.Types.ObjectId,
      ref: "Event"
    }
  ]
})

module.exports = mongoose.model("User", userSchema)