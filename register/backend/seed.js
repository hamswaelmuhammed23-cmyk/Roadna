/**
 * Seed script for Roadna backend.
 * Creates sample users for testing matching, chat, and admin features.
 *
 * Usage: node seed.js
 *
 * WARNING: This drops all existing data in the roadna database.
 */

const mongoose = require("mongoose")
const dotenv = require("dotenv")
dotenv.config()

const User = require("./model/User")
const Otp = require("./model/Otp")
const VerificationLog = require("./model/VerificationLog")
const Conversation = require("./model/Conversation")
const Message = require("./model/Message")

const sampleUsers = [
  {
    fullName: "Ahmed Hassan",
    email: "ahmed@test.com",
    password: "password123",
    phone: "01012345678",
    dob: new Date("1995-03-15"),
    age: 31,
    language: "Arabic",
    country: "Egypt",
    governorate: "Cairo",
    bio: "Love exploring historical sites and trying local food.",
    interests: ["history", "food", "photography", "hiking"],
    nationalId: "29503151234567",
    address: "Cairo, Egypt",
    personalityType: "adventurer",
    travelStyle: "budget",
    verificationStatus: "approved",
    verified: true,
    emailVerified: true,
    profileCompleted: true,
    role: "admin"
  },
  {
    fullName: "Sara Mohamed",
    email: "sara@test.com",
    password: "password123",
    phone: "01112345678",
    dob: new Date("1998-07-22"),
    age: 27,
    language: "Arabic",
    country: "Egypt",
    governorate: "Alexandria",
    bio: "Beach lover and sunset chaser. Always looking for the next adventure.",
    interests: ["beach", "photography", "food", "diving", "hiking"],
    nationalId: "29807221234567",
    address: "Alexandria, Egypt",
    personalityType: "spontaneous",
    travelStyle: "mid-range",
    verificationStatus: "approved",
    verified: true,
    emailVerified: true,
    profileCompleted: true
  },
  {
    fullName: "Omar Ali",
    email: "omar@test.com",
    password: "password123",
    phone: "01212345678",
    dob: new Date("1993-11-05"),
    age: 32,
    language: "English",
    country: "Egypt",
    governorate: "Giza",
    bio: "Tech enthusiast who loves camping and stargazing.",
    interests: ["camping", "technology", "stargazing", "hiking", "music"],
    nationalId: "29311051234567",
    address: "Giza, Egypt",
    personalityType: "planner",
    travelStyle: "budget",
    verificationStatus: "pending",
    profileCompleted: true,
    emailVerified: true
  },
  {
    fullName: "Nour Ibrahim",
    email: "nour@test.com",
    password: "password123",
    phone: "01512345678",
    dob: new Date("2000-01-30"),
    age: 26,
    language: "French",
    country: "Egypt",
    governorate: "Luxor",
    bio: "Art and culture enthusiast. Love ancient Egyptian history.",
    interests: ["art", "history", "museums", "photography", "food"],
    nationalId: "30001301234567",
    address: "Luxor, Egypt",
    personalityType: "cultural",
    travelStyle: "mid-range",
    verificationStatus: "approved",
    verified: true,
    emailVerified: true,
    profileCompleted: true
  },
  {
    fullName: "Youssef Khaled",
    email: "youssef@test.com",
    password: "password123",
    phone: "01012349876",
    dob: new Date("1996-09-12"),
    age: 29,
    language: "Arabic",
    country: "Egypt",
    governorate: "Aswan",
    bio: "Relaxed traveler who enjoys slow trips and meeting locals.",
    interests: ["food", "culture", "hiking", "relaxation", "photography"],
    nationalId: "29609121234567",
    address: "Aswan, Egypt",
    personalityType: "relaxed",
    travelStyle: "backpacker",
    verificationStatus: "approved",
    verified: true,
    emailVerified: true,
    profileCompleted: true
  }
]

async function seed() {
  try {
    await mongoose.connect(process.env.MONGO_URI)
    console.log("Connected to MongoDB")

    // await User.deleteMany({})
    // await Otp.deleteMany({})
    // await VerificationLog.deleteMany({})
    // await Conversation.deleteMany({})
    // await Message.deleteMany({})
    // console.log("Cleared existing data")

    const users = await User.create(sampleUsers)
    console.log(`Created ${users.length} users`)

    console.log("\n--- Test Accounts ---")
    console.log("Admin:  ahmed@test.com / password123")
    console.log("Users:  sara@test.com / password123")
    console.log("        omar@test.com / password123")
    console.log("        nour@test.com / password123")
    console.log("        youssef@test.com / password123")
    console.log("\nAdmin setup key: roadna-admin-setup-2024")
    console.log("(Ahmed is already admin via seed)")

    await mongoose.disconnect()
    console.log("\nSeed complete. Database disconnected.")
  } catch (error) {
    console.error("Seed error:", error.message)
    process.exit(1)
  }
}

seed()
