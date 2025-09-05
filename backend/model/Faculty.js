const mongoose = require("mongoose")

const facultySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  projectIds: {
    type: [mongoose.Schema.Types.ObjectId],
    ref: "Project"
  }

})

const Faculty = mongoose.model("Faculty", facultySchema)

module.exports = Faculty
