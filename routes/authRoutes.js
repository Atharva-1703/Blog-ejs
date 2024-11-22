const express = require("express");
const {
  getLogin,
  getRegister,
  register,
  login,
  logout,
} = require("../controllers/authController");

const authRoutes = express.Router();

authRoutes.get("/login", getLogin);
authRoutes.get("/register", getRegister);
authRoutes.get("/logout", logout);

authRoutes.post("/register", register);

authRoutes.post("/login", login);

module.exports = authRoutes;
