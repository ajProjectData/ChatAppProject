const express = require("express")
const router = express.Router()

const { signUp, loginSendOtp, addOtpUserLogin, userDetailsUpdate, forgetPassword, test, userProfilephotoAdd } = require("../Controller/userController")
const imageUpload = require("../imageService/imgUpload")
const jwtAuth = require("../jwt/jwtMiddleware")

router.post("/test", test)
router.post("/userProfilephotoAdd", userProfilephotoAdd)

router.post("/signUp", imageUpload.single('profileImg'), signUp)
// router.post("/signUp", signUp)

router.post("/login/sendOtp", loginSendOtp)
router.post("/otp/verify/login", addOtpUserLogin)
// router.put("/details/update/:userId", imageUpload.single('profileImg'), userDetailsUpdate)
router.put("/details/update", jwtAuth, imageUpload.single('profileImg'), userDetailsUpdate)
router.post("/forget/password", forgetPassword)


const userRoutes = router
module.exports = userRoutes