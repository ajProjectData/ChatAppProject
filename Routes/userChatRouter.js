const express = require("express")
const router = express.Router()
const { userChat, twoUserChatGet, userAllContactsShow, userMessageDelete, messageEdit, userCreateGroup, usersJoinedGroup,gpUserChatFaker, gpCreateAndUserJoinAndChatFaker, userChatfaker } = require("../Controller/userChatController")
const jwtAuth = require("../jwt/jwtMiddleware")
const imageUpload = require("../imageService/imgUpload")
const msgUploadImg = require("../imageService/msgUploadImg")

router.post("/user/chat", jwtAuth, msgUploadImg.any(), userChat)

// router.post("/twoUser/chat/get", twoUserChatGet) Api Path ?appUserId=651ace0fb460a7f0b452a969
router.post("/twoUser/chat/get",jwtAuth, twoUserChatGet)

// router.get("/user/contacts/:appUserId", userAllContactsShow)
router.get("/user/contacts",jwtAuth, userAllContactsShow)

// router.post("/delete/user/message/:appUserId", userMessageDelete)
router.post("/delete/user/message",jwtAuth, userMessageDelete)

// router.post("/user/message/edit/:appUserId", messageEdit)
router.post("/user/message/edit",jwtAuth, messageEdit)


/* ------------ userGroup Api ------------- */
// router.post("/user/create/group/:userId", imageUpload.single("groupProfilePhoto"), userCreateGroup)
router.post("/user/create/group",jwtAuth, imageUpload.single("groupProfilePhoto"), userCreateGroup)
router.post("/user/join/group", usersJoinedGroup)


/* --------- Fake Entry Api (faker Api) ------------*/
router.post("/chat/faker", userChatfaker)
router.post("/gpCreate/faker", gpCreateAndUserJoinAndChatFaker)
router.post("/gpChat/faker", gpUserChatFaker)
/* -------------------------------------------------- */



const userChatRoutes = router
module.exports = userChatRoutes