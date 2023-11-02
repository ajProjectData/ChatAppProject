const mongoose = require("mongoose");

const otpSchema = new mongoose.Schema({
    otp:{
        type:String,
        require:true
    },
    mobileNo:{
        type:String,
        // ref:'user'   
    },
    otpExpire: {
        type: Date
    }
},{
    timestamps:true
});

const otpModel = mongoose.model("otp", otpSchema)
module.exports = otpModel
