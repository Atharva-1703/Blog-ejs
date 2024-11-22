const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("./cloudinary");

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "Blog",
    allowedFormats: ["png", "jpg", "jpeg"],
  },
});
const upload = multer({ storage });
module.exports = upload;
