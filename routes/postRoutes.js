const express = require("express");
const app = express();
const router = express.Router();
const bcrypt = require("bcrypt");
const User = require("../schemas/UserSchemas");

router.get("/:id", (req, res, next) => {
  var payload = {
    application: "View Post",
    user: req.session.user,
    userLoggedInJs: JSON.stringify(req.session.user),
    postId: req.params.id,
  };
  res.status(200).render("postPage", payload);
});

module.exports = router;
