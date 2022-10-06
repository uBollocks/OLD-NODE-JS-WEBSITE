require("dotenv").config();
const passport = require("passport");
const User = require("../../models/user/user.model");
const UserService = require('../../models/user/index')
const GoogleStrategy = require("passport-google-oauth20").Strategy; 

passport.use(
  new GoogleStrategy(
    {
        clientID: "570676077282-m3et247o8e8ibs8b6n3etgh9np6tl445.apps.googleusercontent.com",
        clientSecret: "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",
        callbackURL: "https://localhost:3000/auth/google/callback",
    },
    async (accessToken, refreshToken, profile, done) => {
        const id = profile.id;
        const email = profile.emails[0].value;
        const firstName = profile.name.givenName;
        const lastName = profile.name.familyName;
        const profilePhoto = profile.photos[0].value;
        const source = "google";
  
  
        const currentUser = await UserService.getUserByEmail({ email })
  
        if (!currentUser) {
          const newUser = await UserService.addGoogleUser({
            id,
            email,
            firstName,
            lastName,
            profilePhoto
          }) 
          return done(null, newUser);
        }
  
        if (currentUser.source != "google") {
          //return error
          return done(null, false, { message: `You have previously signed up with a different signin method` });
        }
  
        currentUser.lastVisited = new Date();
        return done(null, currentUser);
      }
    )
  ); 