const joi = require("../joiValidation/joiValidator");
const userChatModel = require("../Model/userChatSchema")
const userModel = require("../Model/userSchema");
const mongoose = require("mongoose")
const ObjectId = mongoose.Types.ObjectId
const fs = require("fs")
let faker = require("faker");
const msgUploadImg = require("../imageService/msgUploadImg");

/* -------------- faker Api ------------ */
function generateRandomMessage(usersId) {
    var participantUsersId = usersId
    // console.log("-->", participantUsersId);
    var idUser = participantUsersId[Math.floor(Math.random() * participantUsersId.length)]
    return {
        userId: idUser,
        message: faker.lorem.sentence(),
        // date: faker.date.past(), // Random past date
        // date: faker.date.recent(), // Random past date
    };
}

exports.gpCreateAndUserJoinAndChatFaker = async (req, res, next) => {
    try {
        const users = await userModel.find();
        const randomUser = users[Math.floor(Math.random() * users.length)]

        var groupName = faker.company.companyName()
        var groupProfilePhoto = faker.image.image()
        var userCreateGp = []
        var dataJoinUser

        var num = 500
        var gpJoinUser = 67
        var msgSend = Math.floor(Math.random() * 1000) + 1
        for (let i = 0; i < num; i++) {
            console.log("GpUser(i)---->", i)
            var userCreateGP = await userChatModel.create({
                groupName: faker.company.companyName(),
                groupProfilePhoto: faker.image.image(),
                groupUsers: [
                    {
                        profilePhoto: randomUser.profilePhoto,
                        userId: randomUser._id,
                        admin: true
                    }
                ],
                isGroup: true
            })

            for (let j = 0; j < gpJoinUser; j++) {
                // console.log("gpJoinUser(j)---->", j)
                const randomGPUser = users[Math.floor(Math.random() * users.length)]
                dataJoinUser = await userChatModel.findByIdAndUpdate(
                    { _id: userCreateGP._id },
                    {
                        $push: {
                            groupUsers: [
                                {
                                    profilePhoto: randomGPUser.profilePhoto,
                                    userId: randomGPUser._id,
                                }
                            ],
                        }
                    },
                    { new: true }
                )
            }

            // console.log("===>", dataJoinUser.groupUsers);
            for (let k = 0; k < msgSend; k++) {
                // console.log("msgSend(k)-->", k);
                const randomGPUser = dataJoinUser.groupUsers[Math.floor(Math.random() * dataJoinUser?.groupUsers.length)]

                var data = await userChatModel.findByIdAndUpdate(
                    { _id: dataJoinUser._id },
                    {
                        $push: {
                            textMessage: [
                                {
                                    userId: randomGPUser.userId,
                                    message: faker.lorem.sentence(),
                                }
                            ]
                        }
                    },
                    { new: true }
                )
            }

            const [findLastMessage] = await userChatModel.aggregate([
                {
                    $match: { _id: userCreateGP._id }
                },
                {
                    $project: {
                        lastMessageSender: { $last: "$textMessage" }
                    }
                }
            ])

            var data2 = await userChatModel.findByIdAndUpdate(
                { _id: userCreateGP._id },
                {
                    $set: {
                        lastMessages: {
                            lastSenderUserId: findLastMessage.lastMessageSender.userId,
                            message: findLastMessage.lastMessageSender.message,
                            date: findLastMessage.lastMessageSender.date
                        }
                    },
                    $unset: {
                        participantUsersId: 1
                    }
                },
                { new: true }
            )
            userCreateGp.push(data2)
        }
        console.log("userCreateGp--->", userCreateGp);
        res.status(500).json({
            status: true,
            userCreateGp
        })

    } catch (error) {
        console.error("==>", error);
        res.status(500).json({
            error: error.message
        })
    }
}

exports.gpUserChatFaker = async (req, res, next) => {
    try {
        var getGroup = 1000
        const findGp = await userChatModel.find({ isGroup: true }).skip(2000).limit(getGroup)

        var msgSend = 110
        const allGroups = []
        for (var i = 0; i < getGroup; i++) {
            console.log("onlyGPMsg(i)-->", i);
            const randomGp = findGp[Math.floor(Math.random() * findGp.length)]
            console.log("randomGp--->", randomGp._id);
            for (var j = 0; j < msgSend; j++) {
                const randomGPUser = randomGp.groupUsers[Math.floor(Math.random() * randomGp?.groupUsers.length)]

                var data = await userChatModel.findByIdAndUpdate(
                    { _id: randomGp._id },
                    {
                        $push: {
                            textMessage: [
                                {
                                    userId: randomGPUser.userId,
                                    message: faker.lorem.sentence(),
                                }
                            ]
                        }
                    },
                    { new: true }
                )
            }

            const [findLastMessage] = await userChatModel.aggregate([
                {
                    $match: { _id: randomGp._id }
                },
                {
                    $project: {
                        lastMessageSender: { $last: "$textMessage" }
                    }
                }
            ])

            var data2 = await userChatModel.findByIdAndUpdate(
                { _id: randomGp._id },
                {
                    $set: {
                        lastMessages: {
                            lastSenderUserId: findLastMessage.lastMessageSender.userId,
                            message: findLastMessage.lastMessageSender.message,
                            date: findLastMessage.lastMessageSender.date
                        }
                    },
                    // $unset: {
                    //     participantUsersId: 1
                    // }
                },
                { new: true }
            )
            allGroups.push(data2)
        }
        res.status(200).json({
            status: true,
            allGroups
        })
    } catch (error) {
        console.error("==>", error);
        res.status(500).json({
            error: error.message
        })
    }
}

