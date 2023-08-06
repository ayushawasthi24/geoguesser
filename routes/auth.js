// routes.js
const axios = require('axios')
const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const passport = require('passport');
const User = require("../models/User");
const GoogleStrategy = require('passport-google-oauth2').Strategy;
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const router = express.Router();
passport.use(new GoogleStrategy({
  clientID:"372009373284-7rs18ab8cphslchjdacad0q7sh5ubl80.apps.googleusercontent.com",
  clientSecret:"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",
  callbackURL: "https://theprogrammingclubgeoguesser.onrender.com/auth/google/callback",
  passReqToCallback: true,
},
async function(request, accessToken, refreshToken, profile, done) {
  const user = await User.findOne({ email: profile.email })
  
  if(user){
    return done(null,profile);
  }
  else{
    const newUser = new User({ name:profile.displayName, email:profile.email, password:profile.id });
    await newUser.save();
    return done(null,profile);
  }
}));
passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(user, done) {
  done(null, user);
});





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
    res.render("/dashboard");
  } catch (error) {
    console.error("Error during login:", error);
    res.redirect("/login");
  }
});

module.exports = router;
