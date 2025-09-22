const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const userSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: [true, "Fisrt name is required"],
    trim: true,
    minLength: [3, "First name should atleast be 3 characters long"],
  },
  lastName: {
    type: String,
    required: [true, "Last name is required"],
    trim: true,
  },
  email: {
    type: String,
    required: [true, "Email is required"],
    unique: true,
    trim: true,
    lowercase: true,
    validate: {
      validator: function (v) {
        return /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(v);
      },
      message: (props) => `${props.value} is not a valid email!`,
    },
  },

  password: {
    type: String,
    required: [true, "password is required"],
    minlength: [6, "Password must be at least 6 characters long"],
  },
  role: {
    type: String,
    enum: ["admin", "faculty", "student"],
    default: "student",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// hashing middleware... password salt se hash kardiya
userSchema.pre('save', async function(next) {
  if(!this.isModified('password')) return next();
  try {
    const salt= await bcrypt.genSalt(10);
    this.password= await bcrypt.hash(this.password,salt);
    next();
  } catch (error) {
    console.error('Error hashing password:', error);
    next(error);
  }
});

// candidate password req.body se mila tha ot db ke this.password se compare kara raha hu
userSchema.methods.comparePassword= async function(candidatePassword){
  try {
    return await bcrypt.compare(candidatePassword,this.password);
  } catch (error) {
    console.error('Error comparing password:',error);
    throw error;
  }
}

const User = mongoose.model('User', userSchema);
module.exports = User;
