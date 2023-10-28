const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    profilePhoto: {
        type: String
    },
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    mobileNo: {
        type: String,
        required: true,
        min: 10,
        max: 10
    },
    password: {
        type: String,
        required: true
    }
}, {
    timestamps: true
})

const userModel = mongoose.model("user", userSchema)
module.exports = userModel

