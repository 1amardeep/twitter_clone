const express = require("express");
const app = express();
const router = express.Router();
const Post = require("../../schemas/PostSchemas");

const User = require("../../schemas/UserSchemas");

router.get("/", async (req, res, next) => {
  try {
    const results = await Post.find()
      .populate("postedBy")
      .sort({ createdAt: -1 });
    res.status(200).send(results);
  } catch (error) {
    res.status(400).send(error);
  }
});

router.post("/", async (req, res, next) => {
  if (!req.body.content) {
    return res.status(400).send("No data");
  }
  try {
    const postedData = await Post.create({
      content: req.body.content,
      postedBy: req.session.user,
    });
    const updatedPostedData = await User.populate(postedData, {
      path: "postedBy",
    });
    res.status(201).send(updatedPostedData);
  } catch (error) {
    res.status(400).send(error);
  }
});

module.exports = router;
