const crypto = require("crypto")
const Otp = require("../model/Otp")
const VerificationLog = require("../model/VerificationLog")

const OTP_LENGTH = 4
const OTP_EXPIRY_MINUTES = 5
const RESEND_COOLDOWN_SECONDS = 60

function generateOtpCode() {
  const max = Math.pow(10, OTP_LENGTH)
  const digits = crypto.randomInt(0, max)
  return digits.toString().padStart(OTP_LENGTH, "0")
}

async function createOtp(userId, purpose = "email_verification", ip = null) {
  await Otp.deleteMany({ userId, purpose, verified: false })

  const code = generateOtpCode()
  const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000)

  await Otp.create({ userId, code, purpose, expiresAt })

  await VerificationLog.create({
    userId,
    action: "otp_generated",
    details: `OTP generated for ${purpose}`,
    ip
  })

  return { code, expiresAt }
}

async function verifyOtp(userId, code, purpose = "email_verification", ip = null) {
  const otp = await Otp.findOne({
    userId,
    purpose,
    verified: false
  }).sort({ createdAt: -1 })

  if (!otp) {
    return { valid: false, error: "No active OTP found. Please request a new one." }
  }

  if (otp.isExpired()) {
    await VerificationLog.create({
      userId,
      action: "otp_expired",
      details: `OTP expired for ${purpose}`,
      ip
    })
    await otp.deleteOne()
    return { valid: false, error: "OTP has expired. Please request a new one." }
  }

  if (otp.hasExceededAttempts()) {
    await VerificationLog.create({
      userId,
      action: "otp_failed",
      details: `Max attempts exceeded for ${purpose}`,
      ip
    })
    await otp.deleteOne()
    return { valid: false, error: "Too many failed attempts. Please request a new OTP." }
  }

  if (otp.code !== code) {
    otp.attempts += 1
    await otp.save()

    await VerificationLog.create({
      userId,
      action: "otp_failed",
      details: `Invalid OTP attempt ${otp.attempts}/${otp.maxAttempts}`,
      ip
    })

    const remaining = otp.maxAttempts - otp.attempts
    return {
      valid: false,
      error: `Invalid OTP. ${remaining} attempt${remaining !== 1 ? "s" : ""} remaining.`
    }
  }

  otp.verified = true
  await otp.save()

  await VerificationLog.create({
    userId,
    action: "otp_verified",
    details: `OTP verified for ${purpose}`,
    ip
  })

  return { valid: true }
}

async function canResendOtp(userId, purpose = "email_verification") {
  const lastOtp = await Otp.findOne({ userId, purpose }).sort({ createdAt: -1 })

  if (!lastOtp) return { canResend: true }

  const elapsedSeconds = (Date.now() - lastOtp.createdAt.getTime()) / 1000
  if (elapsedSeconds < RESEND_COOLDOWN_SECONDS) {
    return {
      canResend: false,
      waitSeconds: Math.ceil(RESEND_COOLDOWN_SECONDS - elapsedSeconds)
    }
  }

  return { canResend: true }
}

module.exports = {
  createOtp,
  verifyOtp,
  canResendOtp,
  OTP_EXPIRY_MINUTES
}
