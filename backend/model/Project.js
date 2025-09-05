const mongoose = require('mongoose')

const projectSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
  },
  facultyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Faculty",
    required: true
  },
  studentIds: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Student",
    required: true
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
})

const Project = mongoose.model("Project", projectSchema)

module.exports = Project