const mongoose = require("mongoose");

// const userChatSchema = new mongoose.Schema({
//     senderId:{
//         type:mongoose.Schema.Types.ObjectId,
//         ref:'user'
//     },
//     message:{
//         type:String
//     },
//     receverId:{
//         type:mongoose.Schema.Types.ObjectId,
//         ref:'user'
//     }
// },{
//     timestamps:true
// })

const userChatSchema = new mongoose.Schema({
    participantUsersId: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user'
    }],
    groupProfilePhoto: {
        type: String
    },
    groupName: {
        type: String
    },
    groupUsers: [
        {
            profilePhoto: {
                type: String
            },
            userId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "user"
            },
            admin: {
                type: Boolean,
                default: false
            }
        }
    ],
    lastMessages: {
        lastSenderUserId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'user'
        },
        message: {
            type: String
        },
        date: {
            type: Date,
            default: Date.now
        }
    },
    textMessage: [{
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'user'
        },
        message: {
            type: String,
            required: true
        },
        viewOnce: {
            type: Boolean,
            default: false
        },
        date: {
            type: Date,
            default: Date.now
        },
        deleteOne: {
            type: Boolean,
            default: false
        },
        deleteEveryOne: {
            type: Boolean,
            default: false
        }
    }],
    isGroup: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
})


// const userChatSchema = new mongoose.Schema({
//     userId: {
//         type: mongoose.Schema.Types.ObjectId,
//         ref: 'user'
//     },
//     userContacts: [
//         {
//             usersId: [{
//                 type: mongoose.Schema.Types.ObjectId,
//                 ref: 'user'
//             }],
//             textMessage: [
//                 {
//                     userId: {
//                         type: mongoose.Schema.Types.ObjectId,
//                         ref: 'user'
//                     },
//                     message: {
//                         type: String
//                     },
//                     Date: {
//                         type: Date,
//                         default: Date.now
//                     }
//                 }
//             ]
//         }
//     ],
// }, {
//     timestamps: true
// })

const userChatModel = mongoose.model('user_chat', userChatSchema);
module.exports = userChatModel