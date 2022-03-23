//import verify_auth
const verify_auth = require('../middleware/verify_auth');
const {User} = require("../models/user_model");
const router = require('express').Router();

router.post('/addAccount', verify_auth, async (request, response) => {
    //account_model

    //get user id from request
    const userId = request.user._id;
    //get account from request
    const account = request.body.account;
    //get cvv from request
    const cvv = request.body.cvv;
    //get expiry from request
    const expiry = request.body.expiry;

    const defaultAccount = request.body.defaultAccount;

    //validate data
    if (!account || !cvv || !expiry) {
        return response.status(400).send("Please fill in all fields");
    }

    //validate account
    if (account.toString().length !== 16) {
        return response.status(400).send("Please enter a valid account number");
    }

    //validate cvv
    if (cvv.length !== 3) {
        return response.status(400).send("Please enter a valid cvv");
    }

    //validate expiry
    if (expiry.length !== 4) {
        return response.status(400).send("Please enter a valid expiry");
    }

    //get user
    const user = await User.findById(userId);
    //get user's accounts
    const accounts = user.accounts;

    //check if account already exists
    for (let i = 0; i < accounts.length; i++) {
        console.log(accounts[i])
        if (accounts[i].account === account) {
            return response.status(400).send("Account already exists");
        }
    }

    //create new account json
    const newAccount = {
        user: userId,
        account: account,
        cvv: cvv,
        expiry: expiry
    }

    //add new account to user's accounts
    accounts.push(newAccount);

    if(defaultAccount || !user.defaultAccount || user.defaultAccount === ""){
        user.defaultAccount = account;
    }

    //save user
    await user.save().then(() => {
        return response.status(200).send(user);
    }
    ).catch(error => {
        return response.status(500).send(error);
    }
    );
});

module.exports = router



