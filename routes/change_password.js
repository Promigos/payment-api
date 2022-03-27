const express = require('express');
const router = express.Router();
const {generateKey, User} = require('../models/user_model');
const bcrypt = require("bcrypt");
const {passwordStrength} = require('check-password-strength')
const verify_auth = require('../middleware/verify_auth');

router.post("/", verify_auth, async (request, response) => {
    const id = request.user._id;
    const newPassword = request.body.newPassword;
    const currentPassword = request.body.currentPassword;

    try {

        const CheckUser = await User.findById(id);

        if (!CheckUser)
            return response.status(400).send({
                message: "User not found"
            });

        const verifyPassword = passwordStrength(newPassword)

        if (!newPassword) {
            return response.status(400).send({
                message: "Please attach a new password"
            });

        } else if (verifyPassword.id < 2) {
            return response.status(400).send({
                message: "Password is not strong enough"
            });
        }

        if (!currentPassword) {
            return response.status(400).send({
                message: "Please attach your current password"
            });
        }


        const compareCurrentPassword = await bcrypt.compare(
            currentPassword,
            CheckUser.password
        );

        const newPasswordCheck = await bcrypt.compare(
            newPassword,
            CheckUser.password
        );
        if (!compareCurrentPassword) {
            return response.status(403).send({
                message: "Current password is incorrect",
            });
        } else if (newPasswordCheck) {
            return response.status(400).send({
                message: "New password cannot be the same as the current password"
            });
        } else {
            const salt = await bcrypt.genSalt(10);
            const HashedPassword = await bcrypt.hash(newPassword, salt);
            CheckUser.updateOne({
                password: HashedPassword,
                verificationKey: generateKey()
            }, async function (err, raw) {
                if (err) {
                    response.status(500).send({
                        message: "Failed to change password",
                        error: err
                    });
                }
                let updatedDoc = await User.findById(id);
                return response.status(200).send({
                    message: "Password changed successfully",
                    token: updatedDoc.GenerateJwtToken()
                });

            });
        }
    } catch (e) {
        console.log(e)
        return response.status(400).send({
            message: "Failed to change password",
            error: e
        });
    }

});

module.exports = router;
