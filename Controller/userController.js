const userModel = require("../Model/userSchema");
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")
const joi = require("../joiValidation/joiValidator");
const otpModel = require("../Model/otpSchema")
const userChatModel = require("../Model/userChatSchema")
const generateToken = require("../jwt/tokenGenerate")
const fs = require("fs")
const faker = require("faker")
const axios = require("axios")

function mobileNumberValidate(mobileNo) {
    const mobileNoRegExp = new RegExp(/^[0-9]+$/);
    let isMobileValid = mobileNoRegExp.test(mobileNo);
    return isMobileValid
}

/* ---------- faker Api ---------- */
exports.test = async (req, res) => {
    try {
        // res.send("abc")
        var numEntries = 1
        let userRegister = []
        var user
        for (let i = 0; i < numEntries; i++) {
            console.log("userAdd(i)--->", i);
            const response = await axios.get('https://picsum.photos/200/200');
            const photoURL = response.request.res.responseUrl
            var name = faker.name.findName()
            var password = `${name.replace(/ /g, '')}@123`
            var bpass = await bcrypt.hash(password, 10)
            user = await userModel.create({
                // profilePhoto: faker.image.image(),
                profilePhoto: photoURL,
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

/* ---------- random photo add --------- */
exports.userProfilephotoAdd = async (req, res, next) => {
    try {
        const findUser = await userModel.find().skip(4000)

        const response = await axios.get('https://picsum.photos/200/200');
        const photoURL = response.request.res.responseUrl

        const data = []

        // console.log(findUser);
        for (i = 0; i < findUser.length; i++) {
            console.log("i-->",i);
            let changeImg = await userModel.findByIdAndUpdate(
                { _id: findUser[i]._id },
                {
                    profilePhoto: photoURL
                },
                { new: true }
            )
            data.push(changeImg)
        }

        console.log("dataLength--->",data.length);

        res.status(200).send({
            status: true,
            data
        })

    } catch (error) {
        console.error("==>", error);
        res.status(500).json({
            error: error.message
        })
    }
}

/* ------------------------------------------ */

exports.signUp = async (req, res, next) => {
    try {
        const validateResult = await joi.signUp.validateAsync(req.body)

        const findEmail = await userModel.findOne({ email: validateResult?.email })
        if (findEmail) return res.status(201).json({ message: "Email Already Exist" })

        const isMobileValid = mobileNumberValidate(validateResult?.mobileNo)
        if (isMobileValid === false) return res.status(422).json({ message: "Mobile Number Accept Only Numeric Value" })
        const findMobileNo = await userModel.findOne({ mobileNo: validateResult?.mobileNo })
        if (findMobileNo) return res.status(201).json({ message: "This Mobile Number Already Exist" })

        const profilePhoto = req?.file?.filename

        const bpass = await bcrypt.hash(validateResult?.password, 10)

        const userRegister = await userModel.create({
            name: validateResult?.name,
            email: validateResult?.email,
            mobileNo: validateResult?.mobileNo,
            password: bpass,
            profilePhoto: profilePhoto,
        })

        console.log("userSignUp====>", userRegister)
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

        const isMobileValid = mobileNumberValidate(validateResult?.mobileNo)
        if (isMobileValid === false) return res.status(422).json({ message: "Mobile Number Accept Only Numeric Value" })
        const findMobileNo = await userModel.findOne({ mobileNo: validateResult?.mobileNo })
        if (!findMobileNo) return res.status(201).json({ message: "Mobile Number Is Not Found" })

        let passCheck = await bcrypt.compare(validateResult?.password, findMobileNo?.password)
        if (passCheck === false) return res.status(404).json({ message: "Password Is Not Match" })

        const token = generateToken(findMobileNo)

        let sendOtp
        const otpGenerate = Math.floor(100000 + Math.random() * 900000);

        const otpUserFind = await otpModel.findOne({ mobileNo: findMobileNo.mobileNo })
        if (otpUserFind) {
            sendOtp = await otpModel.findByIdAndUpdate(
                otpUserFind._id,
                {
                    $set: {
                        otp: otpGenerate,
                        otpExpire: Date.now() + 90 * 1000
                    },
                },
                { new: true }
            )
        } else {
            sendOtp = await otpModel.create({
                otp: otpGenerate,
                mobileNo: findMobileNo.mobileNo,
                otpExpire: Date.now() + 90 * 1000
            })
        }

        console.log("loginSendOtp---->", sendOtp);
        res.status(200).json({
            status: "OTP Send SuccessFully",
            token,
            sendOtp
        })
    } catch (error) {
        console.error("error==>", error.message);
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

        // console.log("checkUser?.otpExpire==>", checkUser?.otpExpire > Date.now());
        if (checkUser?.mobileNo !== validateResult?.mobileNo) {
            return res.status(422).json({ message: "Please Enter Correct Mobile Number" })
        }
        if (checkUser?.otp !== validateResult.otp) return res.status(401).json({ message: "Please Enter Correct OTP" });
        if (checkUser?.otpExpire < Date.now()) return res.status(401).json({ message: "OTP Is Expire ReSend OTP" });

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
        // const userId = req.params.userId
        const userId = req.user.id
        const validateResult = await joi.userProfileUpdate.validateAsync(req.body)

        const findUser = await userModel.findById(userId)
        if (!findUser) return res.status(201).json({ message: "User Is Not Found" })

        const profilePhoto = req?.file?.filename

        if (profilePhoto !== undefined && fs.existsSync(`profilePhoto/${findUser.profilePhoto}`)) {
            fs.unlinkSync(`profilePhoto/${findUser.profilePhoto}`)
        }

        const detailsUpdate = await userModel.findByIdAndUpdate(findUser._id,
            {
                $set: {
                    name: validateResult?.name,
                    profilePhoto: profilePhoto
                }
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


