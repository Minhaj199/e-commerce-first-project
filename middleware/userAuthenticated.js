const isUserAuthenticated = (req, res, next) => {
  

  if (req.session.isUserAuthenticated) {
    res.redirect("/user");
  } else {
    next();
  }
};

module.exports = isUserAuthenticated;
