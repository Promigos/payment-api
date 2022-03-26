const Express = require("express");
const VerifyAuth = require("../middleware/verify_auth");
const {User} = require("../models/user_model");
const router = Express.Router();

router.post("/", VerifyAuth, async (request, response) => {
    User.findById(request.user._id, function (err, user) {
        if (!err) {
            //send the user data
            return response.status(200).send({
                message: "Token is valid",
                data: {
                    name: user.name,
                    email: user.email,
                    userId: user.userId,
                    dateRegistered: user.dateRegistered
                }
            })
        } else {

            return response.status(500).send({
                message: "Failed to fetch user",
                error: err
            })
        }
    });
});

module.exports = router;
