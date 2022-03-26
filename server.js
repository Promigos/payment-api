const Express = require("express");
const Register = require("./routes/register");
const Login = require("./routes/login");
const VerifyEmail = require("./routes/verify_account");
const QrRoute = require("./routes/get_qr_code")
const AddUserQR = require("./routes/add_usr_qr")
const AddChatMessage = require("./routes/chats")
const AddBankAccount = require("./routes/manage_bank_accounts")
const ManageFunds = require("./routes/funds")
//user list
const GetUsers = require("./routes/get_users")
//block
const BlockUser = require("./routes/block_user")
const ValidateToken = require("./routes/validate_token")
const GetAccountNumbers = require("./routes/get_account_numbers")
const ForgotPassword = require("./routes/forgot_password")
const ForgotPasswordVerify = require("./routes/forgot_password_verify")
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

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
