const AdminAuthenticated = (req, res, next) => {
  if (req.session.isAdminAuthenticated) {
    next();
  } else {
    res.redirect("/admin");
  }
};

module.exports = AdminAuthenticated;
