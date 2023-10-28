const mongoose = require("mongoose");
const dbConnectUrl = process.env.MONGODB_CONNECTION

function dbConnect() {
    // mongoose.connect(dbConnectUrl, (err) => {
    //     if (!err) {
    //         return console.log('MongoDB Connection Succeeded.')
    //     } else {
    //         return console.log('Error in DB connection: ' + err)
    //     }
    // })
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

// const dbConnect = () => {
//     try {
//         mongoose.connect(dbConnectUrl)
//         console.log('MongoDB connected')
//     } catch (error) {
//         console.log(error)
//     }
// }
module.exports = dbConnect

// (err) => {
//     if (!err) {
//         return console.log('MongoDB Connection Succeeded.')
//     } else {
//         return console.log('Error in DB connection: ' + err)
//     }
// }