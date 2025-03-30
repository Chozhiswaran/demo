// const express = require('express');
// const otpGenerator = require('otp-generator');
// const bcrypt = require('bcryptjs');
// const User = require('../models/User');
// const twilio = require('twilio');
// require('dotenv').config();

// const router = express.Router();
// const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

// // ✅ Temporary OTP storage (hashed for security)
// let otps = {};

// // ✅ **Test Route**
// router.get('/', (req, res) => res.send('🚀 Auth API is working!'));

// // ✅ **Step 1: Generate & Send OTP**
// router.post('/verify-number', async (req, res) => {
//     try {
//         const { username, mobilenum } = req.body;
//         if (!username || !mobilenum) return res.status(400).json({ message: '❌ Username and mobile number are required.' });

//         const formattedNum = mobilenum.startsWith('+91') ? mobilenum : `+91${mobilenum}`;

//         // ✅ Generate and Hash OTP
//         const otp = otpGenerator.generate(4, { digits: true, alphabets: false, upperCase: false, specialChars: false });
//         const hashedOtp = await bcrypt.hash(otp, 10);

//         otps[formattedNum] = { hashedOtp, username, expires: Date.now() + 300000 }; // 5 mins expiry

//         // ✅ Send OTP via Twilio
//         await client.messages.create({
//             body: `Your OTP code is ${otp}`,
//             from: process.env.TWILIO_PHONE_NUMBER,
//             to: formattedNum
//         });

//         console.log(`✅ OTP sent to ${formattedNum}: ${otp}`); // DEBUGGING: Remove in production
//         res.status(200).json({ message: '✅ OTP sent successfully.', mobilenum: formattedNum });
//     } catch (error) {
//         console.error("❌ Error sending OTP:", error);
//         res.status(500).json({ message: '❌ Error sending OTP', error: error.message });
//     }
// });

// // ✅ **Step 2: Verify OTP & Register User**
// router.post('/verify-otp', async (req, res) => {
//     try {
//         const { mobilenum, otp } = req.body;
//         if (!mobilenum || !otp) return res.status(400).json({ message: '❌ Mobile number and OTP are required.' });

//         const formattedNum = mobilenum.startsWith('+91') ? mobilenum : `+91${mobilenum}`;
//         const storedOtp = otps[formattedNum];

//         if (!storedOtp) {
//             return res.status(400).json({ message: '❌ OTP not found or expired.' });
//         }

//         // ✅ Compare OTP
//         const isMatch = await bcrypt.compare(otp, storedOtp.hashedOtp);
//         if (!isMatch) {
//             return res.status(400).json({ message: '❌ Invalid OTP. Please try again.' });
//         }

//         // ✅ Register or Fetch User
//         let user = await User.findOne({ mobilenum: formattedNum });
//         if (!user) {
//             user = new User({ username: storedOtp.username, mobilenum: formattedNum });
//             await user.save();
//         }

//         delete otps[formattedNum]; // ✅ Remove OTP after successful verification

//         console.log(`✅ OTP verified for ${formattedNum}`);
//         res.status(200).json({ message: '✅ OTP verified successfully.', user });
//     } catch (err) {
//         console.error("❌ Error verifying OTP:", err);
//         res.status(500).json({ message: '❌ Server error during verification', error: err.message });
//     }
// });

// // ✅ **Cleanup expired OTPs (Every 1 minute)**
// setInterval(() => {
//     Object.keys(otps).forEach((key) => {
//         if (otps[key].expires < Date.now()) {
//             console.log(`🗑️ Deleting expired OTP for ${key}`);
//             delete otps[key];
//         }
//     });
// }, 60000);

// module.exports = router;

const express = require('express');
const otpGenerator = require('otp-generator');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const twilio = require('twilio');
require('dotenv').config();

const router = express.Router();
const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

// ✅ Temporary OTP storage (hashed for security)
let otps = {};

// ✅ **Test Route**
router.get('/', (req, res) => res.send('🚀 Auth API is working!'));

// ✅ **Step 1: Generate & Send OTP**
router.post('/verify-number', async (req, res) => {
    try {
        const { username, mobilenum } = req.body;
        if (!username || !mobilenum) return res.status(400).json({ message: '❌ Username and mobile number are required.' });

        const formattedNum = mobilenum.startsWith('+91') ? mobilenum : `+91${mobilenum}`;

        // ✅ Generate and Hash OTP
        const otp = otpGenerator.generate(4, { digits: true, alphabets: false, upperCase: false, specialChars: false });
        const hashedOtp = await bcrypt.hash(otp, 10);

        otps[formattedNum] = { hashedOtp, username, expires: Date.now() + 300000 }; // 5 mins expiry

        // ✅ Send OTP via Twilio
        await client.messages.create({
            body: `Your OTP code is ${otp}`,
            from: process.env.TWILIO_PHONE_NUMBER,
            to: formattedNum
        });

        console.log(`✅ OTP sent to ${formattedNum}: ${otp}`); // DEBUGGING: Remove in production
        res.status(200).json({ message: '✅ OTP sent successfully.', mobilenum: formattedNum });
    } catch (error) {
        console.error("❌ Error sending OTP:", error);
        res.status(500).json({ message: '❌ Error sending OTP', error: error.message });
    }
});

// ✅ **Step 2: Verify OTP & Register User**
router.post('/verify-otp', async (req, res) => {
    try {
        const { mobilenum, otp } = req.body;
        if (!mobilenum || !otp) return res.status(400).json({ message: '❌ Mobile number and OTP are required.' });

        const formattedNum = mobilenum.startsWith('+91') ? mobilenum : `+91${mobilenum}`;
        const storedOtp = otps[formattedNum];

        if (!storedOtp) {
            return res.status(400).json({ message: '❌ OTP not found or expired.' });
        }

        // ✅ Compare OTP
        const isMatch = await bcrypt.compare(otp, storedOtp.hashedOtp);
        if (!isMatch) {
            return res.status(400).json({ message: '❌ Invalid OTP. Please try again.' });
        }

        // ✅ Register or Fetch User
        let user = await User.findOne({ mobilenum: formattedNum });
        if (!user) {
            user = new User({ username: storedOtp.username, mobilenum: formattedNum });
            await user.save();
        }

        delete otps[formattedNum]; // ✅ Remove OTP after successful verification

        console.log(`✅ OTP verified for ${formattedNum}`);
        res.status(200).json({ message: '✅ OTP verified successfully.', user });
    } catch (err) {
        console.error("❌ Error verifying OTP:", err);
        res.status(500).json({ message: '❌ Server error during verification', error: err.message });
    }
});

// ✅ **Cleanup expired OTPs (Every 1 minute)**
setInterval(() => {
    Object.keys(otps).forEach((key) => {
        if (otps[key].expires < Date.now()) {
            console.log(`🗑️ Deleting expired OTP for ${key}`);
            delete otps[key];
        }
    });
}, 60000);

module.exports = router;
