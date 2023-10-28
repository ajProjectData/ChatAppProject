const App = require("./app")
const http = require("http")

const server = http.createServer(App)
const io = require("socket.io")(server)
const jwt = require("jsonwebtoken")
const userModel = require("./Model/userSchema")
const userChatModel = require("./Model/userChatSchema")

const redisClient = require("./redisConnect")

const socketIo_jwtAuth = async (socket, next) => {
    try {
        const auth_data = socket.handshake.headers['authorization']
        if (auth_data === undefined) return console.log({
            error: "No Token Provide",
            message: "UnAuthorization"
        })

        const token = auth_data.split(" ")[1]

        const verifyToken = jwt.verify(token, process.env.JWT_PASSWORD)

        socket.user = verifyToken

        console.log("socket.user==>", socket.user);

        const findUser = await userModel.findById(socket.user.id)
        if (!findUser) return console.log({ message: `${socket.user.id} This User Is Not Found` })
        next()

    } catch (error) {
        res.status(500).json({
            status: false,
            error: error.message
        })
    }
}

const users = []

io.use(socketIo_jwtAuth)

async function socketDisconnectRemoveRedisData(socketConnectRedisKey) {
    const redisKeys = await redisClient.hKeys(socketConnectRedisKey)
    if (redisKeys.length > 0)
        redisClient.hDel(socketConnectRedisKey, redisKeys)
}

// io.adapter()

// io.on("connection", async (socket) => {

//     const appUserId = socket.user.id
//     const socketId = socket.id

//     const findUser = users.find(val => val.userId === appUserId)
//     // console.log("findUser===>", findUser)

//     const findUserGroup = await userChatModel.find(
//         {
//             groupUsers: {
//                 $elemMatch: {
//                     userId: appUserId
//                 }
//             },
//             isGroup: true
//         }
//     )
//     // console.log("fiondUserGroup===>", findUserGroup)

//     const groupId = findUserGroup?.map(val => val._id.toString())
//     // console.log("groupId===>", groupId);

//     if (groupId?.length > 0) {
//         socket.join(groupId)
//         groupId?.forEach(grupId => {
//             socket.to(grupId).emit("userJoinGroup", `User :- ${appUserId} Join, Group :- ${grupId}`)
//         })
//         socket.emit("userJoinGroup", groupId)
//     }

//     if (findUser !== undefined) {
//         return socket.emit("error", {
//             userId: findUser.userId,
//             message: "This User Is Already Connected"
//         })
//     } else {
//         users.push({
//             userId: appUserId,
//             socketId: socketId,
//             groupId: groupId
//         })
//     }

//     // console.log("socketREQ--->",socket);

//     // console.log("users===>", users);
//     socket.emit("userConnect", appUserId)

//     /* ---------- Typing Event ---------- */
//     socket.on("Typing", (userData) => {
//         const groupId = userData.groupId
//         const findChatUser = users.find(val => val.userId === userData.chatUserId)
//         if (userData.message !== "") {
//             if (groupId) {
//                 socket.broadcast.to(groupId).emit("typing", {
//                     groupId: groupId,
//                     message: `User :- ${appUserId} Typing...`
//                 })
//             } else {
//                 io.to(findChatUser?.socketId).emit("typing", `User :- ${appUserId} Typing...`)
//             }
//         }
//         // else {
//         // socket.broadcast.to(id).off('remove');
//         // }
//     })

//     /* ---------User Send Message--------- */
//     socket.on("sendMessage", async (userData) => {
//         const findAppUser = users.find(val => val.userId === appUserId)
//         console.log("findAppUser===>", findAppUser);

//         if (userData.chatUserId) {
//             const findchatUserId = await userModel.findById(userData.chatUserId)
//             if (!findchatUserId) return socket.emit("error", "chatUserId Is Not Find")

//             const findChatUsers = await userChatModel.find({ participantUsersId: { $all: [appUserId, userData.chatUserId] } })
//             // console.log("findChatUsers====>",findChatUsers);