exports.userChatfaker = async (req, res, next) => {
    try {
        var numConversations = 5000
        // let msgSend = 88

        var participantUsersId
        const users = await userModel.find(); // Fetch all users from your database
        const conversationPromises = [];
        var data = []

        for (let i = 0; i < numConversations; i++) {
            console.log("TwoUserChat(i)==>", i);
            const randomUser1 = users[Math.floor(Math.random() * users.length)];
            const randomUser2 = users[Math.floor(Math.random() * users.length)];

            participantUsersId = [randomUser1._id, randomUser2._id]

            const findChatUser = await userChatModel.find({ participantUsersId: { $all: participantUsersId } })
            // console.log("participantUsersId--->", participantUsersId);

            var userMessageSend
            var msgSend = Math.floor(Math.random() * 200) + 1 // min=1 , max=100
            console.log("msgSend-->", msgSend);
            if (findChatUser?.length > 0) {
                for (var l = 0; l < msgSend; l++) {
                    userMessageSend = await userChatModel.findByIdAndUpdate(
                        { _id: findChatUser[0]._id },
                        {
                            $push: {
                                textMessage: [
                                    generateRandomMessage(participantUsersId)
                                ]
                            }
                        },
                        { new: true }
                    )
                }
            } else {
                userMessageSend = await userChatModel.create({
                    participantUsersId: participantUsersId,
                    // textMessage: [
                    //     generateRandomMessage(participantUsersId[1]),
                    //     generateRandomMessage(participantUsersId[0]),
                    // ]
                })
                for (var l = 0; l < msgSend; l++) {
                    await userChatModel.findByIdAndUpdate(
                        { _id: userMessageSend._id },
                        {
                            $push: {
                                textMessage: [
                                    generateRandomMessage(participantUsersId)
                                ]
                            }
                        },
                        { new: true }
                    )
                }
            }

            var userUnsetField
            if (userMessageSend.isGroup === false) {
                userUnsetField = { "groupUsers": 1 }
            } else {
                userUnsetField = { "participantUsersId": 1 }
            }
            // console.log("userUnsetField===>", userUnsetField);

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
            //  console.log("findLastMessage==>", findLastMessage);

            userMessageSend = await userChatModel.findByIdAndUpdate(
                { _id: findLastMessage._id },
                {
                    $set: {
                        lastMessages: {
                            lastSenderUserId: findLastMessage.lastMessageSender.userId,
                            message: findLastMessage.lastMessageSender.message,
                            date: findLastMessage.lastMessageSender.date
                        }
                    },
                    $unset: { ...userUnsetField }
                },
                { new: true }
            )
        }

        res.status(200).json({
            userMessageSend
        })
        // console.log("data===>",data);
    } catch (error) {
        console.error("==>", error);
        res.status(500).json({
            error: error.message
        })
    }
}
/* --------------------------------------- */


