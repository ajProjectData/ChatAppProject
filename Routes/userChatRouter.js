const express = require("express")
const router = express.Router()
const { userChat, twoUserChatGet, userAllContactsShow, userMessageDelete, messageEdit, userCreateGroup, usersJoinedGroup,gpUserChatFaker, gpCreateAndUserJoinAndChatFaker, userChatfaker } = require("../Controller/userChatController")
const jwtAuth = require("../jwt/jwtMiddleware")
const imageUpload = require("../imageService/imgUpload")
const msgUploadImg = require("../imageService/msgUploadImg")

router.post("/user/chat", jwtAuth, msgUploadImg.any(), userChat)
router.post("/twoUser/chat/get", twoUserChatGet)
router.get("/user/contacts/:appUserId", userAllContactsShow)
router.post("/delete/user/message/:appUserId", userMessageDelete)
router.post("/user/message/edit/:appUserId", messageEdit)
router.post("/chat/faker", userChatfaker)
router.post("/gpCreate/faker", gpCreateAndUserJoinAndChatFaker)
router.post("/gpChat/faker", gpUserChatFaker)

/* ------------ userGroup Api ------------- */
router.post("/user/create/group/:userId", imageUpload.single("groupProfilePhoto"), userCreateGroup)
router.post("/user/join/group", usersJoinedGroup)


const userChatRoutes = router
module.exports = userChatRoutes