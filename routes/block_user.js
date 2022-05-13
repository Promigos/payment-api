const verify_auth = require('../middleware/verify_auth');
const Express = require("express");
const router = Express.Router();
const {User} = require("../models/user_model")

//block user
router.post("/", verify_auth, async (request, response) => {
    const userId = request.user._id
    const receiverID = request.body.receiverID

    if (!receiverID) {
        return response.status(400).send({message: "Attach receiver ID"})
    }

    try {
        const user = await User.findById(userId)
        const receiver = await User.findById(receiverID)

        if (!user.friends.some(friend => friend.userID === receiverID)) {
            return response.status(400).send({message: "You are not friends with this user"})
        }
        if (!receiver.friends.some(friend => friend.userID === userId)) {
            return response.status(400).send({message: "This user is not your friend"})
        }


        //check if user and receiver are already blocked
        if (user.friends.some(friend => friend.userID === receiverID && friend.block)) {
            return response.status(400).send({message: "You are already blocked with this user"})
        }

        if (receiver.friends.some(friend => friend.userID === userId && friend.block)) {
            return response.status(400).send({message: "This user is already blocked with you"})
        }

        //block user
        const userFriend = user.friends.find(friend => friend.userID === receiverID)
        userFriend.block = true
        userFriend.blockedByYou = true
        user.friends = user.friends.filter(friend => friend.userID !== receiverID)
        user.friends.push(userFriend)
        console.log(userFriend, user)
        await user.save()

        const receiverFriend = receiver.friends.find(friend => friend.userID === userId)
        receiverFriend.block = true
        receiver.friends = receiver.friends.filter(friend => friend.userID !== userId)
        receiver.friends.push(receiverFriend)
        await receiver.save()

        return response.status(200).send({message: "User blocked"})
    } catch (e) {
        console.log(e)
        return response.status(412).send({message: "Could not validate token", error: e})
    }
})

router.post("/getBlockList", verify_auth, async (request, response) => {
    const userId = request.user._id

    try {
        const user = await User.findById(userId)
        //return all friends who are not blocked
        let friends = user.friends.filter(friend => friend.block)
        friends = friends.filter(friend => friend.blockedByYou)

        console.log(friends)

        const friendsList = await Promise.all(friends.map(async friend => {
            const friendData = await User.findById(friend.userID)
            return {
                userID: friendData._id,
                name: friendData.name,
                email: friendData.email,
                phone: friendData.phoneNumber,
            }
        }))


        console.log(friends)
        return response.status(200).send(friendsList)
    } catch (e) {
        console.log(e)
        return response.status(400).send(e)
    }
})

router.post("/unblock", verify_auth, async (request, response) => {
    const userId = request.user._id
    const receiverID = request.body.receiverID

    if (!receiverID) {
        return response.status(400).send({message: "Attach receiver ID"})
    }

    try {
        const user = await User.findById(userId)
        const receiver = await User.findById(receiverID)

        if (!user.friends.some(friend => friend.userID === receiverID)) {
            return response.status(400).send({message: "You are not friends with this user"})
        }
        if (!receiver.friends.some(friend => friend.userID === userId)) {
            return response.status(400).send({message: "This user is not your friend"})
        }


        //check if user and receiver are already blocked
        if (user.friends.some(friend => friend.userID === receiverID && !friend.block)) {
            return response.status(400).send({message: "You are already unblocked with this user"})
        }

        if (receiver.friends.some(friend => friend.userID === userId && !friend.block)) {
            return response.status(400).send({message: "This user is already unblocked with you"})
        }

        //block user
        const userFriend = user.friends.find(friend => friend.userID === receiverID)
        userFriend.block = false
        userFriend.blockedByYou = false
        user.friends = user.friends.filter(friend => friend.userID !== receiverID)
        user.friends.push(userFriend)
        console.log(userFriend, user)
        await user.save()

        const receiverFriend = receiver.friends.find(friend => friend.userID === userId)
        receiverFriend.block = false
        receiver.friends = receiver.friends.filter(friend => friend.userID !== userId)
        receiver.friends.push(receiverFriend)
        await receiver.save()

        return response.status(200).send({message: "User Unblocked"})
    } catch (e) {
        console.log(e)
        return response.status(412).send({message: "Could not validate token", error: e})
    }
})


module.exports = router;
