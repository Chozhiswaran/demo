const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const twilio = require('twilio');

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;
const { TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_PHONE_NUMBER } = process.env;

// Ensure required environment variables exist
if (!MONGO_URI || !TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN || !TWILIO_PHONE_NUMBER) {
    console.error('❌ ERROR: Missing required environment variables in .env file');
    process.exit(1);
}

// Initialize Twilio Client
const client = twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);

// Middleware
app.use(cors({
    origin: 'http://127.0.0.1:5501', // Adjust frontend origin
    credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Connect to MongoDB with retry mechanism
const connectDB = async () => {
    try {
        await mongoose.connect(MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('✅ MongoDB Connected Successfully');
    } catch (error) {
        console.error('❌ ERROR: MongoDB Connection Failed:', error);
        setTimeout(connectDB, 5000); // Retry connection after 5 seconds
    }
};
connectDB();

// Define User Schema & Model
const userSchema = new mongoose.Schema({
    username: { type: String, required: true },
    phone: { type: String, required: true, unique: true },
});
const User = mongoose.model('User', userSchema);

// ✅ OTP Request Route (Send OTP)
app.post('/api/auth/verify-number', async (req, res) => {
    try {
        console.log('📥 Received OTP Request:', req.body);

        const { username, phone, mobilenum } = req.body;
        const userPhone = phone || mobilenum;

        if (!username || !userPhone) {
            return res.status(400).json({ success: false, message: '❌ Username and phone number are required!' });
        }

        // Generate a 6-digit OTP
        const otp = Math.floor(100000 + Math.random() * 900000);

        // Send OTP via Twilio
        const twilioResponse = await client.messages.create({
            body: `Your OTP for EmpowerHer is: ${otp}`,
            from: TWILIO_PHONE_NUMBER,
            to: `+91${userPhone}`,
        });

        console.log(`✅ OTP sent to ${userPhone}: ${otp}`, twilioResponse.sid);

        // Save OTP in memory (to verify later)
        global.otpStore = global.otpStore || {};
        global.otpStore[userPhone] = { otp, expiresAt: Date.now() + 5 * 60 * 1000, username };

        res.status(200).json({ success: true, message: '📩 OTP sent successfully!' });
    } catch (error) {
        console.error('❌ ERROR sending OTP:', error);
        res.status(500).json({ success: false, message: '❌ Failed to send OTP. Try again.' });
    }
});

// ✅ OTP Verification Route (Verify OTP & Store User)
app.post('/api/auth/verify-otp', async (req, res) => {
    try {
        console.log('📥 Received OTP Verification Request:', req.body);

        const { phone, mobilenum, otp } = req.body;
        const userPhone = phone || mobilenum;

        if (!userPhone || !otp) {
            return res.status(400).json({ success: false, message: '❌ Phone number and OTP are required!' });
        }

        // Check OTP in memory
        const storedOTP = global.otpStore?.[userPhone];

        if (!storedOTP) {
            return res.status(400).json({ success: false, message: '❌ OTP not found. Request a new one.' });
        }

        if (storedOTP.expiresAt < Date.now()) {
            return res.status(400).json({ success: false, message: '❌ OTP has expired. Request a new one.' });
        }

        if (storedOTP.otp != otp) {
            return res.status(400).json({ success: false, message: '❌ Invalid OTP!' });
        }

        // Store username and mobile number in MongoDB
        const existingUser = await User.findOne({ phone: userPhone });
        if (!existingUser) {
            await User.create({ username: storedOTP.username, phone: userPhone });
            console.log(`✅ New user registered: ${storedOTP.username} (${userPhone})`);
        } else {
            console.log(`ℹ️ User already exists: ${existingUser.username} (${userPhone})`);
        }

        // Remove OTP after successful verification
        delete global.otpStore[userPhone];

        res.status(200).json({ success: true, message: '✅ OTP Verified Successfully & User Registered!' });
    } catch (error) {
        console.error('❌ ERROR verifying OTP:', error);
        res.status(500).json({ success: false, message: '❌ Failed to verify OTP. Try again.' });
    }
});

// Handle undefined routes
app.use((req, res) => {
    res.status(404).json({ message: 'Registered Successfully' });
});

// Start Server
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});

// Graceful Exit Handling
process.on('SIGINT', async () => {
    console.log('❌ Server shutting down...');
    await mongoose.connection.close();
    process.exit(0);
});
