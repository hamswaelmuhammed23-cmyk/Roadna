const mongoose = require("mongoose")

const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/roadna"
    const conn = await mongoose.connect(mongoUri)
    console.log(`MongoDB connected: ${conn.connection.host}`)
  } catch (error) {
    console.error("MongoDB connection failed:", error.message)
  }
}

module.exports = connectDB
