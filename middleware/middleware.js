
function isAuthenticated(req, res, next) {
  const user = req.user;
  if (!user) {
    return res.redirect("/");
  }
  if(user){
    next();
  }
}

module.exports = isAuthenticated;
