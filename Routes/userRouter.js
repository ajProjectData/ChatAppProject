const express = require("express")
const router = express.Router()

const { signUp, loginSendOtp, addOtpUserLogin, userDetailsUpdate, forgetPassword, test } = require("../Controller/userController")
const imageUpload = require("../imageService/imgUpload")

router.post("/test", test)
router.post("/signUp", imageUpload.single('profileImg'), signUp)
router.post("/login/sendOtp", loginSendOtp)
router.post("/otp/enter", addOtpUserLogin)
router.put("/details/update/:userId", imageUpload.single('profileImg'), userDetailsUpdate)
router.post("/forget/password", forgetPassword)


const userRoutes = router
module.exports = userRoutes