//TODO: ADD FUNDS, DEDUCT FUNDS and TRANSFER FUNDS

//import routes and create post route
const router = require('express').Router();
const requestBank = require('request');
const verify_auth = require('../middleware/verify_auth');
const {User} = require("../models/user_model");

//create route called"addFunds" with verify_auth middleware
router.post('/addFunds', verify_auth, async (request, response) => {
    //get user id from request
    const userId = request.user._id;
    //get amount from request
    const amount = request.body.amount;

    //get account
    let account = request.body.account;

    //validate data
    if (!amount) {
        return response.status(400).send("Please fill in all fields");
    }

    //validate amount
    if (amount < 0) {
        return response.status(400).send("Please enter a valid amount");
    }

    //get user
    const user = await User.findById(userId);
    console.log(user)

    //check if account is empty
    if (account === "") {
        //if account is empty use default account
        account = user.defaultAccount;
    }

    //get account from user using account
    const userAccount = user.accounts.find(acc => acc.account === account);
    console.log(userAccount)

    if (!userAccount) {
        return response.status(400).send("Account does not exist");
    }


    //make post request to  process.env.BANK_URL + '/addAmount', body has account, cvv, expiry, amount
    console.log(process.env.BANK_URL + '/bank/deductAmount')
    requestBank.post({
        url: process.env.BANK_URL + '/bank/deductAmount',
        json: {
            account: userAccount.account,
            cvv: userAccount.cvv,
            expiry: userAccount.expiry,
            amount: amount
        }
    }, (error, res, body) => {
        if (error) {
            return response.status(400).send("Error connecting to bank");
        }
        if (body.error) {
            return response.status(400).send("ERR");
        }
        //if res code is 200, add the funds to the user's walletBalance
        console.log(res.statusCode)
        if (res.statusCode === 200) {
            user.walletBalance += amount;
            user.save().then((data) => {
                    return response.status(200).send("Funds added" );
                }
            ).catch((e) => {
                console.log(e,"ERR")
                    return response.status(400).send("ERRR");
                }
            );
        }
        else {
            return response.status(400).send(body);
        }
    });


});

router.post('/removeFunds', verify_auth, async (request, response) => {
    //get user id from request
    const userId = request.user._id;
    //get amount from request
    const amount = request.body.amount;

    //get account
    let account = request.body.account;

    //validate data
    if (!amount) {
        return response.status(400).send("Please fill in all fields");
    }

    //validate amount
    if (amount < 0) {
        return response.status(400).send("Please enter a valid amount");
    }

    //get user
    const user = await User.findById(userId);

    //check if account is empty
    if (account ==="") {
        //if account is empty use default account
        account = user.defaultAccount;
    }

    //get account from user using account
    const userAccount = user.accounts.find(acc => acc.account === account);
    console.log(user)

    if (!userAccount) {
        return response.status(400).send("Account does not exist");
    }


    //make post request to  process.env.BANK_URL + '/addAmount', body has account, cvv, expiry, amount
    console.log(process.env.BANK_URL + '/bank/addAmount')
    requestBank.post({
        url: process.env.BANK_URL + '/bank/addAmount',
        json: {
            account: userAccount.account,
            cvv: userAccount.cvv,
            expiry: userAccount.expiry,
            amount: amount
        }
    }, (error, res, body) => {
        if (error) {
            return response.status(400).send("Error connecting to bank");
        }
        if (body.error) {
            return response.status(400).send(body.error);
        }
        //if res code is 200, add the funds to the user's walletBalance
        if (res.statusCode === 200) {
            if (user.walletBalance < amount) {
                return response.status(400).send("Insufficient funds");
            }
            user.walletBalance -= amount;
            user.save().then((data) => {
                    return response.status(200).send("Funds deducted" );
                }
            ).catch((e) => {
                    return response.status(400).send(e);
                }
            );
        }
        else {
            return response.status(400).send(body);
        }
    });


});

router.post('/transferAmount', verify_auth, async (request, response) => {

    const userId = request.user._id
    const receiverId = request.body.receiverId //List of all users to transfer funds to
    const amount = request.body.amount
    let account = request.body.account
    let splitAmount = request.body.splitAmount

    //validate receiverId
    if (!receiverId) {
        return response.status(400).send("Please fill in receiver ids");
    }

    //check if receiver id id is list
    if (!Array.isArray(receiverId)) {
        return response.status(400).send("PReceiver array is not an array, attach an array of users");
    }

    //validate data
    if (!amount) {
        return response.status(400).send("Please fill in all fields");
    }

    //validate amount
    if (amount < 0) {
        return response.status(400).send("Please enter a valid amount");
    }

    //get user
    console.log(userId,"userId")
    const user = await User.findById(userId);
    console.log(user)

    //check if account is empty
    if (account ==="") {
        //if account is empty use default account
        account = user.defaultAccount;
    }

    console.log(user)
    //get account from user using account
    const userAccount = user.accounts.find(acc => acc.account === account);
    console.log(userAccount)

    if (!userAccount) {
        return response.status(400).send("Account does not exist");
    }

    let finalPaymentAmount = amount
    let finalDeductionAmount = amount * receiverId.length

    if (splitAmount) {
        finalPaymentAmount = finalPaymentAmount / receiverId.length
        console.log(finalPaymentAmount, splitAmount, receiverId.length, splitAmount / receiverId.length)
        finalDeductionAmount = amount
    }

    //iterate receiverId and check database for each user and also check if id is not of same user
    for (let i = 0; i < receiverId.length; i++) {
        try{
            const receiver = await User.findById(receiverId[i]);
            if (!receiver || receiverId[i] === userId) {
                return response.status(400).send("Invalid receiver found");
            }
        }
        catch (e){
            return response.status(400).send("Invalid receiver found, please check user ID");
        }
    }

    //iterate and update each user funds with finalPaymentAmount
    for (let i = 0; i < receiverId.length; i++) {
        const receiver = await User.findById(receiverId[i]);
        receiver.walletBalance += finalPaymentAmount;
        receiver.save()
            .catch((e) => {
                    return response.status(400).send(e);
                }
            );
    }

    //deduct finalDeductionAmount from user
    user.walletBalance -= finalDeductionAmount;
    user.save().then((data) => {
            return response.status(200).send("Funds deducted and transferred to all users" );
        }
    ).catch((e) => {
            return response.status(400).send(e);
        }
    );
})

//TODO: Add request money from other users

module.exports = router
