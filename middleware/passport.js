const passport = require("passport");
const User = require("../models/user");
const FacebookStrategy = require("passport-facebook").Strategy;

passport.use(
  new FacebookStrategy(
    {
      clientID: "YOUR_FACEBOOK_APP_ID",
      clientSecret: "YOUR_FACEBOOK_APP_SECRET",
      callbackURL: "YOUR_CALLBACK_URL",
      profileFields: ["id", "displayName", "email"],
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        // Check if the user is already registered
        const user = await User.findOne({ _id: profile.id });

        if (user) {
          // User is already registered, generate JWT token
          const token = jwt.sign({ userId: user._id.toString() }, "somesupersecret", {
            expiresIn: "1h",
          });

          // Save the token to the database
          user.loginToken = token;
          user.loginTokenExpiration = Date.now() + 60 * 60 * 1000;
          await user.save();

          return done(null, user);
        } else {
          // User is not registered, you can choose to handle this case differently
          return done(null, false, { message: "User not registered!" });
        }
      } catch (error) {
        return done(error);
      }
    }
  )
);
