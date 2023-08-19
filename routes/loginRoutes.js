const express = require("express");
const app = express();
const router = express.Router();
const bcrypt = require("bcrypt");
const User = require("../schemas/UserSchemas");

app.set("view engine", "pug");
app.set("views", "views");

router.get("/", (req, res, next) => {
  res.status(200).render("login");
});

router.post("/", async (req, res, next) => {
  var payload = req.body;
  const email = payload.logUsername;
  const userName = payload.logUsername;

  if (req.body.logUsername && req.body.logPassword) {
    try {
      const userExist = await User.findOne({
        $or: [{ email }, { userName }],
      });
      if (userExist !== null) {
        var result = await bcrypt.compare(
          req.body.logPassword,
          userExist.password
        );
        if (result === true) {
          req.session.user = userExist;
          res.redirect("/");
        } else {
          payload.errorMessage = "Wrong user name and password";
          res.status(200).render("login", payload);
        }
      }
    } catch (error) {
      payload.errorMessage = "Something went wrong during login";
      res.status(200).render("login", payload);
    }
  }
  res.status(200).render("login");
});

module.exports = router;
