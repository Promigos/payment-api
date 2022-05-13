let express = require('express')
const nodemailer = require("nodemailer");

const router = express.Router();

function sendEmail(email, payload, subject, response) {
    try {
        const transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 465,
            secure: true, // use SSL
            auth: {
                user: process.env.EMAIL,
                pass: process.env.PASSWORD
            }
        });
        let mailOptions = {
            from: process.env.EMAIL,
            to: email,
            subject: subject,
            text: payload

        }

        transporter.sendMail(mailOptions, function (error, info) {
            if (error) {
                console.log(error);
                return response.status(500).send({
                    message: "Failed to send confirmation mail",
                    error: error
                })
            } else {
                console.log('Email sent: ' + info.response);
                return response.status(200).send({
                    message: "Conformation mail sent successfully"
                })
            }
        });
    } catch (e) {
        console.log(e)
        return response.status(500).send({
            message: "Failed to send confirmation mail",
            error: e
        })
    }
}

router.post("/", (req, res) => {

    let {email, payload, subject} = req.body

    if (!email) return res.status(400).send("Please attach email ID")
    if (!payload) return res.status(400).send("Please attach payload")
    if (!subject) return res.status(400).send("Please attach subject")

    sendEmail(email, payload, subject, res)

})

module.exports = router

