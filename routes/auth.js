// routes.js

const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const router = express.Router();

const User = require("../models/User");

const loginUser = async (email, password) => {
  const user = await User.findOne({ email });

  if (!user) {
    throw new Error("User not found.");
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!isPasswordValid) {
    throw new Error("Invalid password.");
  }

  const token = jwt.sign({ email: user.email }, "your_secret_key_here", {
    expiresIn: "1h",
  });
  return token;
};

router.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!email.endsWith("@iiti.ac.in")) {
      return res.status(400).json({
        message: "Invalid email address. Please use an @iiti.ac.in email.",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ name, email, password: hashedPassword });
    await newUser.save();

    const token = await loginUser(email, password);

    res.cookie("token", token, { httpOnly: true });
    res.redirect("/dashboard");
  } catch (error) {
    console.error("Error during registration:", error);
    res.redirect("/register");
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const token = await loginUser(email, password);

    res.cookie("token", token, { httpOnly: true });
    res.redirect("/dashboard");
  } catch (error) {
    console.error("Error during login:", error);
    res.redirect("/login");
  }
});

module.exports = router;
