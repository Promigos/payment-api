const Express = require("express");
const VerifyAuth = require("../middleware/verify_auth");
const { User } = require("../models/user_model");
const bcrypt = require("bcrypt");
const router = Express.Router();

router.post("/", VerifyAuth, async (request, response) => {

    //get user password
    let password = request.body.password

    if (!password) {
        return response.status(400).send({ message: "Please enter a password" })
    }

    User.findById(request.user._id, async function (err, user) {
        if (!err) {

            const passwordCheck = await bcrypt.compare(
                request.body.password,
                user.password
            );
            if (!passwordCheck)
                return response.status(403).send({message: "Incorrect password"});

            return response.status(200).send({message: "Passwords match!"});


        } else {

            return response.status(500).send({
                message: "Failed to fetch user",
                error: err
            })
        }
    });
});

module.exports = router;
