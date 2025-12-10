const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const connectDB = async () => {
    await mongoose.connect(process.env.MONGODB_URI)
}

module.exports = connectDB;