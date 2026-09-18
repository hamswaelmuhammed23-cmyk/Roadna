/**
 * makeAdmin.js — Promote a registered user to admin role
 *
 * Usage:
 *   node scripts/makeAdmin.js <email>
 *
 * Example:
 *   node scripts/makeAdmin.js user@example.com
 */

require("dotenv").config({ path: require("path").join(__dirname, "../.env") })

const mongoose = require("mongoose")
const User = require("../model/User")

async function makeAdmin() {
  const email = process.argv[2]

  if (!email) {
    console.error("❌  Please provide an email address")
    console.log("    Usage: node scripts/makeAdmin.js <email>")
    process.exit(1)
  }

  if (!process.env.MONGO_URI) {
    console.error("❌  MONGO_URI is not set in .env")
    process.exit(1)
  }

  try {
    await mongoose.connect(process.env.MONGO_URI)
    console.log("✅  Connected to MongoDB")

    const user = await User.findOne({ email: email.toLowerCase().trim() })

    if (!user) {
      console.error(`❌  No user found with email "${email}"`)
      process.exit(1)
    }

    if (user.role === "admin") {
      console.log(`ℹ️   User "${email}" (${user.fullName}) is already an admin`)
      process.exit(0)
    }

    user.role = "admin"
    await user.save()

    console.log(`✅  Successfully promoted "${email}" (${user.fullName}) to admin`)
    console.log(`    User ID: ${user._id}`)
    process.exit(0)
  } catch (err) {
    console.error("❌  Error:", err.message)
    process.exit(1)
  } finally {
    await mongoose.disconnect()
  }
}

makeAdmin()
