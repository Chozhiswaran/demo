// let generatedOTP = "";

// // Generate OTP
// function generateOTP() {
//     return Math.floor(1000 + Math.random() * 9000).toString();
// }

// // Send OTP
// document.getElementById("sendOtpBtn").addEventListener("click", function () {
//     const phoneInput = document.getElementById('phone').value;
//     const username = document.getElementById('username').value;

//     if (!username) {
//         alert("Please enter your username.");
//         return;
//     }

//     if (!phoneInput || phoneInput.length !== 10 || isNaN(phoneInput)) {
//         alert("Please enter a valid 10-digit phone number.");
//         return;
//     }

//     generatedOTP = generateOTP();
//     alert(`[Test Mode] Your OTP is: ${generatedOTP}`); // Display OTP for testing
//     document.getElementById('otp').removeAttribute('disabled');
// });

// // OTP Verification
// document.getElementById('otp').addEventListener("input", function () {
//     const enteredOTP = document.getElementById('otp').value;
//     const loginBtn = document.getElementById('loginBtn');

//     if (enteredOTP === generatedOTP) {
//         alert("✅ OTP Verified Successfully!");
//         loginBtn.style.display = "block";  // Show Register Button
//     } else {
//         loginBtn.style.display = "none";   // Hide Register Button
//     }
// });

// // Login Redirection
// function handleLogin() {
//     const username = document.getElementById('username').value;
//     const phone = document.getElementById('phone').value;

//     // Save username and phone to localStorage for later use
//     localStorage.setItem("userName", username);
//     localStorage.setItem("userPhone", `+91 ${phone}`);

//     window.location.href = "main.html";  // Redirect to main.html
// }

import { sendOTP, verifyOTP } from "./api.js"; // Import API functions

document.addEventListener("DOMContentLoaded", function () {
    const sendOtpBtn = document.getElementById("sendOtpBtn");
    const verifyOtpBtn = document.getElementById("verifyOtpBtn");
    const loginBtn = document.getElementById("loginBtn");

    // Send OTP when button is clicked
    sendOtpBtn.addEventListener("click", async function () {
        const username = document.getElementById("username").value.trim();
        const phone = document.getElementById("phone").value.trim();

        if (!username) {
            alert("❌ Please enter your username.");
            return;
        }

        if (!phone || phone.length !== 10 || isNaN(phone)) {
            alert("❌ Please enter a valid 10-digit phone number.");
            return;
        }

        const response = await sendOTP(username, phone);

        if (response.success) {
            alert("📩 OTP sent successfully! Check your phone.");
            document.getElementById("otp").removeAttribute("disabled");
        } else {
            alert(`❌ ${response.message}`);
        }
    });

    // Verify OTP when button is clicked
    verifyOtpBtn.addEventListener("click", async function () {
        const phone = document.getElementById("phone").value.trim();
        const otp = document.getElementById("otp").value.trim();

        if (!otp) {
            alert("❌ Please enter the OTP.");
            return;
        }

        const response = await verifyOTP(phone, otp);

        if (response.success) {
            alert("✅ OTP Verified Successfully!");
            loginBtn.removeAttribute("disabled");  // Enable Register Button
        } else {
            alert("❌ Invalid OTP. Please try again.");
            loginBtn.setAttribute("disabled", "true"); // Keep Register Button Disabled
        }
    });

    // Redirect to main.html after login
    loginBtn.addEventListener("click", function () {
        const username = document.getElementById("username").value.trim();
        const phone = document.getElementById("phone").value.trim();

        localStorage.setItem("userName", username);
        localStorage.setItem("userPhone", `+91 ${phone}`);

        window.location.href = "main.html";  // Redirect to main.html
    });
});
