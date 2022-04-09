const admin = require("firebase-admin");

///Firebase Admin :
const serviceAccount = require("./auth_key.json");
let firebaseAdmin = admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});

module.exports = {
    firebaseAdmin: firebaseAdmin
}
