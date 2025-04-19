const isUserAuthenticatedRestricted = (req, res, next) => {


  if (req.session.isUserAuthenticated) {
    
    next();
  } else {
    console.log(8)
    res.redirect("/user/log-in");
  }
};

module.exports = isUserAuthenticatedRestricted;
