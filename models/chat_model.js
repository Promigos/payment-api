const mongoose = require("mongoose");
require("dotenv").config();

const ChatSchema = new mongoose.Schema({

    message: {
        type: String,
        required: true,
    },
    date: {
        type: Date,
        default: Date.now,
    },
    sender: {
        type: String,
        required: true,
    },
    receiver: {
        type: String,
        required: true,
    },

});

module.exports = ChatSchema


