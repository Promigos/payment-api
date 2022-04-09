const Express = require("express");
const Register = require("./routes/register");
const Login = require("./routes/login");
const VerifyEmail = require("./routes/verify_account");
const QrRoute = require("./routes/get_qr_code")
const AddUserQR = require("./routes/add_usr_qr")
const AddChatMessage = require("./routes/chats")
const AddBankAccount = require("./routes/manage_bank_accounts")
const ManageFunds = require("./routes/funds")
const GetUsers = require("./routes/get_users")
const BlockUser = require("./routes/block_user")
const ValidateToken = require("./routes/validate_token")
const GetAccountNumbers = require("./routes/get_account_numbers")
const ForgotPassword = require("./routes/forgot_password")
const ForgotPasswordVerify = require("./routes/forgot_password_verify")
const ValidatePassword = require("./routes/validate_password")
const ChangePassword = require("./routes/change_password")
const SetFirebaseToken = require("./routes/set_firebase_token")
const {firebaseAdmin} = require("./config/firebase_config");

//TODO: Use this for notifications using tokens for users
// firebaseAdmin.messaging().send({
//     notification: {
//         title: "NODE JS",
//         body: "NOTIFICATION",
//     },
//     token: "cbvcoF2oSfavoUdJnXjNHP:APA91bHmHT8UA9sGqMEH74CU5TqiNPvPtCoezrK5d0PjqV9UTkt22jDxHZ7Z4z4VXpeUZeVB2uvm2-hqHmV7osesV6upJFGuBDZ3xtqvdjNnd3nQ2LV9Xn57suAFpnyFcdEChsbGFjUb",
//     android: {
//         priority: "high",
//     },
//     // Add APNS (Apple) config
//     apns: {
//         payload: {
//             aps: {
//                 contentAvailable: true,
//             },
//         },
//         headers: {
//             "apns-topic": "io.flutter.plugins.firebase.messaging", // bundle identifier
//         },
//     },
// }).then(r => console.log(r))

const app = Express();
app.use(Express.json());

//TODO: Wrap response with {message: "Message"} json structure
require("./config/database_config")();

app.get("/", (request, response) => {
    response.status(200).send("Welcome to Payments API");
});

const PORT = process.env.PORT || 8080;

app.use("/register", Register);
app.use("/validateToken", ValidateToken);
app.use("/login", Login);
app.use("/verifyEmail", VerifyEmail);
app.use("/qr", QrRoute)
app.use("/addUserQR", AddUserQR)
app.use("/chats", AddChatMessage)
app.use("/users", GetUsers)
app.use("/block", BlockUser)
app.use("/bank", AddBankAccount)
app.use("/funds", ManageFunds)
app.use("/accounts", GetAccountNumbers)
app.use("/forgotPassword", ForgotPassword);
app.use("/forgotPasswordVerify", ForgotPasswordVerify);
app.use("/changePassword", ChangePassword);
app.use("/validatePassword", ValidatePassword);
app.use("/setToken", SetFirebaseToken);


app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