//             var userMessageSend
//             if (findChatUsers?.length > 0) {
//                 userMessageSend = await userChatModel.findByIdAndUpdate(
//                     { _id: findChatUsers[0]._id },
//                     {
//                         $push: {
//                             textMessage: [
//                                 {
//                                     userId: appUserId,
//                                     message: userData.message
//                                 }
//                             ]
//                         }
//                     },
//                     { new: true }
//                 )
//             } else {
//                 userMessageSend = await userChatModel.create({
//                     participantUsersId: [appUserId, userData.chatUserId],
//                     textMessage: [
//                         {
//                             userId: appUserId,
//                             message: userData.message
//                         }
//                     ]
//                 })
//             }

//             const [findLastMessage] = await userChatModel.aggregate([
//                 {
//                     $match: { _id: userMessageSend._id }
//                 },
//                 {
//                     $project: {
//                         lastMessageSender: { $last: "$textMessage" }
//                     }
//                 }
//             ])
//             console.log("findLastMessage==>", findLastMessage);

//             userMessageSend = await userChatModel.findByIdAndUpdate(
//                 { _id: findLastMessage._id },
//                 {
//                     $set: {
//                         lastMessages: {
//                             lastSenderUserId: findLastMessage.lastMessageSender.userId,
//                             message: findLastMessage.lastMessageSender.message,
//                             date: findLastMessage.lastMessageSender.date
//                         }
//                     }
//                 },
//                 { new: true }
//             )

//             const findChatUser = users.find(val => val.userId === userData.chatUserId)
//             io.to(findChatUser?.socketId).emit("recevMessage", {
//                 senderUserId: findAppUser.userId,
//                 messagge: userData.message
//             })
//         } else {
//             const findGroupId = await userChatModel.findById(
//                 {
//                     _id: userData.groupId,
//                     isGroup: true
//                 }
//             )
//             if (!findGroupId) return socket.emit("error", "GroupId is Not found")

//             const findGpUser = await userChatModel.findOne(
//                 {
//                     _id: findGroupId._id,
//                     groupUsers: {
//                         $elemMatch: {
//                             userId: appUserId
//                         }
//                     }
//                 }
//             )
//             if (findGpUser === null) return socket.emit("error", "User Is Not Member This Group :- " + userData.groupId)
//             // console.log("findGpUser---->", findGpUser);  

//             socket.broadcast.to(userData.groupId).emit("recevMessage", {
//                 groupId: userData.groupId,
//                 senderUserId: appUserId,
//                 message: userData.message
//             })

//             var userSendMessage
//             userSendMessage = await userChatModel.findByIdAndUpdate(
//                 {
//                     _id: findGpUser._id,
//                 },
//                 {
//                     $push: {
//                         textMessage: {
//                             userId: appUserId,
//                             message: userData.message
//                         }
//                     }
//                 },
//                 { new: true }
//             )
//             console.log("userSendMessage===>", userSendMessage);

//             const [findLastMessage] = await userChatModel.aggregate([
//                 {
//                     $match: { _id: userSendMessage._id }
//                 },
//                 {
//                     $project: {
//                         lastMessageSender: { $last: "$textMessage" }
//                     }
//                 }
//             ])
//             console.log("findLastMessage==>", findLastMessage);

//             userMessageSend = await userChatModel.findByIdAndUpdate(
//                 { _id: findLastMessage._id },
//                 {
//                     $set: {
//                         lastMessages: {
//                             lastSenderUserId: findLastMessage.lastMessageSender.userId,
//                             message: findLastMessage.lastMessageSender.message,
//                             date: findLastMessage.lastMessageSender.date
//                         }
//                     }
//                 },
//                 { new: true }
//             )
//         }
//     })

//     socket.on('disconnect', async () => {
//         console.log("===> disConnect user :- ", appUserId)
//         console.log("===> disConnect user :- ", socket.id)
//         let idx = users.findIndex(idxVal => idxVal.userId === appUserId)

//         users[idx]?.groupId?.forEach(grupId => {
//             socket.to(grupId).emit("userDisconnectGroup", `User :- ${appUserId} Disconnect, Group :- ${grupId}`)
//         })
//         users.splice(idx, 1)
//         console.log("users===>",users);
//     })

// })

