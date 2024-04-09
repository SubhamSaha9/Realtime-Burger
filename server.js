require("dotenv").config();
const express = require("express");
const app = express();
const path = require("path");
const ejs = require("ejs");
const expressLayout = require("express-ejs-layouts");
const port = process.env.PORT || 8080;
const mongoose = require('mongoose');
const session = require('express-session');
const flash = require("express-flash");
const MongoStore = require('connect-mongo');
const passport = require("passport");
const Emitter = require("events");


const url = 'mongodb://127.0.0.1:27017/pizza';
main().then((res) => {
    console.log("connected");
}).catch((err) => console.log(err));
const connection = mongoose.connection;
async function main() {
    await mongoose.connect(url);
}

const passportInit = require("./app/config/passport.js");

const store = MongoStore.create({
    mongoUrl: url,
    collection: 'sessions',
    crypto: {
        secret: process.env.SECRET,
    },
    touchAfter: 24 * 3600,
});

// event emitter
const eventEmitter = new Emitter();
app.set("eventEmitter", eventEmitter);

app.use(session({
    store: store,
    secret: process.env.COOKIE_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: {
        expires: Date.now() + 7 * 24,
        maxAge: 1000 * 3600 * 24
    }
}))


passportInit(passport);
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());
app.use(express.static("public"));
app.use(expressLayout);
app.set("views", path.join(__dirname, "/resources/views"));
app.set("view engine", "ejs");
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use((req, res, next) => {
    res.locals.session = req.session;
    res.locals.user = req.user;
    next();
})

require("./routes/web.js")(app);

const server = app.listen(port, () => {
    console.log("app is listening to port no 8080");
})

const io = require("socket.io")(server);
io.on('connection', (socket) => {
    socket.on("join", (roomName) => {
        socket.join(roomName);
    })
})

eventEmitter.on("orderUpdated", (data) => {
    io.to(`order_${data.id}`).emit("orderUpdated", data);
})

eventEmitter.on("orderPlaced", (data) => {
    io.to(`adminRoom`).emit("orderPlaced", data);
})