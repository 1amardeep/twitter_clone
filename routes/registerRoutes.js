const express = require("express");
const app = express();
const router = express.Router();
const User = require("../schemas/UserSchemas");
const bcrypt = require("bcrypt");

app.set("view engine", "pug");
app.set("views", "views");

router.get("/", (req, res, next) => {
  res.status(200).render("register");
});

router.post("/", async (req, res, next) => {
  var firstName = req.body.firstName.trim();
  var lastName = req.body.lastName.trim();
  var userName = req.body.userName.trim();
  var email = req.body.email.trim();
  var password = req.body.password;

  var payload = req.body;

  if (firstName && lastName && userName && email && password) {
    try {
      const userExist = await User.findOne({
        $or: [{ email }, { userName }],
      });
      if (userExist == null) {
        try {
          const data = req.body;
          data.password = await bcrypt.hash(data.password, 10);
          const userData = await User.create(data);
          req.session.user = userData;
          res.redirect("/");
        } catch (error) {
          payload.errorMessage = "Something went wrong during post";
          res.status(200).render("register", payload);
        }
      } else {
        if (userName === userExist.userName) {
          payload.errorMessage = "User already exist.";
        } else {
          payload.errorMessage = "Email already exist.";
        }
        res.status(200).render("register", payload);
      }
    } catch (error) {
      payload.errorMessage = "Something went wrong";
      res.status(200).render("register", payload);
    }
  } else {
    payload.errorMessage = "Please correct your form";
    res.status(200).render("register", payload);
  }
});

module.exports = router;
