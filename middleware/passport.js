const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth2").Strategy;
require("dotenv").config();

const db = require("../util/database");
const collection = require("../util/collection").collection;

passport.use(
  new GoogleStrategy(
    {
      clientID:
        "323934525481-kjfv1vgg24qtrdtdjl0dbb6a0niso763.apps.googleusercontent.com", // Your Credentials here.
      clientSecret: "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", // Your Credentials here.
      callbackURL: "https://fashioncluture.ml/auth/google/callback",
      passReqToCallback: true,
    },
    async function (request, accessToken, refreshToken, profile, done) {
      return done(null, profile);
    }
  )
);

passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((user, done) => {
  done(null, user);
});
