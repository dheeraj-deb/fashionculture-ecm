const passport = require('passport')
const GoogleStrategy = require('passport-google-oauth2').Strategy
require('dotenv').config()

const db = require('../util/database');
const collection = require('../util/collection').collection;

passport.use(new GoogleStrategy({
    clientID: '323934525481-kjfv1vgg24qtrdtdjl0dbb6a0niso763.apps.googleusercontent.com', // Your Credentials here.
    clientSecret: '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', // Your Credentials here.
    callbackURL: "http://localhost:3000/auth/google/callback",
    passReqToCallback: true
},
    async function (request, accessToken, refreshToken, profile, done) {
        try {
            const verifyUser = await db.get().collection(collection.USER_COLLECTION).findOne({ userId: profile.id })
            if (verifyUser) {
                return done(null, profile);
            }
            const user = {
                userId: profile.id,
                f_name: profile.given_name,
                l_name: profile.family_name,
                email: profile.email
            }
            const createUser = await db.get().collection(collection.USER_COLLECTION).insertOne(user)
            console.log(createUser);
            if (createUser) {
                return done(null, profile);
            }
        } catch (error) {
        }
    }
));

passport.serializeUser((user, done) => {
    done(null, user)
})


passport.deserializeUser((user, done) => {
    done(null, user)
})