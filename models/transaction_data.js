const mongoose = require("mongoose");
require("dotenv").config();

const TransactionSchema = new mongoose.Schema({

    date: {
        type: Date,
        default: Date.now,
    },
    sender: {
        type: String,
    },
    receiver: {
        type: String,
    },
    amount: {
        type: Number,
        required: true,
        default: 0
    },
    type: {
        type: String,
        required: true,
    },

});

module.exports = TransactionSchema


