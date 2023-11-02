const mongoose = require("mongoose");
const dbConnectUrl = process.env.MONGODB_CONNECTION

function dbConnect() {
    mongoose.connect(dbConnectUrl, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    }).then((res) => {
        console.log("Successfull database connection");
    })
        .catch((err) => {
            console.log("Wait connection.....");
            console.log(err);
        })
}

module.exports = dbConnect
