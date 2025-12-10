const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();
MONGODB_URI = `mongodb+srv://prathprabhu:wpAf2epXKnD4QNyo@mumbai.rgnouqh.mongodb.net/NamasteNode`

const connectDB = async () => {
    await mongoose.connect(MONGODB_URI)
}

module.exports = connectDB;