require("dotenv").config();
const express = require("express");
const app = express();
const mongoose = require("mongoose");
const methodOverride = require("method-override");
const session = require("express-session");
const passportConfig = require("./config/passport");
const passport = require("passport");
const MongoStore = require("connect-mongo");
const postRoutes = require("./routes/postRoutes");
const errorHandler = require("./middlewares/errorHandler");
const commentRoutes = require("./routes/commentRoutes");
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const PORT = process.env.PORT || 3000;

// ! middlewares
// ? urlencoded is used to parse the data from the form
app.use(express.urlencoded({ extended: true }));
app.use(
  session({
    secret: "keyboard cat",
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: process.env.MONGODB_URL,
    }),
  })
);
// ? Method override middleware
app.use(methodOverride("_method"));

// ? passport Configuration
passportConfig(passport);
app.use(passport.initialize());
app.use(passport.session());

// ! EJS
app.set("view engine", "ejs");

// ? Home Route
app.get("/", (req, res) => {
  res.render("home", { title: "Home", user: req.user, error: "" });
});

// ? authentication Routes
app.use("/auth", authRoutes);

// ? user Routes
app.use("/user", userRoutes);

// ? post routes
app.use("/posts", postRoutes);

// ? Comment Router
app.use("/", commentRoutes);

// ? error handler
app.use(errorHandler);

mongoose
  .connect(process.env.MONGODB_URL)
  .then(() => {
    console.log("Database Connected");

    app.listen(PORT, () => console.log(`Server is running`));
  })
  .catch(() => {
    console.log("Database Connection Failed");
  });
