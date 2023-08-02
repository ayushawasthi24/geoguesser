const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
const app = express();
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

const dbURI =
  "mongodb+srv://Ayush:Ayush2003@cluster0.3gnxxme.mongodb.net/geoguesser?retryWrites=true&w=majority"; // Replace with your MongoDB URL and database name
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
const isAuthenticated = require("./middleware/middleware");

app.use(authRoutes);

app.get("/", (req, res) => {
  res.render("login");
});

app.get("/dashboard", isAuthenticated, async (req, res) => {
  const { email } = req.user;
  const leaderboard = await User.find({ score: { $exists: true } }).sort({
    score: -1,
  });
  res.render("dashboard", { user: { email } });
});

app.get("/leaderboard", isAuthenticated, async (req, res) => {
  try {
    const leaderboard = await User.find({ score: { $exists: true } }).sort({
      score: -1,
    });

    res.render("leaderboard", { leaderboard });
  } catch (error) {
    console.error("Error fetching leaderboard:", error);
    res.redirect("dashboard");
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
    res.redirect("dashboard");
  } catch (error) {
    console.log(error);
  }
});

app.post("/logout", (req, res) => {
  res.clearCookie("token");
  res.redirect("/");
});
