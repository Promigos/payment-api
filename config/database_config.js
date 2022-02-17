const mongoose = require("mongoose");
require("dotenv").config();

function ConnectDatabase() {
    console.log("Connecting to database...")
    const DatabaseConnection = mongoose.connect(
        'mongodb://localhost:27017/payment_api?readPreference=primary&appname=MongoDB%20Compass&directConnection=true&ssl=false'
    );

    DatabaseConnection.then(() => {
        console.log("Database connection was successful!");
    });
    DatabaseConnection.catch((error) => {
        console.log(`Database connection refused`, error);
    });
}

module.exports = ConnectDatabase;
