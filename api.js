const API_BASE_URL = "http://localhost:5000/api/auth"; // Backend URL

// Function to send OTP
async function sendOTP(username, phone) {
    try {
        const response = await fetch(`${API_BASE_URL}/verify-number`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, mobilenum: phone })
        });

        const data = await response.json();
        return data;
    } catch (error) {
        console.error("❌ Error sending OTP:", error);
        return { success: false, message: "❌ Failed to send OTP." };
    }
}

// Function to verify OTP
async function verifyOTP(phone, otp) {
    try {
        const response = await fetch(`${API_BASE_URL}/verify-otp`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ mobilenum: phone, otp })
        });

        const data = await response.json();
        return data;
    } catch (error) {
        console.error("❌ Error verifying OTP:", error);
        return { success: false, message: "❌ Failed to verify OTP." };
    }
}

// Export functions for script.js
export { sendOTP, verifyOTP };
