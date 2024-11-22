const localStrategy = require("passport-local").Strategy;
const bcrypt = require("bcryptjs");
const User = require("../models/User");

module.exports = function (passport) {
  passport.use(
    // ? define the local strategy for email and password
    new localStrategy(
      { usernameField: "email" },
      async (email, password, done) => {
        try {
          // ? find the user
          const user = await User.findOne({ email });
          if (!user) {
            return done(null, false, {
              message: "user not found",
            });
          }
          const isMatch = await bcrypt.compare(password, user.password);
          if (!isMatch) {
            return done(null, false, {
              message: "Incorrect Password",
            });
          }
          return done(null, user);
        } catch (error) {
          return done(error);
        }
      }
    )
  );
  // ? serializing the user to decide which key is to be kept in the cookies
  passport.serializeUser((user, done) => {
    done(null, user.id);
  });
  // ? deserializing the user from the key in the cookies
  passport.deserializeUser(async function (id, done) {
    try {
      const user = await User.findById(id);
      done(null, user);
    } catch (error) {
      done(error);
    }
  });
};
