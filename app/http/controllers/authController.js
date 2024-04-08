const passport = require("passport");
const User = require("../../models/user");
const bcrypt = require("bcrypt");

const authController = () => {
    const _getRedirectUrl = (req) => {
        return req.user.role === 'admin' ? '/admin/orders' : '/customer/orders'
    }
    return {
        login(req, res) {
            res.render("auth/login.ejs");
        },
        postLogin(req, res, next) {
            const { email, password } = req.body;
            if (!email || !password) {
                req.flash("error", "All fields are required!");
                return res.redirect("/login");
            }
            passport.authenticate("local", (err, user, info) => {
                if (err) {
                    req.flash("error", info.message);
                    return next(err);
                }
                if (!user) {
                    req.flash("error", info.message);
                    return res.redirect("/login");
                }

                req.logIn(user, (err) => {
                    if (err) {
                        req.flash("error", info.message);
                        return next(err);
                    }

                    return res.redirect(_getRedirectUrl(req));
                })
            })(req, res, next)
        },
        register(req, res) {
            res.render("auth/register.ejs");
        },
        async postRegister(req, res) {
            const { name, email, password } = req.body;
            if (!name || !email || !password) {
                req.flash("error", "All fields are required!");
                req.flash("name", name);
                req.flash("email", email);
                return res.redirect("/register");
            }

            User.exists({ email: email }).then(result => {
                if (result) {
                    req.flash("error", "This email is already taken.");
                    req.flash("name", name);
                    req.flash("email", email);
                    return res.redirect("/register");
                }
            });

            const hashedPass = await bcrypt.hash(password, 10);

            const user = new User({
                name: name,
                email: email,
                password: hashedPass
            })
            const newUser = await user.save().then((user) => {
                return res.redirect("/");
            }).catch(err => {
                req.flash("error", "Something went wrong!!");
                return res.redirect("/register");
            })
        },
        logout(req, res) {
            req.logout(err => {
                if (err) {
                    console.log(err);
                    return;
                }
                return res.redirect("/login");
            });
        }
    }
}
module.exports = authController;