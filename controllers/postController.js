const asyncHandler = require("express-async-handler");
const cloudinary = require("../config/cloudinary");
const Post = require("../models/Post");
const File = require("../models/File");

// ? render post adding form
exports.getPostForm = asyncHandler((req, res) => {
  res.render("newPost", {
    title: "New Post",
    user: req.user,
    error: "",
    success: "",
  });
});

// ? creating post logic
exports.createPost = asyncHandler(async (req, res) => {
  const { title, content } = req.body;
  // ? if no image provided
  // if (!req.files || req.files.length === 0) {
  //   return res.render("newPost", {
  //     title: "New Post",
  //     user: req.user,
  //     error: "No image provided",
  //     success: "",
  //   });
  // }
  const images = await Promise.all(
    req.files.map(async (file) => {
      const newFile = new File({
        url: file.path,
        public_id: file.filename,
        uploaded_by: req.user._id,
      });
      await newFile.save();
      // console.log(newFile);

      return {
        url: newFile.url,
        public_id: newFile.public_id,
      };
    })
  );
  // ? create the post
  const post = new Post({
    title,
    content,
    author: req.user._id,
    images,
  });
  await post.save();
  res.render("newPost", {
    title: "New Post",
    user: req.user,
    success: "Post created successfully",
    error: "",
  });
});

// ? get all posts
exports.getPosts = asyncHandler(async (req, res) => {
  const posts = await Post.find().populate("author").sort({ createdAt: -1 });
  res.render("posts", {
    title: "Posts",
    user: req.user,
    posts,
    error: "",
    success: "",
  });
});

// ? get post by id
exports.getPostDetails = asyncHandler(async (req, res) => {
  const post = await Post.findById(req.params.id)
    .populate("author", "username")
    .populate({
      path: "comments",
      populate: {
        path: "author",
        model: "User",
        select: "username",
      },
    });
  // console.log(post);

  res.render("postDetails", {
    title: "Post",
    user: req.user,
    post,
    error: "",
    success: "",
  });
});

// ? render edit post
exports.getEditPost = asyncHandler(async (req, res) => {
  const post = await Post.findById(req.params.id);
  if (!post) {
    return res.render("postDetails", {
      title: "Post",
      user: req.user,
      post,
      error: "Post not found",
      success: "",
    });
  }
  res.render("editPost", {
    title: "Edit Post",
    user: req.user,
    post,
    error: "",
    success: "",
  });
});

exports.updatePost = asyncHandler(async (req, res) => {
  const { title, content } = req.body;
  // console.log(req.body);

  // ? find the post
  const post = await Post.findById(req.params.id);
  // console.log(post);

  if (!post) {
    return res.render("postDetails", {
      title: "Post",
      user: req.user,
      post,
      error: "Post not found",
      success: "",
    });
  }
  // ? update the post if exists
  if (post.author.toString() !== req.user._id.toString()) {
    // console.log("hwllo");

    return res.render("postDetails", {
      title: "Post",
      user: req.user,
      post,
      error: "You are not authorized to update this post",
      success: "",
    });
  }

  post.title = title || post.title;
  post.content = content || post.content;

  console.log(post);

  if (req.files) {
    const images = await Promise.all(
      post.images.map(async (image) => {
        await cloudinary.uploader.destroy(image.public_id);
      })
    );
  }
  post.images = await Promise.all(
    req.files.map(async (file) => {
      const newFile = new File({
        url: file.path,
        public_id: file.filename,
        uploaded_by: req.user._id,
      });
      await newFile.save();
      return {
        url: newFile.url,
        public_id: newFile.public_id,
      };
    })
  );
  await post.save();
  res.redirect(`/posts/${post._id}`);
});

// ? delete post logic
exports.deletePost = asyncHandler(async (req, res) => {
  const post = await Post.findById(req.params.id);
  if (!post) {
    return res.render("postDetails", {
      title: "Post",
      user: req.user,
      post,
      error: "Post not found",
      success: "",
    });
  }

  if (post.author.toString() !== req.user._id.toString()) {
    return res.render("postDetails", {
      title: "Post",
      user: req.user,
      post,
      error: "You are not authorized to delete this post",
      success: "",
    });
  }

  await Promise.all(
    post.images.map(async (image) => {
      await cloudinary.uploader.destroy(image.public_id);
    })
  );

  await Post.findByIdAndDelete(req.params.id);
  res.redirect("/posts");
});
