const express = require("express");
const commentRoutes = express.Router();
const { ensuredAuthenticated } = require("../middlewares/auth");
const {
  addComment,
  getEditComment,
  updateComment,
  deleteComment,
} = require("../controllers/commentController");

// ? add comment
commentRoutes.post("/posts/:id/comments", ensuredAuthenticated, addComment);

// ? edit comment
commentRoutes.get("/comments/:id/edit", getEditComment);

// ? update comment
commentRoutes.put("/comments/:id", ensuredAuthenticated, updateComment);

// ? delete comment
commentRoutes.delete("/comments/:id", ensuredAuthenticated, deleteComment);

module.exports = commentRoutes;
