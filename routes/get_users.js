//get data of all friends from User model friends list and replace with user id name and email

const verify_auth = require('../middleware/verify_auth');
const Express = require("express");
const router = Express.Router();
const {User} = require("../models/user_model")

router.post("/", verify_auth, async (request, response) => {
    const userId = request.user._id

    try {
        const user = await User.findById(userId)

        //return all friends who are not blocked
        const friends = user.friends.filter(friend => !friend.block)

        const friendsList = await Promise.all(friends.map(async friend => {
            const friendData = await User.findById(friend.userID)
            return {
                userID: friendData._id,
                name: friendData.name,
                email: friendData.email
            }
        }))
        

        console.log(friends)
        return response.status(200).send(friendsList)
    }
    catch (e) {
        return response.status(412).send(e)
    }

})

module.exports = router;
