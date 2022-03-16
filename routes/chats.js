const verify_auth = require('../middleware/verify_auth');
const Express = require("express");
const router = Express.Router();
const {User} = require("../models/user_model");
const {ChatListModel} = require("../models/chat_list");

router.post("/addChats", verify_auth, async (request, response) => {

    const userId = request.user._id
    const receiverID = request.body.receiverID
    const message = request.body.message

    if (!receiverID) {
        return response.status(400).send("Attach receiver ID")
    }

    if (!message) {
        return response.status(400).send("Attach message")
    }

    try {
        const user = await User.findById(userId)
        const receiver = await User.findById(receiverID)

        if (!user.friends.some(friend => friend.userID === receiverID)) {
            return response.status(400).send("You are not friends with this user")
        }

        if(!receiver.friends.some(friend => friend.userID === userId)) {
            return response.status(400).send("This user is not your friend")
        }


        const chatListID = user.friends.find(friend => friend.userID === receiverID).chatListID
        const chatList = await ChatListModel.findById(chatListID)

        const newChatMessage = {
            senderID: userId,
            receiverID: receiverID,
            message: message,
            time: Date.now()
        }

        chatList.chats.push(newChatMessage)
        await chatList.save()

        return response.status(200).send("Message sent")

    }

    catch (e) {
        console.log(e)
        return response.status(412).send(e)
    }
})

router.post("/getChats", verify_auth, async (request, response) => {

    const receiverID = request.body.receiverID

    if (!receiverID) {
        return response.status(400).send("Attach receiver ID")
    }

    //get chats using receiverID
    try {
        const user = await User.findById(request.user._id)
        const receiver = await User.findById(receiverID)

        if (!user.friends.some(friend => friend.userID === receiverID)) {
            return response.status(400).send("You are not friends with this user")
        }

        if(!receiver.friends.some(friend => friend.userID === request.user._id)) {
            return response.status(400).send("This user is not your friend")
        }

        const chatListID = user.friends.find(friend => friend.userID === receiverID).chatListID
        const chatList = await ChatListModel.findById(chatListID)

        return response.status(200).send(chatList.chats)

    }
    catch (e) {
        console.log(e)
        return response.status(412).send(e)
    }

})

module.exports = router;

