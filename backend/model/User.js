const mongoose = require("mongoose")

//created a central user schema which can be extended by different user types

const userSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true
  },
  lastName : {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  emailVerified: {
    type: Boolean,
    default: false
  },
  role: {
    type: String,
    enum: ["student", "faculty", "admin"],
    required: true
  }
})

const User = mongoose.model("User", userSchema)

module.exports = User