const usersJoinedGroup = io.of("/user/join/group").use(socketIo_jwtAuth)
const OnlyAdminUserCanAddOtherUsers = io.of("/admin/user/adds/user").use(socketIo_jwtAuth)

/* -------- redis implement socket --------- */
const socketUserConnectRedisKey = "socketUserConnect"
io.on("connection", async (socket) => {
    const appUserId = socket.user.id
    const findUser = await redisClient.hGet(socketUserConnectRedisKey, appUserId)
    const alreadyConnectedUser = JSON.parse(findUser)

    // redisClient.lMove("PracticeRedisMethod","userPushRedisKey","LEFT","RIGHT","64dc5dede5e836e91d5197bb")

    // console.log("alreadyConnectedUser===>", alreadyConnectedUser)
    if (findUser !== null) {
        return socket.emit("error", {
            userId: alreadyConnectedUser.userId,
            message: "This User Is Already Connected"
        })
    }

    const socketId = socket.id
    const findUserGroup = await userChatModel.find(
        {
            groupUsers: {
                $elemMatch: {
                    userId: appUserId
                }
            },
            isGroup: true
        }
    )
    const groupId = findUserGroup?.map(val => val._id.toString())

    let user = {
        userId: appUserId,
        socketId: socketId,
        groupId: groupId
    }
    redisClient.hSet(socketUserConnectRedisKey, user.userId, JSON.stringify(user))

    // let data = await redisClient.lmPop("PracticeRedisMethod",2)
    // let data = await redisClient.sAdd("PracticeredisMethod",user.userId)
    // let data = await redisClient.sInter("PracticeredisMethod", "connetUser")
    // let data = await redisClient.lPush("PracticeRedisMethod",user.userId)
    // console.log("data--->", data);

    // redisClient.lPush("userPushRedisKey", user.userId)

    socket.emit("userConnect", appUserId)
    if (groupId?.length > 0) {
        socket.join(groupId)
        groupId?.forEach(grupId => {
            socket.to(grupId).emit("userJoinGroup", {
                user: appUserId,
                join_group: groupId
            })
        })
        socket.emit("userJoinGroup", { message: groupId })
    }

    /* ---------- Typing Event ---------- */
    socket.on("Typing", (userData) => {
        const groupId = userData.groupId
        const findChatUser = users.find(val => val.userId === userData.chatUserId)
        if (userData.message !== "") {
            if (groupId) {
                socket.broadcast.to(groupId).emit("typing", {
                    groupId: groupId,
                    message: `User :- ${appUserId} Typing...`
                })
            } else {
                io.to(findChatUser?.socketId).emit("typing", `User :- ${appUserId} Typing...`)
            }
        }
        // else {
        // socket.broadcast.to(id).off('remove');
        // }
    })

    /* ---------User Send Message--------- */
    socket.on("sendMessage", async (userData) => {
        const findAppUser = await redisClient.hGet(socketUserConnectRedisKey, appUserId)
        // console.log("findAppUser===>", findAppUser);

        if (userData.chatUserId) {
            const findchatUserId = await userModel.findById(userData.chatUserId)
            if (!findchatUserId) return socket.emit("error", "chatUserId Is Not Find")

            const findChatUsers = await userChatModel.find({ participantUsersId: { $all: [appUserId, userData.chatUserId] } })
            // console.log("findChatUsers====>",findChatUsers);

            var userMessageSend
            if (findChatUsers?.length > 0) {
                userMessageSend = await userChatModel.findByIdAndUpdate(
                    { _id: findChatUsers[0]._id },
                    {
                        $push: {
                            textMessage: [
                                {
                                    userId: appUserId,
                                    message: userData.message
                                }
                            ]
                        }
                    },
                    { new: true }
                )
            } else {
                userMessageSend = await userChatModel.create({
                    participantUsersId: [appUserId, userData.chatUserId],
                    textMessage: [
                        {
                            userId: appUserId,
                            message: userData.message
                        }
                    ]
                })
            }

            const [findLastMessage] = await userChatModel.aggregate([
                {
                    $match: { _id: userMessageSend._id }
                },
                {
                    $project: {
                        lastMessageSender: { $last: "$textMessage" }
                    }
                }
            ])
            console.log("findLastMessage==>", findLastMessage);

            userMessageSend = await userChatModel.findByIdAndUpdate(
                { _id: findLastMessage._id },
                {
                    $set: {
                        lastMessages: {
                            lastSenderUserId: findLastMessage.lastMessageSender.userId,
                            message: findLastMessage.lastMessageSender.message,
                            date: findLastMessage.lastMessageSender.date
                        }
                    }
                },
                { new: true }
            )

            const findChatUser = await redisClient.hGet(socketUserConnectRedisKey, userData.chatUserId)
            let chatUser = JSON.parse(findChatUser)
            console.log("chatUser---->", chatUser)
            // if(chatUser == null) return socket.emit("error",)
            io.to(chatUser.socketId).emit("recevMessage", {
                senderUserId: JSON.parse(findAppUser).userId,
                messagge: userData.message
            })
        } else {
            const findGroupId = await userChatModel.findById(
                {
                    _id: userData.groupId,
                    isGroup: true
                }
            )
            if (!findGroupId) return socket.emit("error", "GroupId is Not found")

            const findGpUser = await userChatModel.findOne(
                {
                    _id: findGroupId._id,
                    groupUsers: {
                        $elemMatch: {
                            userId: appUserId
                        }
                    }
                }
            )
            if (findGpUser === null) return socket.emit("error", "User Is Not Member This Group :- " + userData.groupId)
            // console.log("findGpUser---->", findGpUser);

            socket.to(userData.groupId).emit("recevMessage", {
                groupId: userData.groupId,
                senderUserId: appUserId,
                message: userData.message
            })

            var userSendMessage
            userSendMessage = await userChatModel.findByIdAndUpdate(
                {
                    _id: findGpUser._id,
                },
                {
                    $push: {
                        textMessage: {
                            userId: appUserId,
                            message: userData.message
                        }
                    }
                },
                { new: true }
            )
            // console.log("userSendMessage===>", userSendMessage);

            const [findLastMessage] = await userChatModel.aggregate([
                {
                    $match: { _id: userSendMessage._id }
                },
                {
                    $project: {
                        lastMessageSender: { $last: "$textMessage" }
                    }
                }
            ])
            // console.log("findLastMessage==>", findLastMessage);

            userMessageSend = await userChatModel.findByIdAndUpdate(
                { _id: findLastMessage._id },
                {
                    $set: {
                        lastMessages: {
                            lastSenderUserId: findLastMessage.lastMessageSender.userId,
                            message: findLastMessage.lastMessageSender.message,
                            date: findLastMessage.lastMessageSender.date
                        }
                    }
                },
                { new: true }
            )
        }
    })

    socket.on('disconnect', async () => {
        console.log("===> disConnect user :- ", appUserId)
        console.log("===> disConnect user :- ", socket.id)
        redisClient.hDel(socketUserConnectRedisKey, appUserId)
    })
})

