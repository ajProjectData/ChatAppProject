const userModel = require("../Model/userSchema");
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")
const joi = require("../joiValidation/joiValidator");
const otpModel = require("../Model/otpSchema")
const userChatModel = require("../Model/userChatSchema")
const generateToken = require("../jwt/tokenGenerate")
const fs = require("fs")
const faker = require("faker")

// const redisClient = require("../redisConnect")
// redisClient.setEx("surName", 30, JSON.stringify("hello"))
/* ---------- faker Api ---------- */
exports.test = async (req, res) => {
    try {
        // res.send("abc")

        var numEntries = 1020
        let userRegister = []
        var user
        for (let i = 0; i < numEntries; i++) {
            console.log("userAdd(i)--->", i);
            var name = faker.name.findName()
            var password = `${name.replace(/ /g, '')}@123`
            var bpass = await bcrypt.hash(password, 10)
            user = await userModel.create({
                profilePhoto: faker.image.image(),
                name: name,
                email: faker.internet.email(name),
                mobileNo: faker.phone.phoneNumber('##########'),
                password: bpass
            });
            userRegister.push(user)
            // user.save();
        }
        res.status(200).json({
            status: true,
            userRegister
        })
        // console.log("--->", user);

    } catch (error) {
        console.error("==>", error);
        res.status(500).json({
            error: error.message
        })
    }
}
/* ----------------------------- */

exports.signUp = async (req, res, next) => {
    try {
        // data = await redisClient.hGetAll("userRegister")
        // console.log("-->", JSON.parse(JSON.stringify(data)));

        // console.log("body--->", req.body);
        // console.log("file--->", req.file);
        const validateResult = await joi.signUp.validateAsync(req.body)

        const findEmail = await userModel.findOne({ email: validateResult?.email })
        if (findEmail) return res.status(201).json({ message: "Email Already Exist" })

        const findMobileNo = await userModel.findOne({ mobileNo: validateResult?.mobileNo })
        if (findMobileNo) return res.status(201).json({ message: "This Mobile Number Already Exist" })

        const profilePhoto = req.file.filename
        // console.log("===>",);

        const bpass = await bcrypt.hash(validateResult?.password, 10)

        const userRegister = await userModel.create({
            name: validateResult?.name,
            email: validateResult?.email,
            mobileNo: validateResult?.mobileNo,
            password: bpass,
            profilePhoto: profilePhoto,
        })

        // await redisClient.hSet("userRegister", `'${userRegister._id}'`, JSON.stringify(userRegister))

        res.status(200).send({
            status: true,
            userRegister
        })

    } catch (error) {
        console.error("==>", error);
        res.status(500).json({
            error: error.message
        })
    }
}

exports.loginSendOtp = async (req, res, next) => {
    try {
        const validateResult = await joi.login.validateAsync(req.body)
        console.log("--->", validateResult);

        const findMobileNo = await userModel.findOne({ mobileNo: validateResult?.mobileNo })
        if (!findMobileNo) return res.status(201).json({ message: "Mobile Number Is Not Found" })

        let passCheck = await bcrypt.compare(validateResult?.password, findMobileNo?.password)
        if (passCheck === false) return res.status(404).json({ message: "Password Is Not Match" })

        const token = generateToken(findMobileNo)

        let sendOtp
        const otpGenerate = Math.floor(100000 + Math.random() * 900000);

        const otpUserFind = await otpModel.findOne({ mobileNo: findMobileNo.mobileNo })
        if (otpUserFind) {
            sendOtp = await otpModel.findByIdAndUpdate(otpUserFind._id, {
                $set: { otp: otpGenerate }
            }, { new: true })
        } else {
            sendOtp = await otpModel.create({
                otp: otpGenerate,
                mobileNo: findMobileNo.mobileNo
            })
        }

        res.status(200).json({
            status: "OTP Send SuccessFully",
            token,
            sendOtp
        })
    } catch (error) {
        console.error("error==>", error.message);
        // console.error("==>", error.details[0].message);
        res.status(500).json({
            error: error.message
        })
    }
}

