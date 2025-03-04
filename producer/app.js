
const express = require('express')
const app = express()
const port = 3000
const { sendOtpToQueue } = require('./utils/otpSender')

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.post('/send-otp', (req, res) => {
    const { email } = req.body;
    if (!email) {
        return res.status(400).send('Email is required');
    }

    sendOtpToQueue(email);
    res.status(200).json({
        message: 'OTP sent to queue'
    })
})

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
})
