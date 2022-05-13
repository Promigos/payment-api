const Express = require("express");
const router = Express.Router();
const emailValidator = require("email-validator");
const {User, generateKey} = require("../models/user_model");
const nodemailer = require("nodemailer");

function sendPasswordCode(email, code, response) {
    try {
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
            from: process.env.EMAIL,
            to: email,
            subject: "Password change code",
            text: "To change your password, use this code in the forgot password section: " + code

        }

        transporter.sendMail(mailOptions, function (error, info) {
            if (error) {
                console.log(error);
                return response.status(500).send({
                    message: "Failed to send confirmation mail",
                    error: error
                })
            } else {
                console.log('Email sent: ' + info.response);
                return response.status(200).send({
                    message: "Conformation mail sent successfully"
                })
            }
        });
    } catch (e) {
        console.log(e)
        return response.status(500).send({
            message: "Failed to send confirmation mail",
            error: e
        })
    }
}

router.post("/", async (request, response) => {

    const email = request.body.email

    if (!email) {
        return response.status(400).send({
            message: "Email is required"
        });

    } else if (!emailValidator.validate(email)) {
        return response.status(400).send({
            message: "Email is invalid"
        });
    }

    const checkExistingUser = await User.findOne({
        email: email,
    });

    if (!checkExistingUser)
        return response.status(400)
            .send({
                message: "User with this email does not exist"
            });

    let verificationKey = generateKey()
    checkExistingUser.forgotPasswordCode = verificationKey

    await checkExistingUser.save()
        .then(user => sendPasswordCode(email, verificationKey, response))
        .catch(err => {
            return response.status(400).send({
                message: "Failed to send confirmation mail",
                error: err
            })
        })


})

module.exports = router