exports.userChat = async (req, res, next) => {
    try {
        const { participantUsersId, groupId } = req.body
        let textMessage = req.body.textMessage
        console.log("participantUsersId===>", participantUsersId);
        console.log("groupId===>", groupId);
        // console.log("textMessage===>", textMessage);
        if (req.files?.length > 0) {
            textMessage = textMessage?.map(val => {
                return data = {
                    userId: val.userId,
                    message: req.files[0].filename,
                    viewOnce: val.viewOnce
                }
            })
        }
        // console.log("textMessage===>", textMessage);

        var userMessageSend
        let appUser

        if (participantUsersId != undefined) {
            const findUser = await userModel.find({ _id: { $in: participantUsersId } })
            if (findUser?.length <= 0) return res.status(404).json({ message: "Both UserId is Not found" })
            // console.log("findUser===>", findUser);

            let data = participantUsersId?.filter(id => !findUser.some(user => user._id == id))
            // console.log("data==>", data);
            if (data?.length > 0) return res.status(404).json({
                id: data[0],
                message: "This User Is Not Found"
            })

            appUser = textMessage.map(val => participantUsersId.filter(userId => userId == val.userId))
            if (appUser[0]?.length <= 0) return res.status(404).json({
                userId: textMessage[0].userId,
                message: "This textMessage.userId is Not Match participantUsersId"
            })
            appUser = appUser[0][0]
            // return console.log("appUser==>", appUser);


            const findChatUser = await userChatModel.find({ participantUsersId: { $all: participantUsersId } })
            // console.log("findChatUser===>", findChatUser);

            if (findChatUser?.length > 0) {
                userMessageSend = await userChatModel.findByIdAndUpdate(
                    { _id: findChatUser[0]._id },
                    {
                        $push: {
                            textMessage: textMessage
                        }
                    },
                    { new: true }
                )
            } else {
                userMessageSend = await userChatModel.create({
                    participantUsersId: participantUsersId,
                    textMessage: textMessage
                })
            }
        }

        if (groupId != undefined) {
            const findGroupId = await userChatModel.find(
                {
                    _id: groupId,
                    isGroup: true
                }
            )
            if (findGroupId?.length <= 0) return res.status(404).json({ message: "GroupId is Not Found" })
            // console.log("findGroupId==>", findGroupId);

            const messageSendUserId = await userModel.findById(textMessage[0].userId)
            if (!messageSendUserId) return res.status(404).json({ message: "SenderUserId User is Not found" })

            let userCheckGroupMember = await userChatModel.find({
                _id: findGroupId[0]._id,
                groupUsers: {
                    $elemMatch: {
                        userId: messageSendUserId._id,
                    }
                }
            })
            if (userCheckGroupMember?.length <= 0) return res.status(404).json({
                message: "textMessage.userId User is Not Member This Group"
            })
            appUser = messageSendUserId._id

            userMessageSend = await userChatModel.findByIdAndUpdate(
                { _id: findGroupId[0]._id },
                {
                    $push: {
                        textMessage: textMessage
                    }
                },
                { new: true }
            )
        }
        // console.log("userMessageSend=1=>", userMessageSend);

        var userUnsetField
        if (userMessageSend.isGroup === false) {
            userUnsetField = { "groupUsers": 1 }
        } else {
            userUnsetField = { "participantUsersId": 1 }
        }
        // console.log("userUnsetField===>", userUnsetField);

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
        //  console.log("findLastMessage==>", findLastMessage);

        userMessageSend = await userChatModel.findByIdAndUpdate(
            { _id: findLastMessage._id },
            {
                $set: {
                    lastMessages: {
                        lastSenderUserId: findLastMessage.lastMessageSender.userId,
                        message: findLastMessage.lastMessageSender.message,
                        date: findLastMessage.lastMessageSender.date
                    }
                },
                $unset: { ...userUnsetField }
            },
            { new: true }
        )
        // console.log("userMessageSend=2=>", userMessageSend);

        const userData = await userChatModel.aggregate([
            {
                $match: {
                    _id: userMessageSend._id
                }
            },
            {
                $addFields: {
                    appUserId: new ObjectId(appUser),
                    chatUserId: {
                        $first: {
                            $setDifference: ["$participantUsersId", [new ObjectId(appUser)]]
                        }
                    }
                }
            },
            {
                $lookup: {
                    from: "users",
                    localField: "chatUserId",
                    foreignField: "_id",
                    as: "chatUser"
                }
            },
            {
                $project: {
                    _id: 0,
                    appUserId: "$appUserId",
                    group: {
                        $cond: {
                            if: { $eq: ["$isGroup", true] },
                            then: {
                                groupId: "$_id",
                                groupProfilePhoto: "$groupProfilePhoto",
                                groupName: "$groupName",
                            },
                            else: "$$REMOVE"
                        }
                    },
                    ChatUser: {
                        $cond: {
                            if: {
                                $ne: ["$isGroup", true]
                            },
                            then: {
                                chatUserId: "$chatUserId",
                                profilePhoto: { $first: "$chatUser.profilePhoto" },
                                name: { $first: "$chatUser.name" }
                            },
                            else: "$$REMOVE"
                        }
                    },
                    Messages: "$textMessage"
                }
            }
        ])

        res.status(200).json({
            status: true,
            userData
        })

    } catch (error) {
        console.error("==>", error);
        res.status(500).json({
            error: error.message
        })
    }
}

