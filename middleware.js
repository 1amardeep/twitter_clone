const requiredLogin = (req, res, next) => {
  if (req.session && req.session.user) {
    next();
  } else {
    return res.redirect("/login");
  }
};

module.exports = { requiredLogin };
