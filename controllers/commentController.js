const asyncHandler = require("express-async-handler");
const Post = require("../models/Post");
const Comment = require("../models/Comment");

// ? add comment
exports.addComment = asyncHandler(async (req, res) => {
  const { content } = req.body;
  const postId = req.params.id;
  const post = await Post.findById(postId);
  if (!post) {
    return res.render("postDetails", {
      title: "Post",
      user: req.user,
      post,
      error: "Post not found",
      success: "",
    });
  }
  if (!content) {
    return res.render("postDetails", {
      title: "Post",
      user: req.user,
      post,
      error: "Comment cannot be empty",
      success: "",
    });
  }
  // ? save the comment
  const comment = new Comment({
    content,
    post: postId,
    author: req.user._id,
  });
  await comment.save();
  // ? push the comment to the post
  post.comments.push(comment._id);
  await post.save();
  res.redirect(`/posts/${postId}`);
});

// ? render edit comment form
exports.getEditComment = asyncHandler(async (req, res) => {
  const comment = await Comment.findById(req.params.id);
  if (!comment) {
    return res.render("postDetails", {
      title: "Post",
      user: req.user,
      post,
      error: "Comment not found",
      success: "",
    });
  }
  res.render("editComment", {
    title: "Edit Comment",
    user: req.user,
    comment,
    error: "",
    success: "",
  });
});

exports.updateComment = asyncHandler(async (req, res) => {
  const content = req.body.content;
  const comment = await Comment.findById(req.params.id);
  if (!comment) {
    return res.render("postDetails", {
      title: "Post",
      user: req.user,
      post,
      error: "Comment not found",
      success: "",
    });
  }
  if (comment.author.toString() !== req.user._id.toString()) {
    return res.render("postDetails", {
      title: "Post",
      user: req.user,
      post,
      error: "You are not authorized to update this comment",
      success: "",
    });
  }
  comment.content = content || comment.content;
  await comment.save();
  res.redirect(`/posts/${comment.post}`);
});

exports.deleteComment = asyncHandler(async (req, res) => {
  const comment = await Comment.findById(req.params.id);
  if (!comment) {
    return res.render("postDetails", {
      title: "Post",
      user: req.user,
      post,
      error: "Comment not found",
      success: "",
    });
  }
  if (comment.author.toString() !== req.user._id.toString()) {
    return res.render("postDetails", {
      title: "Post",
      user: req.user,
      post,
      error: "You are not authorized to delete this comment",
      success: "",
    });
  }

  await Comment.findByIdAndDelete(req.params.id);
  res.redirect(`/posts/${comment.post}`);
});
