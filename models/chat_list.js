const mongoose = require("mongoose");
require("dotenv").config();

//require chat model
const {ChatsModel} = require("./chat_model");

const ChatListSchema = new mongoose.Schema({

    chats: {
        type: [ChatsModel],
    },

});

module.exports = {
    ChatListModel: mongoose.model("ChatList", ChatListSchema),
};


