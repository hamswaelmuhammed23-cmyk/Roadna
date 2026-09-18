const mongoose = require("mongoose")

/**
 * Temporary OTP storage for pre-registration phone verification.
 * Does NOT require a userId — the phone number is the identifier.
 * MongoDB TTL index auto-deletes expired documents.
 */
const phoneOtpSchema = new mongoose.Schema({
  phone: {
    type: String,
    required: true,
    index: true
  },
  code: {
    type: String,
    required: true
  },
  expiresAt: {
    type: Date,
    required: true,
    index: { expires: 0 }
  },
  verified: {
    type: Boolean,
    default: false
  },
  attempts: {
    type: Number,
    default: 0
  }
}, { timestamps: true })

phoneOtpSchema.methods.isExpired = function () {
  return Date.now() > this.expiresAt.getTime()
}

module.exports = mongoose.model("PhoneOtp", phoneOtpSchema)
