const Express = require("express");
const bcrypt = require("bcrypt");
const router = Express.Router();

const {User} = require("../models/user_model");
const emailValidator = require("email-validator");

router.post("/", async (request, response) => {

    let isPhoneNumber = request.body.isPhoneNumber //Boolean

    if (!isPhoneNumber) {
        if (!request.body.email) {
            return response.status(400).send({message: "Please enter an email"})

        } else if (!emailValidator.validate(request.body.email)) {
            return response.status(400).send({message: "Please enter a valid email"})
        }
    }

    if (!request.body.password) {
        return response.status(400).send({message: "Please enter a password"})
    }

    let checkIfUserAvailable
    if (!isPhoneNumber) {
        checkIfUserAvailable = await User.findOne({email: request.body.email});
    } else {
        checkIfUserAvailable = await User.findOne({phoneNumber: request.body.phoneNumber});
    }

    if (!checkIfUserAvailable)
        return response.status(400).send({message: "User does not exist"})

    const PasswordCheck = await bcrypt.compare(
        request.body.password,
        checkIfUserAvailable.password
    );
    if (!PasswordCheck)
        return response.status(403).send({message: "Incorrect password"});

    const token = checkIfUserAvailable.GenerateJwtToken();
    console.log({
        message: "Login successful",
        token: token,
        name: checkIfUserAvailable.name,
        dateRegistered: checkIfUserAvailable.dateRegistered,
        email: checkIfUserAvailable.email,
    })
    response.status(200).send({
        message: "Login successful",
        token: token,
        name: checkIfUserAvailable.name,
        dateRegistered: checkIfUserAvailable.dateRegistered,
        email: checkIfUserAvailable.email,
        id: checkIfUserAvailable.id
    });
});

module.exports = router;
