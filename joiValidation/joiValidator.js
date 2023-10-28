const Joi = require("joi")

const passwordPattern = /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,50}$/;
const passwordError = `Password must be strong.
    At least one upper case alphabet.
    At least one lower case alphabet.
    At least one digit.
    At least one special character.
    Minimum length 8 character
    Maximum length 50 character`

const signUp = Joi.object({
    name: Joi.string().trim().required(),
    email: Joi.string().email().trim().required(),
    mobileNo: Joi.string().length(10).trim().required(),
    password: Joi.string().trim().regex(new RegExp(passwordPattern)).message(passwordError).required()
})

const login = Joi.object({
    mobileNo: Joi.string().length(10).trim().required(),
    password: Joi.string().trim().regex(new RegExp(passwordPattern)).message(passwordError).required()
})

const otp = Joi.object({
    otp: Joi.string().length(6).trim().required(),
    mobileNo: Joi.string().length(10).trim().required(),
})

const userProfileUpdate = Joi.object({
    name: Joi.string().trim(),
    email: Joi.string().email().trim(),
    mobileNo: Joi.string().length(10).trim(),
    profileImg: Joi.string().optional().allow('')
})

const messageDelete = Joi.object({
    chatUserId: Joi.string().trim().optional(),
    groupId: Joi.string().trim().optional(),
    messageId: Joi.string().trim().required(),
    messageDeleteType: Joi.string().trim().required()
})

const messageEdit = Joi.object({
    chatUserId: Joi.string().trim().required(),
    messageId: Joi.string().trim().required(),
    message: Joi.string().trim().required()
})

const groupJoinUser = Joi.object({
    groupId: Joi.string().trim().required(),
    adminUserId: Joi.string().trim().required(),
    joinUserId: Joi.string().trim().required(),
})

const forgetPass = Joi.object({
    mobileNo: Joi.string().trim().length(10).required(),
    newPassword: Joi.string().trim().regex(new RegExp(passwordPattern)).message(passwordError).required()
})

module.exports = {
    signUp,
    login,
    otp,
    userProfileUpdate,
    messageDelete,
    messageEdit,
    groupJoinUser,
    forgetPass
}
