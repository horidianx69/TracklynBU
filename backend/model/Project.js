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

projectSchema.pre("findOneAndDelete", async function(next){
  const filter = this.getFilter(); //extracting the filter with which findOneAndDelete on Project model was called
  const projectId = filter._id //pre("findOneAndDelete") is a query middleware not document middleware, so we cant just access the id throught this._id, we have to extract it from the query

  if (projectId){
    //cascading deletes in student
    await mongoose.model("Student").updateMany(
      {projectIds : projectId}, //filter out all the students who have this projectId in their projectIds arrray
      {$pull : {projectIds : projectId}} // do this operation where you update the projectIds array and remove instance of the projectId from each Student model it was found in
    )

    //cascading deletes in faculty
    await mongoose.model("Faculty").updateMany(
      {projectIds: projectId},
      {$pull: {projectIds: projectId}}
    )
  }
  next()
})

const Project = mongoose.model("Project", projectSchema)

module.exports = Project