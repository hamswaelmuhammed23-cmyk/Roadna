require("dotenv").config()
const mongoose = require("mongoose")
const User = require("./model/User")

async function check() {
  try {
    await mongoose.connect(process.env.MONGO_URI || "mongodb://127.0.0.1:27017/roadna")
    console.log("Connected to DB")
    const users = await User.find({}, "_id email fullName role").lean()
    console.log("Users in DB:", users)
  } catch (err) {
    console.error(err)
  } finally {
    await mongoose.disconnect()
  }
}
check()
