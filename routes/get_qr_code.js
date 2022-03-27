const verify_auth = require('../middleware/verify_auth');
const Express = require("express");
const qr = require("qr-image");
const jwt = require("jsonwebtoken");
const router = Express.Router();

//TODO: Add middleware
router.post("/", verify_auth, async (request, response) => {

    const code = qr.image(jwt.sign({_id: request.user._id}, process.env.JWT_SECRET_KEY), {type: 'svg'});
    response.type('svg');
    code.pipe(response);
});

module.exports = router;
