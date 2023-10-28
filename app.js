require("dotenv").config()
const express = require("express");
const App = express();
const bodyParser = require("body-parser");
const userRoutes = require("./Routes/userRouter")
const userChatRoutes = require("./Routes/userChatRouter")
// const groupRoutes = require("./Routes/userGroupRouter")
const path = require("path")

// App.use(bodyParser.json())
// App.use(bodyParser.urlencoded({ extended: false }))

App.use(express.json())
App.use(express.urlencoded({ extended: false }))
App.use(express.static(path.join(__dirname, 'public')));

App.set('views', path.join(__dirname, './views'));
App.set('view engine', 'ejs')

App.get('/', function (req, res) {
    res.render('form');
});

// App.get('/', function (req, res) {
//     res.sendFile(__dirname + '/form.ejs');
// });
//-------------- .env -------------
// const dbConnect = require("./dbConfig/dbConnect");  
// dbConnect()

// const mongoose = require('mongoose');
// mongoose.connect(dbConnectUrl)
//   .then(() => console.log('Connected!')).catch((err) => {
//     console.log("not ",err);
//   })

// mongoose.connect("mongodb://127.0.01:27017/ChatApp_project", {
//     useNewUrlParser: true,
//     useUnifiedTopology: true,
// }).then((res) => {
//     console.log("Successfull database connection");
// })
//     .catch((err) => {
//         console.log(err);
//     })
// // mongoose.Promise = global.Promise; // Tell Mongoose to use ES6 promises
// mongoose.connection.on("error", (err) => {
//     console.error(`:no_entry_sign: Error → : ${err.message}`);
// });

App.use("/user", userRoutes)
App.use("/", userChatRoutes)
// App.use(groupRoutes)

module.exports = App