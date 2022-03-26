const Express = require("express");
const router = Express.Router();
const emailValidator = require("email-validator");
const { User, generateKey } = require("../models/user_model");
const nodemailer = require("nodemailer");
const { passwordStrength } = require("check-password-strength");
const bcrypt = require("bcrypt");

function sendConfirmation(email, response) {
    try {
        const transporter = nodemailer.createTransport({
            service: 'gmail', auth: {
                user: process.env.EMAIL, pass: process.env.PASSWORD
            }
        });

        let mailOptions = {
            from: process.env.EMAIL,
            to: email,
            subject: "Password Changed",
            text: "Your password has been changed successfully"

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
                    message: "Password changed successfully"
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
    const password = request.body.password
    const forgotPasswordCode = request.body.forgotPasswordCode

    //get userdata using email
    const user = await User.findOne({ email: email });

    //return if user not found
    if (!user) {
        return response.status(404).send({
            message: "User not found"
        })
    }

    if (!email) {
        return response.status(400).send({
            message: "Email is required"
        });

    } else if (!emailValidator.validate(email)) {
        return response.status(400).send({
            message: "Email is invalid"
        });
    }

    if (!forgotPasswordCode) {
        return response.status(400).send({
            message: "Forgot password code is required"
        });
    }

    const verifyPassword = passwordStrength(password)

    if (!password) {
        return response.status(400).send({
            message: "Password is required"
        });

    } else if (verifyPassword.id < 2) {
        return response.status(400).send({
            message: "Password is weak"
        });
    }

    const checkExistingUser = await User.findOne({
        email: email,
    });

    const newPasswordCheck = await bcrypt.compare(
        password,
        user.password
    );

    //if new password is same as old password return error
    if (newPasswordCheck) {
        return response.status(400).send({
            message: "New password is same as old password"
        });
    }

    if (!checkExistingUser)
        return response.status(400)
            .send({
                message: "User does not exist"
            });

    if (checkExistingUser.forgotPasswordCode !== forgotPasswordCode)
        return response.status(400).send({
            message: "Forgot password code is invalid"
        });

    const salt = await bcrypt.genSalt(10);
    const HashedPassword = await bcrypt.hash(password, salt);
    checkExistingUser.updateOne({
        password: HashedPassword,
        verificationKey: generateKey(),
        forgotPasswordCode: ""
    }, async function (err, raw) {
        if (err) {
            response.send({
                message: "Failed to change password",
                error: err
            });
        }
        const updatedDoc = await User.findOne({
            email: email,
        });
        return response.status(200).send({
            message: "Password changed successfully",
            token: updatedDoc.GenerateJwtToken()
        });

    });

    await checkExistingUser.save()
        .then(user => sendConfirmation(email, response))
        .catch(err => {
            return response.status(500).send({
                message: err.message || "Some error occurred while changing the password"
            })
        })


})

module.exports = router
