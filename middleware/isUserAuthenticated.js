const isUserAuthenticatedRestricted = (req, res, next) => {


  if (req.session.isUserAuthenticated) {
    
    next();
  } else {
    res.redirect("/user/log-in");
  }
};

module.exports = isUserAuthenticatedRestricted;
