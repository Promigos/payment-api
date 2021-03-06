const Express = require("express");
const router = Express.Router();
const {UserTemporary, generateKey, User} = require("../models/user_model");
const bcrypt = require("bcrypt");
const {passwordStrength} = require('check-password-strength')
const emailValidator = require("email-validator");
const nodemailer = require("nodemailer");
const {getAuth} = require("firebase-admin/auth");

function sendMailToUser(host, id, email, response, user) {
    try {
        let link = "https://" + host + "/verifyEmail?id=" + id + "&email=" + email;

        const transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 465,
            secure: true, // use SSL
            auth: {
                user: process.env.EMAIL,
                pass: process.env.PASSWORD
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
                return response.status(500).send({message: error});
            } else {
                console.log('Email sent: ' + info.response);
                return response.status(200).send({message: "Verification mail has been sent, please check your mail. The link will be valid for the next five minutes"})
            }
        });
    } catch (e) {
        console.log(e)
        user.remove().then(r => console.log(r, "Failed to remove temporary instance"));
        return response.status(500).send({message: e});
    }
}

module.exports = router.post("/", async (request, response) => {

    const email = request.body.email
    const name = request.body.name
    const password = request.body.password
    //TODO: Validate data

    // const phoneNumber = request.body.phoneNumber
    const countryCode = request.body.countryCode
    const userLocation = request.body.userLocation
    const phoneValidationJWT = request.body.phoneValidationJWT //TODO: User firebase_admin

    console.log(request.body)

    if (!phoneValidationJWT) {
        response.status(400).send({message: "Please attach JWT"})
    }

    if (!password) {
        return response.status(400).send({message: "Please enter a password"})
    }

    if (!email) {
        return response.status(400).send({message: "Please enter an email"})

    } else if (!emailValidator.validate(email)) {

        return response.status(400).send({message: "Please enter a valid email"})
    }

    if (!countryCode) {
        return response.status(400).send({message: "Please enter a country code"})
    }
    if (!userLocation) {
        return response.status(400).send({message: "Please enter a location"})

    }
    if (!name) {
        return response.status(400).send({message: "Please enter a name"})

    } else if (name.length < 3) {
        return response.status(400).send({message: "Name is too short"})

    } else if (/\d/.test(name)) {
        return response.status(400).send({message: "Name cannot have numbers"})
    }

    try {
        getAuth()
            .verifyIdToken(phoneValidationJWT)
            .then(async (decodedToken) => {

                const userID = decodedToken.uid;
                const phoneNumber = decodedToken.phone_number

                const checkExistingUser = await User.findOne({
                    email: email,
                });

                const checkExistingUserTemporary = await UserTemporary.findOne({
                    email: email,
                });

                if (checkExistingUser) return response.status(400)
                    .send({message: "User already exists"});
                if (checkExistingUserTemporary) {
                    return response.status(400).send({message: "User already exists"});
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
                    .then(user => sendMailToUser("wallet-up-api.herokuapp.com", verificationToken, email, response, user))
                    .catch(err => {
                        return response.status(500).send({message: err})
                    })

            })
            .catch((error) => {
                console.log(error);
                //return error
                response.status(400).json({
                    message: "Invalid firebase token",
                });
            });
    } catch (e) {
        response.status(400).send({message: "Something went wrong", error: e})
    }


})



