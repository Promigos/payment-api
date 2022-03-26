const Express = require("express");
const router = Express.Router();
const { User } = require("../models/user_model");
const verify_auth = require('../middleware/verify_auth');

module.exports = router.post("/", verify_auth, async (request, response) => {

    //send response list of all bank account numbers of all users
    const id = request.user._id

    console.log(request.body)

    User.findById(id).then(user => {
        if (!user) {
            return response.status(404).send("User not found");
        }
        const accountsList = [];
        for (let i = 0; i < user.accounts.length; i++) {
            accountsList.push(user.accounts[i].account);
        }
        response.send({
            data: accountsList
        })
    }).catch(err => {
        response.status(500).send({
            message: err.message || "Some error occurred while retrieving bank accounts."
        });
    })

});