io.on("connection", (socket) => {
    console.log('a user connected');

    socket.on("disconnect",()=>{
        console.log("===> disConnect user")
    })
})

/* userJoinGroup.on("connection", (socket) => {
    const connectionKey = "userConnectkey"

    socket.on("newUserJoinGroup", (userData) => {
        // Write Code...
    })
}) */


usersJoinedGroup.on("connection", async (socket) => {
    const socketUserConnectRedisKey = "socketUserConnect"
    const userId = socket.user.id
    // const socketId = socket.id
    // console.log("--->", socketId);
    socket.on("newUserJoinGroup", async (userData) => {
        let groupId = userData.groupId
        // let userId = userData.userId

        const findGroup = await userChatModel.find({
            _id: groupId,
            isGroup: true
        })
        if (findGroup.length <= 0) return socket.emit("error", "GroupId is Not found")

        const findJoinUser = await userModel.findOne({ _id: userId })
        if (!findJoinUser) return socket.emit("error", "This User is not found")

        var findUserGP = await redisClient.hGet(socketUserConnectRedisKey, userId)
        let findedGPUser = JSON.parse(findUserGP)
        if (findedGPUser === null) return usersJoinedGroup.emit("error", `This User :- ${userId} Is Not Connected`)
        if (findedGPUser?.groupId?.includes(groupId) === true) return usersJoinedGroup.emit("error", "User Already Joined this group")

        findedGPUser?.groupId?.push(groupId)
        redisClient.hSet(socketUserConnectRedisKey, userId, JSON.stringify(findedGPUser))

        io.in(groupId).emit("userJoinGroup", {
            user: userId,
            join_group: groupId
        })

        io.of('/').sockets.get(findedGPUser.socketId).join(groupId); // koy pan socketId ne koy pan group ma join karava mate [ Note :- Je socketId add karye te socket farajiyat connect hovu joye ]

        io.to(findedGPUser.socketId).emit("userJoinGroup", `you are Join, Group :- ${groupId}`)

        usersJoinedGroup.emit("userJoinGP", {
            user: userId,
            join_group: groupId
        })

        await userChatModel.findByIdAndUpdate(
            {
                _id: findGroup[0]._id
            },
            {
                $push: {
                    groupUsers: {
                        // profilePhoto: findJoinUser.profilePhoto,
                        userId: findJoinUser._id
                    }
                }
            }
        )
    })

    socket.on('disconnect', async () => {
        console.log("===> disConnect user :- ", socket.id)
    })
})

