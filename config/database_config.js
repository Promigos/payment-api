const mongoose = require("mongoose");
require("dotenv").config();

function ConnectDatabase() {
    console.log("Connecting to database...")
    const DatabaseConnection = mongoose.connect(
        'mongodb+srv://wallet-up:Password123!@cluster0.ipr9e.mongodb.net/walletup?retryWrites=true&w=majority'
    );

    DatabaseConnection.then(() => {
        console.log("Database connection was successful!");
    });
    DatabaseConnection.catch((error) => {
        console.log(`Database connection refused`, error);
    });
}

module.exports = ConnectDatabase;
