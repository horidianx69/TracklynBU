const Student = require("../model/Student")

exports.registerStudent = async (userId, enrollmentNumber, year, group, batch) => {
  try {
    const newStudent = new Student({
      userId,
      enrollmentNumber,
      year,
      group,
      batch
    });
    await newStudent.save();
    console.log("Student registered successfully ");

    return{
      id: newStudent._id,
      userId: newStudent.userId,
      enrollmentNumber: newStudent.enrollmentNumber,
      year: newStudent.year,
      group: newStudent.group,
      batch: newStudent.batch
    }
  } catch (error) {
    console.error("Error registering student:", error);
    throw error
  }
};