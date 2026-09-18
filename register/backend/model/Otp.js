const mongoose = require("mongoose")

const otpSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  code: {
    type: String,
    required: true
  },
  purpose: {
    type: String,
    enum: ["email_verification", "phone_verification", "password_reset", "login"],
    default: "phone_verification"
  },
  expiresAt: {
    type: Date,
    required: true,
    index: { expires: 0 }
  },
  attempts: {
    type: Number,
    default: 0
  },
  maxAttempts: {
    type: Number,
    default: 5
  },
  verified: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
})

otpSchema.index({ userId: 1, purpose: 1 })

otpSchema.methods.isExpired = function () {
  return Date.now() > this.expiresAt.getTime()
}

otpSchema.methods.hasExceededAttempts = function () {
  return this.attempts >= this.maxAttempts
}

module.exports = mongoose.model("Otp", otpSchema)
