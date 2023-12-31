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
  currentImage: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Image", // Reference to the "Image" collectio
  },
});

const User = mongoose.model("User", userSchema);
module.exports = User;
