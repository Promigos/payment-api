const verify_auth = require('../middleware/verify_auth');
const Express = require("express");
const router = Express.Router();
const {User} = require("../models/user_model");
const {ChatListModel} = require("../models/chat_list");

router.post("/", verify_auth, async (request, response) => {

    const userId = request.user._id
    const phoneNumber = request.body.phoneNumber
    const user = await User.findById(userId)

    if (phoneNumber === user.phoneNumber) {
        return response.status(400).send({
            message: "Cannot add your own number",
        })
    }

    const otherUser = await User.findOne({phoneNumber: phoneNumber})

    if (!otherUser) {
        return response.status(400).send({
            message: "User not found",
        })
    }

    if(user.friends === undefined || otherUser.friends === undefined){
        return response.status(400).send({
            message: "Something went wrong!",
        })
    }

    if (user.friends.some(friend => friend.userID === otherUser.id)) {
        return response.status(400).send({
            message: "Cannot add user",
            userName: otherUser.name,
            id: otherUser.id,
            email: otherUser.email,
            phoneNumber: otherUser.phoneNumber
        })
    } else {
        const newChatListModel = new ChatListModel({})
        await newChatListModel.save().then(async (chatListModel) => {
            user.friends.push({userID: otherUser.id, chatListID: chatListModel._id})
            await user.save()
            otherUser.friends = otherUser.friends.filter(friend => friend.userID !== userId)
            otherUser.friends.push({userID: userId, chatListID: chatListModel._id})
            await otherUser.save()
        })

        return response.status(200).send({
            message: "User added",
            userName: otherUser.name,
            id: otherUser.id,
            email: otherUser.email,
            phoneNumber: otherUser.phoneNumber
        })
    }


});

module.exports = router;
