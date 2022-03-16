const jwt = require("jsonwebtoken");
const {User} = require("../models/user_model");
require("dotenv").config();

module.exports = async (req, res, next) => {

    const receiveToken = req.header("user-auth-token");
    if (!receiveToken) {
        return res.status(412).json({
            message: "Please attach request token"
        });
    }

    try {
        const decodedToken = jwt.verify(receiveToken, process.env.JWT_SECRET_KEY);
        req.user = decodedToken;

        //check if user id is in database using findById
        User.findById(decodedToken._id, (err, user) => {
            if (err) {
                return res.status(500).json({
                    message: "Internal server error"
                });
            }

            if (!user) {
                return res.status(412).json({
                    message: "User does not exist"
                });
            } else {
                if (req.user.verificationKey !== user.verificationKey && req.user.verificationKey !== undefined) {
                    return res.status(412).send("Invalid Token");
                } else {
                    next();
                }
            }

        })
    } catch (error) {
        return res.status(412).json({
            message: "Invalid token"
        });
    }

}
