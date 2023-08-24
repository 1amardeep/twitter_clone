const express = require("express");
const app = express();
const router = express.Router();
const bcrypt = require("bcrypt");
const User = require("../schemas/UserSchemas");

router.get("/", (req, res, next) => {
  var payload = {
    application: req.session.user.userName,
    user: req.session.user,
    userLoggedInJs: JSON.stringify(req.session.user),
    profileUser: req.session.user,
  };
  res.status(200).render("profilePage", payload);
});

router.get("/:userName", async (req, res, next) => {
  var payload = await getPayload(req.params.userName, req.session.user);
  res.status(200).render("profilePage", payload);
});

router.get("/:userName/replies", async (req, res, next) => {
  var payload = await getPayload(req.params.userName, req.session.user);
  payload.selectedTab = "replies";
  res.status(200).render("profilePage", payload);
});

async function getPayload(userName, userLoggedIn) {
  var user = await User.findOne({ userName });
  if (user == null) {
    user = await User.findById({ userName });
    if (user == null) {
      return {
        application: "User not found",
        user: userLoggedIn,
        userLoggedInJs: JSON.stringify(userLoggedIn),
        profileUser: user,
      };
    }
  }

  return {
    application: user.userName,
    user: userLoggedIn,
    userLoggedInJs: JSON.stringify(user),
    profileUser: user,
  };
}

module.exports = router;
