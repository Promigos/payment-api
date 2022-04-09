const express = require('express')
const router = express.Router()
const middleware = require("../middleware/verify_auth")
const {User} = require("../models/user_model");

router.post("/", middleware, (req, res) => {
    const userId = req.user._id;


    const token = req.body.token

    if (!token) return res.status(400).send({message: "Please attach token"})

    User.findById(userId, (err, user) => {

        if (!user) return res.status(412).send({message: "User not found"})

        user.firebaseToken = token
        user.save().then((data) => {
            return res.status(200).send({message: "Set token successfully", user: data})

        }).catch((e) => {
            return res.status(400).send({message: "Something went wrong", error: e})
        })


    })
})

module.exports = router
