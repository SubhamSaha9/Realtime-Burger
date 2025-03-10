const LocalStratgy = require("passport-local").Strategy;
const bcrypt = require("bcrypt");
const User = require("../models/user");

function init(passport) {
    passport.use(new LocalStratgy({ usernameField: "email" }, async (email, password, done) => {
        const user = await User.findOne({ email: email });
        if (!user) {
            return done(null, false, { message: "No user found with this email!" });
        }

        bcrypt.compare(password, user.password).then(match => {
            if (match) {
                return done(null, user, { message: "Logged in succesfully" });
            }
            return done(null, false, { message: "Wrong username or password" });
        }).catch(err => {
            return done(null, false, { message: "Something went wrong!" });

        })
    }));

    passport.serializeUser((user, done) => {
        done(null, user._id);
    });
    passport.deserializeUser((id, done) => {
        User.findById(id)
            .then(user => {
                done(null, user);
            }).catch(err => {
                done(err, null);
            });
    });
}

module.exports = init;