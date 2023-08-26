const express = require("express");
const app = express();
const router = express.Router();
const Post = require("../../schemas/PostSchemas");

const User = require("../../schemas/UserSchemas");

router.put("/:profileId/follow", async (req, res, next) => {
  const profileId = req.params.profileId;
  var loggedInUserId = req.session.user._id;

  var userProfile = await User.findById(profileId);
  if (userProfile == null) {
    return res.sendStatus(404);
  }

  var isFollowing =
    userProfile.followers && userProfile.followers.includes(loggedInUserId);

  var option = isFollowing ? "$pull" : "$addToSet";

  try {
    req.session.user = await User.findByIdAndUpdate(
      loggedInUserId,
      { [option]: { following: profileId } },
      { new: true } // this will set user to new value after update
    );

    var updatedProfile = await User.findByIdAndUpdate(profileId, {
      [option]: { followers: loggedInUserId },
    });
    res.status(200).send(req.session.user);
  } catch (error) {
    res.status(400).send(error);
  }
});

router.get("/:profileId/following", async (req, res, next) => {
  const profileId = req.params.profileId;
  try {
    var result = await User.findById(profileId).populate({
      model: "User",
      path: "following",
    });
    res.status(200).send({ following: result.following });
  } catch (error) {
    res.status(400).send(error);
  }
});

router.get("/:profileId/followers", async (req, res, next) => {
  const profileId = req.params.profileId;
  try {
    var result = await User.findById(profileId).populate({
      model: "User",
      path: "followers",
    });
    res.status(200).send({ followers: result.followers });
  } catch (error) {
    res.status(400).send(error);
  }
});

module.exports = router;
