const verify_auth = require('../middleware/verify_auth');
const Express = require("express");
const jwt = require("jsonwebtoken");
const router = Express.Router();
const {User} = require("../models/user_model");

//import chat list model
const {ChatListModel} = require("../models/chat_list");

router.post("/", verify_auth, async (request, response) => {

    const userId = request.user._id
    const signedToken = request.body.token

    if (!signedToken) {
        return response.status(400).send({message: "Attach Token"})
    }

    try {
        const decodedToken = jwt.verify(signedToken, process.env.JWT_SECRET_KEY);
        console.log(userId, decodedToken)

        if (userId === decodedToken._id) {
            return response.status(400).send({message: "Please don't scan yourself"})
        } else {
            const user = await User.findById(userId)

            const otherUser = await User.findById(decodedToken._id)

            if (user.friends.some(friend => friend.userID === decodedToken._id)) {
                return response.status(400).send({
                    message: "Already scanned",
                    userName: otherUser.name,
                    id: otherUser.id,
                    email: otherUser.email,
                    phoneNumber: otherUser.phoneNumber
                })
            } else {
                const newChatListModel = new ChatListModel({})
                await newChatListModel.save().then(async (chatListModel) => {
                    user.friends.push({userID: decodedToken._id, chatListID: chatListModel._id})
                    await user.save()
                    otherUser.friends = otherUser.friends.filter(friend => friend.userID !== userId)
                    otherUser.friends.push({userID: userId, chatListID: chatListModel._id})
                    await otherUser.save()
                })
                return response.status(200).send({
                    message: "Scanned",
                    userName: otherUser.name,
                    id: otherUser.id,
                    email: otherUser.email,
                    phoneNumber: otherUser.phoneNumber
                })
            }
        }

    } catch (e) {
        return response.status(400).send({message: "Invalid token", error: e})

    }


});

module.exports = router;
