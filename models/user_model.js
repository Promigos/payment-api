const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");

function generateKey() {
    let text = "";
    const possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for (let i = 0; i < 64; i++)
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    return text
}

const UserSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true,
    },
    ///Firebase USER ID
    userID: {
        type: String,
        required: true,
        unique: true,
    },
    name: {
        type: String,
        required: true,
    },
    countryCode: {
        type: Number,
        required: true,
    },
    userLocation: {
        type: [Number],
        required: true,
    },
    password: {
        type: String,
        required: true,
    },
    phoneNumber: {
        type: String,
        required: true,
    },
    defaultAccount: {
        type: String,
    },
    verificationKey: {
        type: String,
        required: true
    },
    forgotPasswordCode: {
        type: String,
    },
    dateRegistered: {
        type: Date,
        default: Date.now,
    },
});

const UserTemporarySchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true,
    },
    userID: {
        type: String,
        required: true,
        unique: true,
    },
    createdAt: {type: Date, expires: "15m", default: Date.now},
    name: {
        type: String,
        required: true,
    },
    countryCode: {
        type: Number,
        required: true,
    },
    userLocation: {
        type: [Number],
        required: true,
    },
    password: {
        type: String,
        required: true,
    },
    phoneNumber: {
        type: String,
        required: true,
    },
    defaultAccount: {
        type: String,
    },
    dateRegistered: {
        type: Date,
        default: Date.now,
    },
    emailVerificationToken: {
        type: String,
        required: true,
        unique: true
    }
});

UserSchema.methods.GenerateJwtToken = function () {
    return jwt.sign(
        {_id: this._id, userID: this.userID, verificationKey: this.verificationKey},
        process.env.JWT_SECRET_KEY
    );
};

module.exports = {
    User: mongoose.model("User", UserSchema),
    UserTemporary: mongoose.model("UserTemporary", UserTemporarySchema),
    generateKey: generateKey
};