exports.twoUserChatGet = async (req, res, next) => {
    try {
        const appUserId = req.query.appUserId
        const chatUserId = req.body.chatUserId
        const groupId = req.body.groupId

        console.log("ap-->", appUserId);

        const usersId = [appUserId, chatUserId]

        if (!groupId) {
            const findUser = await userModel.find({ _id: { $in: usersId } })
            if (findUser?.length <= 0) return res.status(404).json({ message: "Both UserId is Not found" })
            // console.log("findUser===>", findUser);

            let data = usersId?.filter(id => !findUser.some(user => user._id == id))
            if (data?.length > 0) return res.status(404).json({
                id: data[0],
                message: "This User Is Not Found"
            })
        } else {
            const findGroup = await userChatModel.findById(groupId)
            if (!findGroup) return res.status(404).json({ message: "GroupID Is Not Found" })
        }

        const findTowUserChat = await userChatModel.aggregate([
            {
                $match: {
                    $or: [
                        {
                            participantUsersId: {
                                $all: [new ObjectId(appUserId), new ObjectId(chatUserId)]
                            },
                            isGroup: {
                                $ne: ["$isGroup", true]
                            }
                        },
                        {
                            groupUsers: {
                                $elemMatch: {
                                    userId: new ObjectId(appUserId)
                                }
                            },
                            _id: new ObjectId(groupId),
                            isGroup: true
                        }
                    ]
                }
            },
            {
                $addFields: {
                    chatUserId: {
                        $first: { $setDifference: ["$participantUsersId", [new ObjectId(appUserId)]] }
                    },
                    messages: {
                        $let: {
                            vars: {
                                msgData: {
                                    $map: {
                                        input: "$textMessage",
                                        as: "msg",
                                        in: {
                                            $switch: {
                                                branches: [
                                                    {
                                                        case: { $eq: ["$$msg.userId", new ObjectId(appUserId)] },
                                                        then: {
                                                            $cond: {
                                                                if: {
                                                                    $eq: ["$$msg.deleteOne", true]
                                                                },
                                                                then: "$$REMOVE",
                                                                else: "$$msg"
                                                            }
                                                        }
                                                    },
                                                ],
                                                default: "$$msg"
                                            }
                                        }
                                    }
                                }
                            },
                            in: {
                                $let: {
                                    vars: {
                                        allMsgData: {
                                            $map: {
                                                input: "$$msgData",
                                                as: "msag",
                                                in: {
                                                    $cond: [
                                                        { $eq: ["$$msag.deleteEveryOne", true] },
                                                        {
                                                            message: "This Message Deleted EveryOne",
                                                            date: "$$msag.date"
                                                        },
                                                        "$$msag"
                                                    ]
                                                }
                                            }
                                        }
                                    },
                                    in: {
                                        $filter: {
                                            input: "$$allMsgData",
                                            as: "msag",
                                            cond: {
                                                $ne: ["$$msag", null]
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            },
            {
                $lookup: {
                    from: "users",
                    localField: "chatUserId",
                    foreignField: "_id",
                    as: "chatUser"
                }
            },
            {
                $project: {
                    // _id: 0,
                    appUserId: new ObjectId(appUserId),
                    group: {
                        $cond: {
                            if: { $eq: ["$isGroup", true] },
                            then: {
                                groupId: "$_id",
                                groupProfilePhoto: "$groupProfilePhoto",
                                groupName: "$groupName",
                            },
                            else: "$$REMOVE"
                        }
                    },
                    ChatUser: {
                        $cond: {
                            if: {
                                $ne: ["$isGroup", true]
                            },
                            then: {
                                chatUserId: "$chatUserId",
                                profilePhoto: { $first: "$chatUser.profilePhoto" },
                                name: { $first: "$chatUser.name" }
                            },
                            else: "$$REMOVE"
                        }
                    },
                    Messages: {
                        $map: {
                            input: "$messages",
                            as: "mesage",
                            in: {
                                userId: "$$mesage.userId",
                                message: "$$mesage.message",
                                Date: "$$mesage.date"
                            }
                        }
                    },
                }
            }
        ])
        // console.log("-->", findTowUserChat);

        const [onlyOnceViewTrue] = await userChatModel.aggregate([
            {
                $match: {
                    _id: new ObjectId(findTowUserChat[0]._id)
                }
            },
            {
                $addFields: {
                    viewTrueMsg: {
                        $filter: {
                            input: "$textMessage",
                            as: "msg",
                            cond: {
                                $and: [
                                    {
                                        $eq: ["$$msg.viewOnce", true],
                                    },
                                    {
                                        $ne: ["$$msg.message", "Opened"]
                                    }
                                ]
                            }
                        }
                    }
                }
            }
        ])
        // console.log("onlyOnceViewTrue-->", onlyOnceViewTrue.viewTrueMsg);

        let data
        onlyOnceViewTrue?.viewTrueMsg?.map(async (msgData) => {
            if (fs.existsSync(`./msgPhotoSend/${msgData.message}`)) {
                setTimeout(async () => {
                    data = await userChatModel.findOneAndUpdate(
                        {
                            _id: onlyOnceViewTrue._id,
                            textMessage: {
                                $elemMatch: {
                                    _id: msgData._id,
                                    viewOnce: true
                                }
                            }
                        },
                        {
                            $set: {
                                "textMessage.$.message": "Opened",
                            }
                        },
                        { new: true }
                    )
                    console.log("Open");
                    fs.unlinkSync(`./msgPhotoSend/${msgData.message}`)
                }, 15000)
            } else {
                data = await userChatModel.findOneAndUpdate(
                    {
                        _id: onlyOnceViewTrue._id,
                        textMessage: {
                            $elemMatch: {
                                _id: msgData._id,
                                viewOnce: true
                            }
                        }
                    },
                    {
                        $set: {
                            "textMessage.$.message": "Opened",
                        }
                    },
                    { new: true }
                )
            }
            console.log("--->", data);
        })

        // if (onlyOnceViewTrue.viewOnce === true && onlyOnceViewTrue.message !== "Opened") {
        //     let data
        //     setTimeout(async () => {
        //         data = await userChatModel.findOneAndUpdate(
        //             {
        //                 _id: onlyOnceViewTrue._id,
        //                 textMessage: {
        //                     $elemMatch: {
        //                         _id: onlyOnceViewTrue.msgId,
        //                         viewOnce: true
        //                     }
        //                 }
        //             },
        //             {
        //                 $set: {
        //                     "textMessage.$.message": "Opened",
        //                     lastMessages: {
        //                         lastSenderUserId: onlyOnceViewTrue.userId,
        //                         message: "Opened",
        //                         date: onlyOnceViewTrue.date
        //                     }
        //                 }
        //             },
        //             { new: true }
        //         )
        //         if (fs.existsSync(`./msgPhotoSend/${onlyOnceViewTrue.message}`)) {
        //             console.log("exist");
        //             fs.unlinkSync(`./msgPhotoSend/${onlyOnceViewTrue.message}`)
        //         }
        //         console.log("Open");
        //     }, 10000)
        //     // const data = await userChatModel.findOneAndUpdate(
        //     //     {
        //     //         _id: onlyOnceViewTrue._id,
        //     //         textMessage: {
        //     //             $elemMatch: {
        //     //                 _id: onlyOnceViewTrue.msgId,
        //     //                 viewOnce: true
        //     //             }
        //     //         }
        //     //     },
        //     //     {
        //     //         $set: {
        //     //             "textMessage.$.message": "Opened",
        //     //             lastMessages: {
        //     //                 lastSenderUserId: onlyOnceViewTrue.userId,
        //     //                 message: "Opened",
        //     //                 date: onlyOnceViewTrue.date
        //     //             }
        //     //         }
        //     //     },
        //     //     { new: true }
        //     // )
        //     // console.log("data==>", data);
        // }

        res.status(200).json({
            status: true,
            findTowUserChat
        })

    } catch (error) {
        console.error("==>", error);
        res.status(500).json({
            error: error.message
        })
    }
}

exports.userAllContactsShow = async (req, res, next) => {
    try {

        const appUserId = req.params.appUserId
        const findUser = await userModel.findById(appUserId)
        if (!findUser) return res.status(404).json({ message: "User is Not found" })

        // const userAllContacts = await userChatModel.aggregate([
        //     {
        //         $match: {
        //             participantUsersId: {
        //                 $in: [findUser._id]
        //             }
        //         }
        //     },
        //     {
        //         $addFields: {
        //             appUserId: {
        //                 $first: {
        //                     $filter: {
        //                         input: "$participantUsersId",
        //                         as: "user",
        //                         cond: {
        //                             $eq: ["$$user", findUser._id]
        //                         }
        //                     }
        //                 }
        //             },
        //             chatUserId: {
        //                 $first: {
        //                     $filter: {
        //                         input: "$participantUsersId",
        //                         as: "user",
        //                         cond: {
        //                             $ne: ["$$user", findUser._id]
        //                         }
        //                     }
        //                 }
        //             }
        //         }
        //     },
        //     {
        //         $lookup: {
        //             from: "users",
        //             localField: "chatUserId",
        //             foreignField: "_id",
        //             as: "chatUser"
        //         }
        //     },
        //     {
        //         $addFields: {
        //             profilePhoto: { $first: "$chatUser.profilePhoto" },
        //             name: { $first: "$chatUser.name" },
        //             message: {
        //                 $cond: {
        //                     if: { $eq: ["$lastMessages.lastSenderUserId", "$appUserId"] },
        //                     then: { $concat: ["✓ ", "$lastMessages.message"] },
        //                     else: "$lastMessages.message"
        //                 }
        //             },
        //             date: "$lastMessages.date"
        //         }
        //     },
        //     {
        //         $group: {
        //             _id: "$appUserId",
        //             userContacts: {
        //                 $push: {
        //                     chatUserId: "$chatUserId",
        //                     profilePhoto: "$profilePhoto",
        //                     name: "$name",
        //                     message: "$message",
        //                     date: "$date"
        //                 }
        //             }
        //         }
        //     },
        //     {
        //         $project: {
        //             _id: 0,
        //             appUserId: "$_id",
        //             userContacts: {
        //                 $sortArray: {
        //                     input: "$userContacts",
        //                     sortBy: { date: -1 }
        //                 }
        //             }
        //         }
        //     }
        // ])

        const userAllContacts = await userChatModel.aggregate([
            {
                $match: {
                    $or: [
                        {
                            participantUsersId: {
                                $in: [findUser._id]
                            }
                        },
                        {
                            groupUsers: {
                                $elemMatch: {
                                    userId: findUser._id
                                }
                            }
                        }
                    ]
                }
            },
            {
                $addFields: {
                    appUserId: {
                        $first: {
                            $cond: {
                                if: {
                                    $eq: ["$isGroup", true],
                                },
                                then: {
                                    $let: {
                                        vars: {
                                            userData: {
                                                $filter: {
                                                    input: "$groupUsers",
                                                    as: "users",
                                                    cond: {
                                                        $eq: ["$$users.userId", findUser._id]
                                                    }
                                                }
                                            }
                                        },
                                        in: "$$userData.userId"
                                    }
                                },
                                else: {
                                    $filter: {
                                        input: "$participantUsersId",
                                        as: "user",
                                        cond: {
                                            $eq: ["$$user", findUser._id]
                                        }
                                    }
                                }
                            }
                        }
                    },
                    chatUserId: {
                        $cond: {
                            if: {
                                $eq: ["$isGroup", true]
                            },
                            then: {
                                $let: {
                                    vars: {
                                        userData: {
                                            $filter: {
                                                input: "$groupUsers",
                                                as: "users",
                                                cond: {
                                                    $ne: ["$$users.userId", findUser._id]
                                                }
                                            }
                                        }
                                    },
                                    in: "$$userData.userId"
                                }
                            },
                            else: {
                                $first: {
                                    $filter: {
                                        input: "$participantUsersId",
                                        as: "user",
                                        cond: {
                                            $ne: ["$$user", findUser._id]
                                        }
                                    }
                                }
                            }
                        }
                    },
                    groupId: {
                        $cond: {
                            if: {
                                $eq: ["$isGroup", true]
                            },
                            then: "$_id",
                            else: "$$REMOVE"
                        }
                    }
                }
            },
            {
                $lookup: {
                    from: "users",
                    localField: "chatUserId",
                    foreignField: "_id",
                    as: "chatUser"
                }
            },
            {
                $addFields: {
                    profilePhoto: {
                        $switch: {
                            branches: [
                                {
                                    case: { $ne: ["$isGroup", true] },
                                    then: { $first: "$chatUser.profilePhoto" }
                                }
                            ],
                            default: "$$REMOVE"
                        }
                    },
                    name: { $first: "$chatUser.name" },
                    message: {
                        $cond: {
                            if: { $eq: ["$lastMessages.lastSenderUserId", "$appUserId"] },
                            then: {
                                $cond: {
                                    if: {
                                        $eq: ["$isGroup", true]
                                    },
                                    then: {
                                        $concat: ["✓ You : ", "$lastMessages.message"]
                                    },
                                    else: {
                                        $concat: ["✓ ", "$lastMessages.message"]
                                    }
                                }

                            },
                            else: {
                                $cond: {
                                    if: {
                                        $eq: ["$isGroup", true]
                                    },
                                    then: {
                                        $let: {
                                            vars: {
                                                lastMsgMtchUser: {
                                                    $first: {
                                                        $filter: {
                                                            input: "$chatUser",
                                                            cond: {
                                                                $eq: ["$$this._id", "$lastMessages.lastSenderUserId"]
                                                            }
                                                        }
                                                    }
                                                },
                                            },
                                            in: { $concat: ["$$lastMsgMtchUser.name", " : ", "$lastMessages.message"] }
                                        }
                                    },
                                    else: "$lastMessages.message"
                                }
                            }
                        }
                    },
                    date: "$lastMessages.date"
                }
            },
            {
                $group: {
                    _id: "$appUserId",
                    userContacts: {
                        $push: {
                            chatUserId: {
                                $cond: {
                                    if: {
                                        $ne: ["$isGroup", true]
                                    },
                                    then: "$chatUserId",
                                    else: "$$REMOVE"
                                }
                            },
                            groupId: "$groupId",
                            // {
                            //   $cond:{
                            //     if:{
                            //       $eq:["$isGroup",true]
                            //     },
                            //     then:"$groupId",
                            //     else:"$$REMOVE"
                            //   }
                            // },
                            profilePhoto: "$profilePhoto",
                            groupProfilePhoto: "$groupProfilePhoto",
                            name: {
                                $cond: {
                                    if: {
                                        $ne: ["$isGroup", true]
                                    },
                                    then: "$name",
                                    else: "$$REMOVE"
                                }
                            },
                            groupName: "$groupName",
                            message: "$message",
                            date: "$date"
                        }
                    }
                }
            },
            {
                $project: {
                    _id: 0,
                    appUserId: "$_id",
                    userContacts: {
                        $sortArray: {
                            input: "$userContacts",
                            sortBy: { date: -1 }
                        }
                    }
                }
            }
        ])

        res.status(200).json({
            status: true,
            userAllContacts
        })

    } catch (error) {
        console.error("==>", error);
        res.status(500).json({
            error: error.message
        })
    }
}

exports.userMessageDelete = async (req, res, next) => {
    try {
        const appUserId = req.params.appUserId
        const { chatUserId, groupId } = req.body

        const validateResult = await joi.messageDelete.validateAsync(req.body)

        let usersId = [appUserId, validateResult?.chatUserId]
        console.log("groupId===>", groupId);

        if (!groupId) {
            const findUser = await userModel.find({ _id: { $in: usersId } })
            if (findUser?.length <= 0) return res.status(404).json({ message: "Both UserId is Not found" })
            // console.log("findUser===>", findUser);

            let data = usersId?.filter(id => !findUser.some(user => user._id == id))
            if (data?.length > 0) return res.status(404).json({
                id: data[0],
                message: "This User Is Not Found"
            })
        }

        const messageDelete = await userChatModel.aggregate([
            // {
            //     $match: {
            //         participantUsersId: {
            //             $all: [new ObjectId(appUserId), new ObjectId(validateResult?.chatId)]
            //         }
            //     }
            // },
            {
                $match: {
                    $or: [
                        {
                            participantUsersId: {
                                $all: [new ObjectId(appUserId), new ObjectId(chatUserId)],
                            },
                            isGroup: {
                                $ne: ["$isGroup", true]
                            }
                        },
                        {
                            groupUsers: {
                                $elemMatch: {
                                    userId: new ObjectId(appUserId)
                                }
                            },
                            _id: new ObjectId(groupId),
                            isGroup: true
                        }
                    ]
                }
            },
            {
                $addFields: {
                    textMessage: {
                        $map: {
                            input: "$textMessage",
                            as: "mesage",
                            in: {
                                $cond: {
                                    if: {
                                        $eq: ["$$mesage._id", new ObjectId(validateResult?.messageId)]
                                    },
                                    then: {
                                        $cond: {
                                            if: {
                                                $eq: ["$$mesage.userId", new ObjectId(appUserId)]
                                            },
                                            then: {
                                                $switch: {
                                                    branches: [
                                                        {
                                                            case: { $eq: ["Delete For EveryOne", validateResult?.messageDeleteType] },
                                                            then: {
                                                                $setField: {
                                                                    field: "deleteEveryOne",
                                                                    input: "$$mesage",
                                                                    value: true
                                                                }
                                                            }
                                                        },
                                                        {
                                                            case: { $eq: ["Delete For Me", validateResult?.messageDeleteType] },
                                                            then: {
                                                                $setField: {
                                                                    field: "deleteOne",
                                                                    input: "$$mesage",
                                                                    value: true
                                                                }
                                                            }
                                                        }
                                                    ]
                                                }
                                            },
                                            // else: "This messageId appUserId is Not Match"
                                            else: "$$mesage"
                                        }
                                    },
                                    else: "$$mesage"
                                }
                            }
                        }
                    }
                }
            },
            {
                $addFields: {
                    lastMessages: {
                        $let: {
                            vars: {
                                lastMsg: {
                                    $filter: {
                                        input: "$textMessage",
                                        as: "msg",
                                        cond: {
                                            $eq: ["$$msg.deleteOne", false]
                                        }
                                    }
                                }
                            },
                            in: {
                                $let: {
                                    vars: {
                                        allMsg: {
                                            $map: {
                                                input: "$$lastMsg",
                                                as: "msag",
                                                in: {
                                                    $cond: {
                                                        if: {
                                                            $eq: ["$$msag.deleteEveryOne", true]
                                                        },
                                                        then: "This Message Deleted EveryOne",
                                                        else: "$$msag"
                                                    }
                                                }
                                            }
                                        }
                                    },
                                    in: {
                                        lastSenderUserId: { $last: "$$allMsg.userId" },
                                        message: { $last: "$$allMsg.message" },
                                        date: { $last: "$$allMsg.date" },
                                    }
                                }
                            }
                        }
                    }
                }
            },
            {
                $merge: {
                    into: 'user_chats',
                    on: '_id',
                    whenMatched: 'replace',
                    whenNotMatched: 'insert'
                }
            }
        ])

        res.status(200).json({
            status: true,
            message: `Message ${validateResult?.messageDeleteType} SuccessFully`
        })

    } catch (error) {
        console.error("==>", error);
        res.status(500).json({
            error: error.message
        })
    }
}

exports.messageEdit = async (req, res, next) => {
    try {
        const appUserId = req.params.appUserId
        // const validateResult = await joi.messageEdit.validateAsync(req.body)

        let usersId = [appUserId, req.body.chatUserId]
        const findUser = await userModel.find({ _id: { $in: usersId } })
        if (findUser?.length <= 0) return res.status(404).json({ message: "Both UserId is Not found" })
        // console.log("findUser===>", findUser);

        let data = usersId?.filter(id => !findUser.some(user => user._id == id))
        if (data?.length > 0) return res.status(404).json({
            id: data[0],
            message: "This User Is Not Found"
        })

        const findUsers = await userChatModel.findOne(
            {
                participantUsersId: {
                    $all: [appUserId, req.body?.chatUserId]
                }
            }
        )
        if (findUsers === null) return res.status(404).json({
            message: "appUser and chatUser chat is not found "
        })

        const findMessage = await userChatModel.findOne(
            { _id: findUsers._id, },
            {
                "textMessage": {
                    $filter: {
                        input: "$textMessage",
                        as: "msg",
                        cond: {
                            $and: [
                                {
                                    $eq: ["$$msg._id", new ObjectId(req.body.messageId)]
                                },
                                {
                                    $and: [
                                        { $eq: ["$$msg.deleteOne", false] },
                                        { $eq: ["$$msg.deleteEveryOne", false] }
                                    ]
                                }
                            ]
                        }
                    }
                }
            }
        )
        if (findMessage?.textMessage.length <= 0) {
            return res.status(404).json({ message: "messageId is not found" })
        }
        console.log("findMessage===>", findMessage.textMessage);

        let msgUser = findMessage?.textMessage.filter(val => val.userId == appUserId)
        if (msgUser?.length <= 0) {
            return res.status(404).json({
                status: false,
                message: "appUserId and messageId is Not found same Object"
            })
        }
        console.log("==>", msgUser);

        const msgEdit = await userChatModel.findOneAndUpdate(
            {
                _id: findUsers._id,
                textMessage: {
                    $elemMatch: {
                        _id: msgUser[0]._id,
                    }
                }
            },
            {
                $set: {
                    "textMessage.$.message": req.body.message
                }
            },
            { new: true }
        )

        const [findLastMessage] = await userChatModel.aggregate([
            {
                $match: { _id: msgEdit._id }
            },
            {
                $project: {
                    lastMessageSender: { $last: "$textMessage" }
                }
            }
        ])
        console.log("findLastMessage===>", findLastMessage);

        let lastMsg = await userChatModel.findOneAndUpdate(
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

        res.status(200).json({
            status: true,
            msgEdit: lastMsg
        })

    } catch (error) {
        console.error("==>", error);
        res.status(500).json({
            error: error.message
        })
    }
}

/* ------------- user Group Apis ---------- */
exports.userCreateGroup = async (req, res, next) => {
    try {
        const userId = req.params.userId
        const findUser = await userModel.findById(userId)
        console.log("findUser===>", findUser);
        if (!findUser) return res.status(404).json({ message: "This User is Not found" })

        // const validateResult = await joi.userGroupSchema.validateAsync(req.body)

        let groupProfilePhoto = req?.file?.filename
        // console.log("groupProfilePhoto===>", groupProfilePhoto);

        let groupCreate = await userChatModel.create({
            groupProfilePhoto: groupProfilePhoto,
            groupName: req.body?.groupName,
            groupUsers: [
                {
                    profilePhoto: findUser.profilePhoto,
                    userId: userId,
                    admin: true
                }
            ],
            isGroup: true
        })

        groupCreate = await userChatModel.findByIdAndUpdate(
            { _id: groupCreate._id },
            {
                $unset: {
                    participantUsersId: 1
                }
            },
            { new: true }
        )

        /* const groupCreate = await userGroupSchema.create({
            groupProfilePhoto: groupProfilePhoto,
            groupName: validateResult?.groupName,
            groupUsers: [
                {
                    profilePhoto: findUser.profilePhoto,
                    userId: userId,
                    admin: true
                }
            ]
        }) */

        res.status(200).json({
            status: true,
            groupCreate
        })

    } catch (error) {
        console.error("==>", error);
        res.status(500).json({
            error: error.message
        })
    }
}

exports.usersJoinedGroup = async (req, res, next) => {
    try {
        // const adminUserId = req.body.adminUserId
        // const { groupId, adminUserId, joinUserId } = req.body
        const validateResult = await joi.groupJoinUser.validateAsync(req.body)

        const findUser = await userModel.findById(validateResult?.adminUserId)
        if (!findUser) return res.status(404).json({ message: "This adminUserId is Not found" })

        const findGroupId = await userChatModel.find(
            {
                _id: validateResult?.groupId,
                isGroup: true
            }
        )
        if (findGroupId?.length <= 0) return res.status(404).json({ message: "GroupId is Not Found" })
        console.log("findGroupId==>", findGroupId._id);

        const findUserAdmin = await userChatModel.findOne({
            _id: findGroupId[0]._id,
            groupUsers: {
                $elemMatch: {
                    userId: validateResult?.adminUserId,
                    admin: true
                }
            }
        })
        if (findUserAdmin?.length <= 0) return res.status(404).json({ message: "This adminUserId User is Not Admin" })
        // console.log("findUserAdmin===>", findUserAdmin);

        const findJoinUser = await userModel.findById(validateResult?.joinUserId)
        if (!findJoinUser) return res.status(404).json({ message: "This joinUserId is Not found" })
        console.log("findJoinUser===>", findJoinUser);

        const userJoin = await userChatModel.findByIdAndUpdate(
            { _id: findGroupId[0]._id },
            {
                $push: {
                    groupUsers: {
                        profilePhoto: findJoinUser.profilePhoto,
                        userId: findJoinUser._id
                    }
                }
            },
            { new: true }
        )

        // console.log("findUserAdmin===>", findUserAdmin);
        res.status(200).json({
            status: true,
            userJoin
        })

    } catch (error) {
        console.error("==>", error);
        res.status(500).json({
            error: error.message
        })
    }
}




// redish



