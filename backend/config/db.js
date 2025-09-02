const mongoose = require("mongoose");
require("dotenv").config();

const connectDB = async () => {
  await mongoose
    .connect(process.env.MONGO_URI)
    .then(() => console.log("DB connected"))
    .catch((err) => console.log("Cannot connect to DB", err));
};

module.exports = connectDB;