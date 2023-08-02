const jwt = require("jsonwebtoken");
function isAuthenticated(req, res, next) {
  const token = req.cookies.token;

  if (!token) {
    return res.redirect("/");
  }

  jwt.verify(token, "your_secret_key_here", (err, decoded) => {
    if (err) {
      res.clearCookie("token");
      return res.redirect("/");
    }
    req.user = decoded;
    next();
  });
}

module.exports = isAuthenticated;
