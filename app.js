require("dotenv").config()
const express = require("express");
const App = express();
const bodyParser = require("body-parser");
const userRoutes = require("./Routes/userRouter")
const userChatRoutes = require("./Routes/userChatRouter")
const path = require("path")

// App.use(bodyParser.json())
// App.use(bodyParser.urlencoded({ extended: false }))

App.use(express.json())
App.use(express.urlencoded({ extended: false }))
App.use(express.static(path.join(__dirname, 'public')));

App.set('views', path.join(__dirname, './views'));
App.set('view engine', 'ejs')


App.use(function (req, res, next) {
    const origin = req?.headers?.origin;
    const allowedOrigins = ["http://192.168.29.45:3000", "http://localhost:3000"]
    // console.log("--->",allowedOrigins.includes(origin));
    if (allowedOrigins.includes(origin)) {
        res.setHeader('Access-Control-Allow-Origin', origin);
    } else {
        res.header("Access-Control-Allow-Origin", "http://192.168.29.45:3000");
    }
    res.header("Access-Control-Allow-Credentials", true);
    res.header("Access-Control-Allow-Methods", "GET,PATCH,PUT,POST,DELETE");
    res.header("Access-Control-Expose-Headers", "Content-Length");
    res.header(
        "Access-Control-Allow-Headers",
        "Accept, Authorization,x-auth-token, Content-Type, X-Requested-With, Range"
    );
    if (req.method === "OPTIONS") {
        return res.sendStatus(200);
    } else {
        return next();
    }
});

App.get('/', function (req, res) {
    res.render('form');
});

App.use("/user", userRoutes)
App.use("/", userChatRoutes)

module.exports = App