exports.addOtpUserLogin = async (req, res, next) => {
    try {
        const validateResult = await joi.otp.validateAsync(req.body)

        const findMobileNo = await userModel.findOne({ mobileNo: validateResult?.mobileNo })
        if (!findMobileNo) return res.status(201).json({ message: "Mobile Number Is Not Found" })

        let checkUser = await otpModel.findOne({ mobileNo: findMobileNo?.mobileNo })

        if (checkUser.mobileNo !== validateResult.mobileNo) {
            return res.status().json({ message: "Please Enter Correct Mobile Number" })
        }
        if (checkUser?.otp !== validateResult.otp) return res.status(401).json({ message: "Please Enter Correct OTP" });

        const userLogin = await otpModel.aggregate([
            {
                $match: {
                    otp: validateResult.otp
                }
            },
            {
                $lookup: {
                    from: "users",
                    localField: "mobileNo",
                    foreignField: "mobileNo",
                    as: "userLogin"
                }
            },
            {
                $project: {
                    _id: 0,
                    userLogin: { $first: "$userLogin" }
                }
            }
        ])

        res.status(200).json({
            status: "OTP Match SuccessFully",
            message: "User Login SuccessFully",
            userLogin: userLogin[0]?.userLogin
        })

        await otpModel.findByIdAndDelete(checkUser?._id)

    } catch (error) {
        console.error("==>", error);
        res.status(500).json({
            error: error.message
        })
    }
}

exports.userDetailsUpdate = async (req, res, next) => {
    try {
        const userId = req.params.userId
        const validateResult = await joi.userProfileUpdate.validateAsync(req.body)

        const findUser = await userModel.findById(userId)
        if (!findUser) return res.status(201).json({ message: "User Is Not Found" })

        if (findUser?.email !== validateResult?.email) {
            return res.status(404).json({ message: "Email is Not Match" })
        }

        // let findEmail
        // if (findUser?.email !== validateResult?.email) {
        //     findEmail = await userModel.findOne({ email: validateResult?.email })
        // }
        // if (findEmail) return res.status(404).json({message:"This Email is Already Used"})

        let findMobileNo
        console.log("findMobileNo1===>", findMobileNo);
        console.log(findUser?.mobileNo != validateResult?.mobileNo);
        if (findUser?.mobileNo !== validateResult?.mobileNo) {
            findMobileNo = await userModel.findOne({ mobileNo: validateResult?.mobileNo })
            console.log("findMobileNo2===>", findMobileNo);
        }
        if (findMobileNo) return res.status(404).json({ message: "This Mobile Number is Already Used" })
        console.log("findMobileNo3===>", findMobileNo);


        let profilePhoto = req?.file?.filename
        console.log("profilePhoto===>", profilePhoto);

        if (profilePhoto !== undefined && fs.existsSync(`profilePhoto/${findUser.profilePhoto}`)) {
            fs.unlinkSync(`profilePhoto/${findUser.profilePhoto}`)
        }
        console.log("findUser==>", findUser);
        console.log("req?.file===>", req?.file);

        const detailsUpdate = await userModel.findByIdAndUpdate(findUser._id,
            {
                // $set:{
                name: validateResult?.name,
                email: validateResult.email,
                // password: validateResult.password,
                mobileNo: validateResult.mobileNo,
                profilePhoto: profilePhoto
                // }
            },
            { new: true }
        )

        res.status(200).json({
            status: true,
            detailsUpdate
        })

    } catch (error) {
        console.error("==>", error);
        res.status(500).json({
            error: error.message
        })
    }
}

exports.forgetPassword = async (req, res, next) => {
    try {

        const validateResult = await joi.forgetPass.validateAsync(req.body)

        const findMobileNo = await userModel.findOne({ mobileNo: validateResult?.mobileNo })
        if (!findMobileNo) return res.status(404).json({ message: "This MobileNo Is Not Found" })

        const bpass = await bcrypt.hash(validateResult?.newPassword, 10)
        console.log("bPass--->", bpass);

        const userPassChange = await userModel.findByIdAndUpdate(
            { _id: findMobileNo._id },
            {
                $set: {
                    password: bpass
                }
            },
            { new: true }
        )

        res.status(200).json({
            status: true,
            userPassChange
        })

    } catch (error) {
        console.error("==>", error);
        res.status(500).json({
            error: error.message
        })
    }
}


