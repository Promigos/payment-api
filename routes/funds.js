//TODO: ADD FUNDS, DEDUCT FUNDS and TRANSFER FUNDS

//import routes and create post route
const router = require('express').Router();
const requestBank = require('request');
const verify_auth = require('../middleware/verify_auth');
const {User} = require("../models/user_model");
const {ChatListModel} = require("../models/chat_list");
const {firebaseAdmin} = require("../config/firebase_config");

function sendNotification(token, title, body) {
    firebaseAdmin.messaging().send({
        notification: {
            title: title,
            body: body,
        },
        token: token,
        android: {
            priority: "high",
        },
        // Add APNS (Apple) config
        apns: {
            payload: {
                aps: {
                    contentAvailable: true,
                },
            },
            headers: {
                "apns-topic": "io.flutter.plugins.firebase.messaging", // bundle identifier
            },
        },
    }).then(r => console.log(r))
}

//create route called"addFunds" with verify_auth middleware
router.post('/addFunds', verify_auth, async (request, response) => {
    //get user id from request
    const userId = request.user._id;
    //get amount from request
    const amount = request.body.amount;

    //get account
    let account = request.body.account;

    console.log(request.body, "REQUEST")

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
    if (account === "") {
        //if account is empty use default account
        account = user.defaultAccount;
    }

    //get account from user using account
    const userAccount = user.accounts.find(acc => acc.account === account);

    if (!userAccount) {
        return response.status(400).send("Account does not exist");
    }


    //make post request to  process.env.BANK_URL + '/addAmount', body has account, cvv, expiry, amount
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
        if (res.statusCode === 200) {
            user.walletBalance += amount;
            user.save().then((data) => {
                    const token = user.firebaseToken
                    console.log("User firebase token: ", token)
                    sendNotification(token, "Funds added", `${amount} coins has been added to your account!`)
                    return response.status(200).send("Funds added");
                }
            ).catch((e) => {
                    console.log(e, "ERR")
                    return response.status(400).send("ERRR");
                }
            );
        } else {
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
    if (account === "") {
        //if account is empty use default account
        account = user.defaultAccount;
    }

    //get account from user using account
    const userAccount = user.accounts.find(acc => acc.account === account);

    if (!userAccount) {
        return response.status(400).send("Account does not exist");
    }


    //make post request to  process.env.BANK_URL + '/addAmount', body has account, cvv, expiry, amount
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
                    const token = user.firebaseToken
                    console.log("User firebase token: ", token)
                    sendNotification(token, "Funds deducted", `${amount} coins has been deducted to your account!`)
                    return response.status(200).send("Funds deducted");
                }
            ).catch((e) => {
                    return response.status(400).send(e);
                }
            );
        } else {
            return response.status(400).send(body);
        }
    });


});

router.post('/transferAmount', verify_auth, async (request, response) => {

    const userId = request.user._id
    const receiverId = request.body.receiverId //List of all users to transfer funds to
    const amount = request.body.amount
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
    const user = await User.findById(userId);

    //check if user has enough funds
    if (user.walletBalance < amount) {
        const token = user.firebaseToken
        console.log("User firebase token: ", token)
        sendNotification(token, "Insufficient funds", `Insufficient funds, please add funds to continue WalletUping' your pals!`)
        return response.status(400).send("Insufficient funds");
    }


    let finalPaymentAmount = amount
    let finalDeductionAmount = amount * receiverId.length

    if (splitAmount) {
        finalPaymentAmount = finalPaymentAmount / receiverId.length
        finalDeductionAmount = amount
    }

    //iterate receiverId and check database for each user and also check if id is not of same user
    for (let i = 0; i < receiverId.length; i++) {
        try {
            const receiver = await User.findById(receiverId[i]);
            if (!receiver || receiverId[i] === userId) {
                return response.status(400).send("Invalid receiver found");
            }
        } catch (e) {
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
    user.save().then(async (data) => {

            //add transaction to messages
            const message = {
                senderID: userId,
                //TODO: Add message to all users when multiple is implememted
                receiverID: receiverId[0],
                message: finalPaymentAmount.toString(),
                messageType: "transfer"
            }

            //get chatListID from user.friends
            const chatListID = user.friends.find(friend => friend.userID === receiverId[0]).chatListID;
            //get chatList
            const chatList = await ChatListModel.findById(chatListID);
            //add message to chatList
            chatList.chats.push(message);
            //save chatList
            chatList.save().catch((e) => {
                return response.status(400).send(e);
            })
            const token = user.firebaseToken
            console.log("User firebase token: ", token)
            sendNotification(token, "Funds transferred", `${amount} coins has been transferred successfully!!`)
            return response.status(200).send("Funds deducted and transferred to all users");
        }
    ).catch((e) => {
            console.log(e)
            return response.status(400).send(e);
        }
    );
})

router.post('/getBalance', verify_auth, async (request, response) => {

    const userId = request.user._id

    console.log(userId, "GOT DATA FROM PHONE")

    //validate receiverId
    const user = await User.findById(userId);

    if (!user) {
        console.log(user, "user not found")
        return response.status(200).send({message: "User not found"});

    } else {
        return response.status(200).send({message: "Bank balance data found", data: user.walletBalance});
    }

})

//TODO: Add request money from other users

module.exports = router

