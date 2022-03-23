const mongoose = require("mongoose");
require("dotenv").config();

const BankAccountSchema = new mongoose.Schema({

    account: {
        type: Number,
        required: true,
    },
    cvv: {
        type: String,
        default: Date.now,
    },
    expiry: {
        type: String,
        required: true,
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },


});

module.exports = BankAccountSchema


