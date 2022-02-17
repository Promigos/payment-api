const Express = require("express");
const Register = require("./routes/register");
const Login = require("./routes/login");
const VerifyEmail = require("./routes/verify_account");
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


app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
