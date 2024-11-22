const passport = require("passport");
const User = require("../models/User");
const bcrypt = require("bcryptjs");
const asyncHandler = require("express-async-handler");
// ?render login
exports.getLogin = asyncHandler((req, res) => {
  res.render("login", {
    title: "Login",
    user: req.user || null,
    error: "",
  });
});

// ? Login Logic
exports.login = asyncHandler(async (req, res, next) => {
  passport.authenticate("local", (err, user, info) => {
    if (err) {
      return next(err);
    }
    if (!user) {
      return res.render("login", {
        title: "Login",
        user: req.user || null,
        error: info.message,
      });
    }
    req.logIn(user, (err) => {
      if (err) {
        return next(err);
      }
      return res.redirect("/user/profile");
    });
  })(req, res, next);
});

// ?render register
exports.getRegister = asyncHandler((req, res) => {
  res.render("register", { title: "Register", user: req.user, error: "" });
});

// ? register Logic
exports.register = asyncHandler(async (req, res) => {
  const { username, email, password } = req.body;
  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.render("register", {
        title: "Register",
        user: req.user,
        error: "User already exists",
      });
    }
    // ? Hash the user Password
    const hashedPassword = await bcrypt.hash(password, 10);
    // ? save user
    const user = await User.create({
      username,
      email,
      password: hashedPassword,
    });
    res.redirect("/auth/login");
  } catch (error) {
    res.render("register", {
      title: "Register",
      user: req.user,
      error: error.message,
    });
  }
});

// ? logout logic
exports.logout = asyncHandler((req, res) => {
  req.logout((err) => {
    if (err) {
      return next(err);
    }
    res.redirect("/auth/login");
  });
});
