const mongoose = require("mongoose");

const userSchema = mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  score: {
    type: Number,
    default: 0,
  },
  level: {
    type: Number,
    default: 1,
  },
  currentImage:{
    type: String,
    default:JSON.stringify({id:1,path:'22.5191713, 75.9198246.jpg',long:22.5191713,lat:75.9198246}),
  }
});

const User = mongoose.model("User", userSchema);
module.exports = User;
