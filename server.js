const Express = require("express");
const Register = require("./routes/register");
const Login = require("./routes/login");
const VerifyEmail = require("./routes/verify_account");
const QrRoute = require("./routes/get_qr_code")
const AddUserQR = require("./routes/add_usr_qr")
const app = Express();
app.use(Express.json());

require("./config/database_config")();

app.get("/", (request, response) => {
    response.status(200).send("Welcome to Payments API");
});

const PORT = process.env.PORT || 8080;

app.use("/register", Register);
app.use("/login", Login);
app.use("/verifyEmail", VerifyEmail);
app.use("/qr", QrRoute)
app.use("/addUserQR", AddUserQR)
const qr = require('qr-image');

app.listen(3000);


app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
