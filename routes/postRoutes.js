const express = require("express");
const {
  getPostForm,
  createPost,
  getPosts,
  getPostDetails,
  getEditPost,
  updatePost,
  deletePost,
} = require("../controllers/postController");
const upload = require("../config/multer");
const { ensuredAuthenticated } = require("../middlewares/auth");
const postRoutes = express.Router();

// ? render the post form
postRoutes.get("/add", getPostForm);
// ? post form logic
postRoutes.post(
  "/add",
  ensuredAuthenticated,
  upload.array("images", 5),
  createPost
);

// ? fetch posts
postRoutes.get("/", getPosts);

// ? render a post
postRoutes.get("/:id", getPostDetails);

// ? render edit post form
postRoutes.get("/:id/edit", getEditPost);

// ? edit post logic
postRoutes.put(
  "/:id",
  ensuredAuthenticated,
  upload.array("images", 5),
  updatePost
);

postRoutes.delete("/:id", ensuredAuthenticated, deletePost);

module.exports = postRoutes;
