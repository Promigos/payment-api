const Express = require("express");
const router = Express.Router();
const {UserTemporary, generateKey, User} = require("../models/user_model");

//TODO: Replace routes with HTML pages

router.get('/', async function (request, response) {
    if (!request.query.id || !request.query.email) {
        response.send('Invalid Link')
    } else {
        const checkExistingUserTemporary = await UserTemporary.findOne({
            email: request.query.email,
        });

        const checkExistingUser = await User.findOne({
            email: request.query.email,
        });

        if (!checkExistingUserTemporary) {
            response.send('Registration Link Expired')
        } else if (checkExistingUser) {
            response.send('This account has already been verified and created')
        } else {
            if (checkExistingUserTemporary.emailVerificationToken === request.query.id) {
                checkExistingUserTemporary.remove().then(async r => {

                    const createFinalInstance = new User({
                        email: r.email,
                        name: r.name,
                        userID: r.userID, //TODO: Replace with Firebase ID
                        phoneNumber: r.phoneNumber,
                        countryCode: r.countryCode,
                        userLocation: r.userLocation,
                        password: r.password,
                        verificationKey: generateKey()
                    });

                    await createFinalInstance.save()
                        .then(user => response.status(200).send("Account has been created!"))
                        .catch(err => response.status(500).send(err))
                });


            } else {
                checkExistingUserTemporary.remove().then(r => console.log(r));
                response.send("Invalid Link")
            }
        }
    }


})

module.exports = router;