OnlyAdminUserCanAddOtherUsers.on("connection", async (socket) => {
    // const socketId = socket.id
    const socketUserConnectRedisKey = "socketUserConnect"

    socket.on("userJoinGroup", async (userData) => {
        let groupId = userData.groupId
        let adminUserId = userData.adminUserId
        let joinUserId = userData.joinUserId

        const findGroupId = await userChatModel.find(
            {
                _id: groupId,
                isGroup: true
            }
        )
        if (findGroupId?.length <= 0) return OnlyAdminUserCanAddOtherUsers.emit("error", "GroupId is Not Found")

        const findUser = await userModel.findById(adminUserId)
        if (!findUser) return OnlyAdminUserCanAddOtherUsers.emit("error", "This adminUserId is Not found")

        const findUserAdmin = await userChatModel.findOne({
            _id: findGroupId[0]._id,
            groupUsers: {
                $elemMatch: {
                    userId: adminUserId,
                    admin: true
                }
            }
        })
        // console.log("findUserAdmin==>", findUserAdmin);
        if (findUserAdmin === null) return OnlyAdminUserCanAddOtherUsers.emit("error", "This adminUserId User is Not Admin")

        const findJoinUser = await userModel.findById(joinUserId)
        if (!findJoinUser) return socket.emit("error", "joinUserId is Not Found")

        var findUserGP = await redisClient.hGet(socketUserConnectRedisKey, joinUserId)
        let findedGPUser = JSON.parse(findUserGP)
        if (findedGPUser?.groupId?.includes(groupId) === true) return OnlyAdminUserCanAddOtherUsers.emit("error", "User Already Joined this group")

        findedGPUser?.groupId?.push(groupId)
        redisClient.hSet(socketUserConnectRedisKey, joinUserId, JSON.stringify(findedGPUser))

        io.in(groupId).emit("userJoinGroup", {
            user: joinUserId,
            join_group: groupId
        })

        io.of('/').sockets.get(findedGPUser.socketId).join(groupId);

        io.to(findedGPUser.socketId).emit("userJoinGroup", `you are Join, Group :- ${groupId}`)

        usersJoinedGroup.emit("userJoinGP", {
            user: joinUserId,
            join_group: groupId
        })

        await userChatModel.findByIdAndUpdate(
            {
                _id: findUserAdmin._id
            },
            {
                $push: {
                    groupUsers: {
                        userId: findJoinUser._id
                    }
                }
            }
        )
    })

    socket.on('disconnect', async () => {
        console.log("===> disConnect user :- ", socket.id)
    })
})

io.allSockets().then((allSocket) => {
    if (allSocket.size <= 0) {
        socketDisconnectRemoveRedisData(socketUserConnectRedisKey)
    }
})

const dbConnect = require("./dbConfig/dbConnect");
dbConnect()
server.listen(6500, () => {
    console.log("Server Start Port -->", 6500);
})






