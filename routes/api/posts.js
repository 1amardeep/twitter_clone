const express = require("express");
const app = express();
const router = express.Router();
const Post = require("../../schemas/PostSchemas");

const User = require("../../schemas/UserSchemas");

router.get("/", async (req, res, next) => {
  try {
    const posts = await getPosts();
    res.status(200).send(posts);
  } catch (error) {
    res.status(400).send(error);
  }
});

router.get("/:id", async (req, res, next) => {
  const postId = req.params.id;
  try {
    const posts = await getPosts({ _id: postId });
    res.status(200).send(posts[0]);
  } catch (error) {
    res.status(400).send(error);
  }
});

const getPosts = async (query = {}) => {
  try {
    const results = await Post.find(query)
      .populate("retweetData postedBy replyTo")
      .sort({ createdAt: -1 });
    const results_intermediate = await User.populate(results, {
      path: "replyTo.postedBy",
    });
    const results_intermediate2 = await User.populate(results_intermediate, {
      path: "retweetData.postedBy",
    });

    const result_intermediate3 = await Post.populate(results_intermediate2, {
      path: "retweetData.replyTo",
    });

    return await User.populate(result_intermediate3, {
      path: "retweetData.replyTo.postedBy",
    });
  } catch (error) {
    throw error;
  }
};

router.post("/", async (req, res, next) => {
  if (!req.body.content) {
    return res.status(400).send("No data");
  }

  var postData = {
    content: req.body.content,
    postedBy: req.session.user,
  };

  if (req.body.replyTo) {
    postData.replyTo = req.body.replyTo;
  }

  try {
    const postedData = await Post.create(postData);

    const updatedPostedData = await User.populate(postedData, {
      path: "postedBy",
    });
    res.status(201).send(updatedPostedData);
  } catch (error) {
    res.status(400).send(error);
  }
});

router.put("/:id/like", async (req, res, next) => {
  var postId = req.params.id;
  var userId = req.session.user._id;

  var isLikes =
    req.session.user.likes && req.session.user.likes.includes(postId);

  var option = isLikes ? "$pull" : "$addToSet";

  // insert user likes - here square is used which is funny to set var value declared on top
  // insert post likes
  try {
    req.session.user = await User.findByIdAndUpdate(
      userId,
      { [option]: { likes: postId } },
      { new: true } // this will set user to new value after update
    );
    var updatedPost = await Post.findByIdAndUpdate(
      postId,
      { [option]: { likes: userId } },
      { new: true } // this will set updated post
    );
    res.status(201).send(updatedPost);
  } catch (error) {
    res.status(400).send(error);
  }
});

router.post("/:id/retweet", async (req, res, next) => {
  var postId = req.params.id;
  var userId = req.session.user._id;

  //Try and Delete
  try {
    var deletePost = await Post.findOneAndDelete({
      postedBy: userId,
      retweetData: postId,
    });
  } catch (error) {
    res.send(400).send("failed to find and delete");
  }

  var option = deletePost !== null ? "$pull" : "$addToSet";
  var rePost = deletePost;

  if (rePost === null) {
    try {
      rePost = await Post.create({
        // content: rePost.content,
        postedBy: userId,
        retweetData: postId,
      });
    } catch (error) {
      res.status(400).send(error);
    }
  }

  try {
    req.session.user = await User.findByIdAndUpdate(
      userId,
      { [option]: { retweetPosts: rePost._id } },
      { new: true } // this will set user to new value after update
    );
    var updatedPost = await Post.findByIdAndUpdate(
      postId,
      { [option]: { retweetUsers: userId } },
      { new: true } // this will set updated post
    );
    res.status(201).send(updatedPost);
  } catch (error) {
    res.status(400).send(error);
  }
});

module.exports = router;
