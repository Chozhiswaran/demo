// const mongoose = require('mongoose');
// const dotenv = require('dotenv');

// dotenv.config();

// const connectDB = async () => {
//     try {
//         if (!process.env.MONGO_URI) {
//             throw new Error("❌ MongoDB URI is missing. Check your .env file.");
//         }

//         await mongoose.connect(process.env.MONGO_URI, {
//             useNewUrlParser: true,
//             useUnifiedTopology: true,
//         });

//         console.log("✅ MongoDB Connected Successfully!");
//     } catch (error) {
//         console.error("❌ MongoDB Connection Failed:", error);
//         process.exit(1);
//     }
// };

// module.exports = connectDB;
const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const DB_NAME = 'EmpowerHer'; // ✅ Ensure database name consistency
let DB_URI = process.env.MONGO_URI;

if (!DB_URI) {
    console.error("❌ MongoDB URI is missing. Check your .env file.");
    process.exit(1);
}

// Ensure the correct database name in the URI
DB_URI = DB_URI.replace(/\/[a-zA-Z0-9_-]+$/, `/${DB_NAME}`);

const connectDB = async (retries = 3) => {
    while (retries) {
        try {
            await mongoose.connect(DB_URI, {
                useNewUrlParser: true,
                useUnifiedTopology: true,
                bufferCommands: false, // Prevents unnecessary memory usage
            });

            console.log(`✅ Connected to MongoDB: ${DB_NAME}`);
            return;
        } catch (error) {
            console.error(`❌ MongoDB Connection Failed (Retries Left: ${retries - 1}):`, error);
            retries -= 1;
            if (retries === 0) process.exit(1);
            await new Promise(res => setTimeout(res, 5000)); // Wait before retrying
        }
    }
};

module.exports = connectDB;
