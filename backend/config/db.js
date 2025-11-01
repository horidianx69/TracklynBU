import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("DB connected");
  } catch (err) {
    console.error("Cannot connect to DB", err);
  }
};

export default connectDB;
