const isAdminAuthenticated = (req, res, next) => {
 
  if (req.session.isAdminAuthenticated) {
    res.redirect("/admin/datashBord");
  } else {
    next();
  }
};

module.exports = isAdminAuthenticated;
