const Express = require("express");
const router = Express.Router();
const {UserTemporary, generateKey, User} = require("../models/user_model");
const bcrypt = require("bcrypt");
const {passwordStrength} = require('check-password-strength')
const emailValidator = require("email-validator");
const nodemailer = require("nodemailer");

function sendMailToUser(host, id, email, response, user) {
    try {
        let link = "http://" + host + "/verifyEmail?id=" + id + "&email=" + email;

        const transporter = nodemailer.createTransport({
            service: 'gmail', auth: {
                user: process.env.EMAIL, pass: process.env.PASSWORD
            }
        });

        let mailOptions = {
            from: "promidos.enterorist@gmail.com",
            to: email,
            subject: "Please confirm your email by clicking on this link, this link will expire in 15 minutes",
            html: "Hello,<br> Please Click on the link to verify your email.<br><a href=" + link + ">Click here to verify</a>"
        }

        transporter.sendMail(mailOptions, function (error, info) {
            if (error) {
                console.log(error);
                user.remove().then(r => console.log(r, "Failed to remove temporary instance"));
                return response.status(500).send(error)
            } else {
                console.log('Email sent: ' + info.response);
                return response.status(200).send("Verification mail has been sent, please check your mail. The link will be valid for the next five minutes")
            }
        });
    } catch (e) {
        console.log(e)
        user.remove().then(r => console.log(r, "Failed to remove temporary instance"));
        return response.status(500).send(e)
    }
}

module.exports = router.post("/", async (request, response) => {

    const email = request.body.email
    const name = request.body.name
    const password = request.body.password
    //TODO: Validate data
    const phoneNumber = request.body.phoneNumber
    const countryCode = request.body.countryCode
    const userLocation = request.body.userLocation
    const phoneValidationJWT = request.body.phoneValidationJWT //TODO: User firebase_admin
    let userID = email //TODO: Replace with Firebase ID

    //TODO: Remove error list
    const verifyPassword = passwordStrength(password)
    let errorList = []
    let errors = false

    if (!password) {
        errors = true
        errorList.push({
            type: "password", error: `Please attach password`
        })
    } else if (verifyPassword.id < 2) {
        errors = true
        errorList.push({
            type: "password",
            error: `Password strength: ${verifyPassword.value}, try setting a better password, use numbers and special characters`
        })
    }
    if (!email) {
        errors = true
        errorList.push({
            type: "email", error: `Please attach email`
        })

    } else if (!emailValidator.validate(email)) {
        errors = true
        errorList.push({
            type: "email", error: `Invalid email id`
        })

    }
    if (!phoneNumber) {
        errors = true
        errorList.push({
            type: "phone", error: `Please attach phone number`
        })
    }
    if (!countryCode) {
        errors = true
        errorList.push({
            type: "country_code", error: `Please attach country code`
        })
    }
    if (!userLocation) {
        errors = true
        errorList.push({
            type: "location", error: `Please attach location`
        })
    }
    if (!name) {
        errors = true
        errorList.push({
            type: "name", error: `Please attach name`
        })

    } else if (name.length < 3) {
        errors = true
        errorList.push({
            type: "name", error: `Name has to be at least three characters login`
        })
    }

    if (!errors) {

        const checkExistingUser = await User.findOne({
            email: email,
        });

        const checkExistingUserTemporary = await UserTemporary.findOne({
            email: email,
        });

        if (checkExistingUser) return response.status(400)
            .send([{
                type: "email" +
                    "", error: "User already exists!"
            }]);
        if (checkExistingUserTemporary) {
            return response.status(400)
                .send([{
                    type: "email", error: "Verification link already sent! "
                }]);
        }

        const salt = await bcrypt.genSalt(10);
        let hashedPassword = await bcrypt.hash(password, salt);

        let verificationToken = generateKey()

        const createNewTemporaryInstance = new UserTemporary({
            email: email,
            name: name,
            userID: userID, //TODO: Replace with Firebase ID
            phoneNumber: phoneNumber,
            countryCode: countryCode,
            userLocation: userLocation,
            password: hashedPassword,
            emailVerificationToken: verificationToken
        });


        await createNewTemporaryInstance.save()
            .then(user => sendMailToUser(request.get("host"), verificationToken, email, response, user))
            .catch(err => {
                return response.status(500).send(err)
            })

    } else {
        return response.status(500).send(errorList);
    }
})



