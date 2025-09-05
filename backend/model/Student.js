const mongoose = require("mongoose")

const studentSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  enrollmentNumber: {
    type: String,
    required: true,
    unique: true
  },
  year : {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  school: {
    type: String,
    enum: ["SCSET", "SLLB"],
  }, 
  //be careful
  projectIds: {
    type: [mongoose.Schema.Types.ObjectId],
    ref: "Project"
  }
  // this is denormalized data, i.e we are storing the same information in two places but since we need to access project information frequently for dashboard and a student rarely ever leaves a project after submitting details we can do it as this leads to fewer database queries and improved performance. But we have to careful when updating or deleting projects, as we need to ensure that the student documents are also updated accordingly and vice versa i.e when removing any project from the student's projectIds array make sure the student is removed from the project's studentIds array.

})

const Student = mongoose.model("Student", studentSchema)

module.exports = Student