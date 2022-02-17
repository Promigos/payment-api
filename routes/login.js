const Express = require("express");
const bcrypt = require("bcrypt");
const router = Express.Router();

const {User} = require("../models/user_model");
const emailValidator = require("email-validator");

router.post("/", async (request, response) => {

    let isPhoneNumber = request.body.isPhoneNumber //Boolean

    if (!isPhoneNumber) {
        if (!request.body.email) {
            return response.status(400).send("Please attach email")

        } else if (!emailValidator.validate(request.body.email)) {
            return response.status(400).send("Invalid email ID")
        }
    }

    if (!request.body.password) {
        return response.status(400).send("Please attach password")
    }

    let checkIfUserAvailable
    if (!isPhoneNumber) {
        checkIfUserAvailable = await User.findOne({email: request.body.email});
    } else {
        checkIfUserAvailable = await User.findOne({phoneNumber: request.body.phoneNumber});
    }

    if (!checkIfUserAvailable)
        return response.status(400).send("User not found, check email and try again");

    const PasswordCheck = await bcrypt.compare(
        request.body.password,
        checkIfUserAvailable.password
    );
    if (!PasswordCheck)
        return response.status(403).send("Invalid password");

    const token = checkIfUserAvailable.GenerateJwtToken();
    response.status(200).send(token);
});

module.exports = router;
