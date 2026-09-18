const crypto = require("crypto")
const PhoneOtp = require("../model/PhoneOtp")

const OTP_LENGTH          = 4   // 4-digit phone OTP (shown in UI as 4 boxes)
const OTP_EXPIRY_MINUTES  = 5
const RESEND_COOLDOWN_SEC = 60
const MAX_ATTEMPTS        = 5

function generateCode() {
  const max = Math.pow(10, OTP_LENGTH)
  return crypto.randomInt(0, max).toString().padStart(OTP_LENGTH, "0")
}

async function createPhoneOtp(phone, ip = null) {
  // Remove all previous unverified OTPs for this phone
  await PhoneOtp.deleteMany({ phone, verified: false })

  const code      = generateCode()
  const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000)

  await PhoneOtp.create({ phone, code, expiresAt })

  return { code, expiresAt }
}

async function verifyPhoneOtp(phone, code) {
  const otp = await PhoneOtp.findOne({ phone, verified: false }).sort({ createdAt: -1 })

  if (!otp) {
    return { valid: false, error: "No active OTP found. Please request a new one." }
  }

  if (otp.isExpired()) {
    await otp.deleteOne()
    return { valid: false, error: "OTP has expired. Please request a new one." }
  }

  if (otp.attempts >= MAX_ATTEMPTS) {
    await otp.deleteOne()
    return { valid: false, error: "Too many failed attempts. Please request a new OTP." }
  }

  if (otp.code !== code) {
    otp.attempts += 1
    await otp.save()
    const remaining = MAX_ATTEMPTS - otp.attempts
    return {
      valid: false,
      error: `Invalid OTP. ${remaining} attempt${remaining !== 1 ? "s" : ""} remaining.`
    }
  }

  // Mark as verified so it can't be reused
  otp.verified = true
  await otp.save()

  return { valid: true }
}

async function canResendPhoneOtp(phone) {
  const last = await PhoneOtp.findOne({ phone }).sort({ createdAt: -1 })
  if (!last) return { canResend: true }

  const elapsed = (Date.now() - last.createdAt.getTime()) / 1000
  if (elapsed < RESEND_COOLDOWN_SEC) {
    return { canResend: false, waitSeconds: Math.ceil(RESEND_COOLDOWN_SEC - elapsed) }
  }

  return { canResend: true }
}

module.exports = {
  createPhoneOtp,
  verifyPhoneOtp,
  canResendPhoneOtp,
  OTP_EXPIRY_MINUTES,
  OTP_LENGTH
}
