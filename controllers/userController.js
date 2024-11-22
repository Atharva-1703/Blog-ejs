const asyncHandler = require("express-async-handler");
const cloudinary = require("../config/cloudinary");
const User = require("../models/User");
const Post = require("../models/Post");
const File = require("../models/File");
const Comment = require("../models/Comment");

// ? get user Profile
exports.getProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select("-password");
  if (!user) {
    return res.render("login", {
      title: "Login",
      user: req.user || null,
      error: "User not found",
      success: "",
    });
  }
  // ? fetch posts
  const posts = await Post.find({ author: user._id }).sort({ createdAt: -1 });
  res.render("profile", {
    title: "Profile",
    user: req.user,
    posts,
    error: "",
    success: "",
    postCount: posts.length,
  });
});

// ? get edit form
exports.getEditUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select("-password");
  if (!user) {
    return res.render("login", {
      title: "Login",
      user: req.user || null,
      error: "User not found",
      success: "",
    });
  }
  res.render("editProfile", {
    title: "Edit Profile",
    user,
    error: "",
  });
});

// ? update user logic
exports.updateUser = asyncHandler(async (req, res) => {
  const { username, email, bio } = req.body;
  const user = await User.findById(req.user._id).select("-password");
  if (!user) {
    return res.render("login", {
      title: "Login",
      user: req.user || null,
      error: "User not found",
      success: "",
    });
  }
  user.username = username || user.username;
  user.email = email || user.email;
  user.bio = bio || user.bio;

  if (req.file) {
    if (user.profilePicture && user.profilePicture.public_id) {
      await cloudinary.uploader.destroy(user.profilePicture.public_id);
    }
  }
  const file = await File({
    url: req.file.path,
    public_id: req.file.filename,
    uploaded_by: user._id,
  });
  await file.save();
  user.profilePicture = {
    url: file.url,
    public_id: file.public_id,
  };
  await user.save();
  res.redirect("/user/profile");
});

// ? delete user logic
exports.deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  if (!user) {
    return res.render("login", {
      title: "Login",
      user: req.user || null,
      error: "User not found",
      success: "",
    });
  }
  if (user._id.toString() !== req.user._id.toString()) {
    return res.render("login", {
      title: "Login",
      user: req.user || null,
      error: "You are not authorized to delete this user",
      success: "",
    });
  }
  if (user.profilePicture && user.profilePicture.public_id) {
    await cloudinary.uploader.destroy(user.profilePicture.public_id);
  }
  const posts = await Post.find({ author: user._id });
  // ? delete posts by user
  for (const post of posts) {
    for (const image of post.images) {
      await cloudinary.uploader.destroy(image.public_id);
    }
    await Comment.deleteMany({ post: post._id });
    await Post.findByIdAndDelete(post._id);
  }
  // ? delete Comments by user
  await Comment.deleteMany({ author: user._id });

  // ? delete files by user
  const files = await File.find({ uploaded_by: user._id });

  for (const file of files) {
    await cloudinary.uploader.destroy(file.public_id);
    await File.findByIdAndDelete(file._id);
  }

  await User.findByIdAndDelete(req.user._id);
  res.redirect("/auth/register");
});
