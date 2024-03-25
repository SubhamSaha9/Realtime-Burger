const express = require("express");
const app = express();
const path = require("path");
const ejs = require("ejs");
const expressLayout = require("express-ejs-layouts");
const port = process.env.PORT || 8080;

app.use(express.static("public"));
app.use(expressLayout);
app.set("views", path.join(__dirname, "/resources/views"));
app.set("view engine", "ejs");

app.get("/", (req, res) => {
    res.render("home.ejs");
})
app.get("/cart", (req, res) => {
    res.render("customers/cart.ejs");
})
app.get("/login", (req, res) => {
    res.render("auth/login.ejs");
})
app.get("/register", (req, res) => {
    res.render("auth/register.ejs");
})

app.listen(port, () => {
    console.log("app is listening to port no 8080");
})