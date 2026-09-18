const mongoose = require("mongoose")

const verificationLogSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    index: true
  },
  action: {
    type: String,
    enum: [
      "otp_generated",
      "otp_verified",
      "otp_failed",
      "otp_expired",
      "otp_resent",
      "identity_approved",
      "identity_rejected",
      "account_suspended",
      "account_activated"
    ],
    required: true
  },
  performedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    default: null
  },
  details: {
    type: String,
    default: ""
  },
  ip: {
    type: String,
    default: null
  }
}, {
  timestamps: true
})

module.exports = mongoose.model("VerificationLog", verificationLogSchema)
