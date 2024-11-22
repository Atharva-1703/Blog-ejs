const express = require("express");
const {
  getProfile,
  getEditUser,
  updateUser,
  deleteUser,
} = require("../controllers/userController");
const userRoutes = express.Router();
const { ensuredAuthenticated } = require("../middlewares/auth");
const upload = require("../config/multer");

userRoutes.get("/profile", ensuredAuthenticated, getProfile);
userRoutes.get("/edit", ensuredAuthenticated, getEditUser);

userRoutes.post(
  "/edit",
  ensuredAuthenticated,
  upload.single("profilePicture"),
  updateUser
);

userRoutes.post("/delete", ensuredAuthenticated, deleteUser);
module.exports = userRoutes;
