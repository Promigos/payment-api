//get modules needed to change password, user model express and route
const express = require('express');
const router = express.Router();
//model
const {UserTemporary, generateKey, User} = require('../models/user_model');
const bcrypt = require("bcrypt");
const {passwordStrength} = require('check-password-strength')

//node mailer
const nodemailer = require("nodemailer");

//import verify_auth
const verify_auth = require('../middleware/verify_auth');