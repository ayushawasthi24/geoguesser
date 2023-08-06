const express = require("express");
const bodyParser = require("body-parser");
const session = require('express-session');
const cors = require("cors");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
const passport = require('passport');
const app = express();
const Image = require("./models/Image");
app.use(session({ secret: 'cats', resave: false, saveUninitialized: true }));
app.use(passport.initialize());
app.use(passport.session());
function isAuthenticated(req, res, next) {
  req.user ? next() : res.redirect('/LoginPage');
}
const port = process.env.PORT || 3000;

const corsConfig = {
  credentials: true,
};

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors(corsConfig));
app.use(cookieParser());
app.set("view engine", "ejs");
app.set("views", __dirname + "/views");
app.use(express.static(__dirname + "/public"));


app.get('/auth/google',
  passport.authenticate('google', { scope: [ 'email', 'profile' ] }
));

app.get( '/auth/google/callback',
  passport.authenticate( 'google', {
    successRedirect: '/dashboard',
    failureRedirect: '/'
  })
);




const dbURI =
  "mongodb+srv://Ayush:Ayush2003@cluster0.3gnxxme.mongodb.net/geoguesser?retryWrites=true&w=majority";

mongoose
  .connect(dbURI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log("Connected to MongoDB!");
    app.listen(port, () => {
      console.log(`Server is running on http://localhost:${port}`);
    });
  })
  .catch((error) => {
    console.error("Error connecting to MongoDB:", error);
    process.exit(1);
  });

const User = require("./models/User");

const authRoutes = require("./routes/auth");


app.use(authRoutes);

app.get("/", (req, res) => {
  res.render("login",{
    user: req.user
  });
});

app.get('/aboutus',(req,res)=>{
  res.render('aboutus',{
    user: req.user
  })
})

app.get('/LoginPage',(req,res)=>{
  res.render('LoginPage',{
    user: req.user
  })
}
)


app.get("/dashboard", isAuthenticated, async (req, res) => {
  console.log('user',req.user)
  const { email } = req.user;
  const leaderboard = await User.find({ score: { $exists: true } }).sort({
    score: -1,
  });
  const user = await User.findOne({ email });
  const image = await Image.findOne({ _id: user.level });
  console.log(image)
  //get the length of data in the table Image
  const length = await Image.countDocuments();


  if(user.level===length+1){
    res.render("leaderboard", { leaderboard,user:req.user });
  }
  else{
    var img_url = image.path;
    var lat = image.long;
    var long = image.lat;
    res.render("dashboard", {
      user: { email },
      img_url: img_url,
      lat: lat,
      long: long,
    });

  }
});

app.get("/leaderboard", isAuthenticated, async (req, res) => {
  try {
    const leaderboard = await User.find({ score: { $exists: true } }).sort({
      score: -1,
    });
    console.log(req.user);
    res.render("leaderboard", { leaderboard,user:req.user });
  } catch (error) {
    console.error("Error fetching leaderboard:", error);
    res.redirect("dashboard",{user:req.user});
  }
});

app.get("/register", (req, res) => {
  res.render("register");
});

app.post("/update-score", isAuthenticated, async (req, res) => {
  try {
    let { score } = req.body;
    const { email } = req.user;
    const user = await User.findOne({ email });
    user.score += Math.round(score);
    user.level += 1;
    await user.save();
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    res.redirect('/dashboard')
  } catch (error) {
    console.log(error);
  }
});

app.use("/auth/logout", (req, res) => {
  req.session.destroy();
  res.redirect("/");
});