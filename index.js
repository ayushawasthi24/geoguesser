const express = require("express");
const bodyParser = require("body-parser");
const session = require('express-session');
const { Timer } = require('timer-node');
const cors = require("cors");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
const passport = require('passport');
const schedule = require('node-schedule');
let isJobRunning = false;
const app = express();
const Image = require("./models/Image");
app.use(session({ secret: 'cats', resave: false, saveUninitialized: true }));
app.use(passport.initialize());
app.use(passport.session());
function isAuthenticated(req, res, next) {
  req.user ? next() : res.redirect('/LoginPage');
}
const timer = new Timer({
  label: 'test-timer',
  startTimestamp: new Date(2023, 7, 6,23,59,0) // 2019-07-14 03:13:21.233Z
});
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
  passport.authenticate('google', { scope: ['email', 'profile'] }
  ));

app.get('/auth/google/callback',
  passport.authenticate('google', {
    successRedirect: '/dashboard',
    failureRedirect: '/'
  })

);




const dbURI =
  "mongodb+srv://Ayush:Ayush2003@cluster0.3gnxxme.mongodb.net/geoguesser?retryWrites=true&w=majority";
var server;
mongoose
  .connect(dbURI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log("Connected to MongoDB!");
    server = app.listen(port, () => {
      timer.start();
      console.log(`Server is running on http://localhost:${port}`);
      const scheduled_date = new Date(2023, 7, 9,23,59,0);
      console.log(scheduled_date)
      const job = schedule.scheduleJob(scheduled_date, function () {
        isJobRunning = true;
        timer.stop()
        schedule.cancelJob(job);
      });
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
 console.log(timer.time())
  res.render("login", {
    user: req.user,
    time:timer.time()
  });
});

app.get('/aboutus', (req, res) => {
  res.render('aboutus', {
    user: req.user,
    time:timer.time()
  })
})

app.get('/LoginPage', (req, res) => {
  if (!isJobRunning) {
    res.render('LoginPage', {
      user: req.user,
      time:timer.time()
    })
  }
  else {
    res.redirect('/leaderboard')
  }
}
)


app.get("/dashboard", isAuthenticated, async (req, res) => {
  if (!isJobRunning) {
    const { email } = req.user;
    const leaderboard = await User.find({ score: { $exists: true } }).sort({
      score: -1,
    });
    const user = await User.findOne({ email });
    const image = await Image.findOne({ _id: user.level });

    //get the length of data in the table Image
    const length = await Image.countDocuments();

    console.log("length",length)
    console.log("user level",user.level)
    if (user.level > length) {
      res.render("leaderboard", { leaderboard, user:req.user,time:timer.time() });
    }
    else {
      var img_url = image.path;
      var lat = image.long;
      var long = image.lat;
      res.render("dashboard", {
        user: { email },
        img_url: img_url,
        lat: lat,
        long: long,
        time:timer.time()
      });

    }
  }
  else {
    res.redirect('/leaderboard')
  }
});

app.get("/leaderboard", isAuthenticated, async (req, res) => {

  try {
    const leaderboard = await User.find({ score: { $exists: true } }).sort({
      score: -1,
    });

    res.render("leaderboard", { leaderboard, user: req.user,time:timer.time() });
  } catch (error) {
    console.error("Error fetching leaderboard:", error);
    res.redirect("dashboard", { user: req.user,time:timer.time() });
  }
}
);

app.get("/register", (req, res) => {
  res.render("register");
});

app.post("/update-score", isAuthenticated, async (req, res) => {
  if (!isJobRunning) {
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

    }
  }
  else {
    res.redirect('/leaderboard')
  }

});






app.use("/auth/logout", (req, res) => {
  if (!isJobRunning) {
    req.session.destroy();
    res.redirect("/");
  }
  else {
    res.redirect('/leaderboard')
  }

});


app.use((req, res, next) => {
  console.log(req.path)
});
