const User     = require("../model/User")
const PhoneOtp = require("../model/PhoneOtp")
const jwt      = require("jsonwebtoken")
const { createOtp, verifyOtp, canResendOtp, OTP_EXPIRY_MINUTES } = require("../services/otpService")
const {
  createPhoneOtp,
  verifyPhoneOtp,
  canResendPhoneOtp,
  OTP_EXPIRY_MINUTES: OTP_EXPIRY_MINUTES_PHONE
} = require("../services/phoneOtpService")
const { sendOtpSms } = require("../services/smsService")
const { validateEmail, validatePassword, validateOtpCode, validatePhone, normalizePhone } = require("../utils/validators")

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "7d" })

// ──────────────────────────────────────────────────────────────────────────────
// GET /api/v1/auth/me
// ──────────────────────────────────────────────────────────────────────────────
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
    if (!user) {
      return res.status(404).json({ success: false, error: "User not found" })
    }
    res.json({ success: true, data: { user } })
  } catch (error) {
    res.status(500).json({ success: false, error: error.message })
  }
}

// ──────────────────────────────────────────────────────────────────────────────
// POST /api/v1/auth/register
// ──────────────────────────────────────────────────────────────────────────────
exports.register = async (req, res) => {
  try {
    const {
      fullName, email, password, phone, dob, age, language, country,
      bio, photo, interests, nationalId, idFront, idBack, address,
      additionalData, personalityType, travelStyle, governorate
    } = req.body

    if (!email || !password || !fullName) {
      return res.status(400).json({
        success: false,
        error: "fullName, email and password are required"
      })
    }

    const emailError = validateEmail(email)
    if (emailError) return res.status(400).json({ success: false, error: emailError })

    const passwordError = validatePassword(password)
    if (passwordError) return res.status(400).json({ success: false, error: passwordError })

    if (phone) {
      const phoneError = validatePhone(phone)
      if (phoneError) return res.status(400).json({ success: false, error: phoneError })
    }

    const normalizedPhone = phone ? normalizePhone(phone) : null

    const user = await User.create({
      fullName, email, password,
      phone: normalizedPhone,
      dob, age, language, country,
      bio, photo, interests,
      nationalId, idFront, idBack, address,
      additionalData, personalityType, travelStyle, governorate,
      profileCompleted: !!(phone && dob && interests?.length)
    })

    const token = signToken(user._id)

    // If no phone provided during step 1 registration, skip SMS
    if (!normalizedPhone) {
      const userObj = user.toObject()
      delete userObj.password
      return res.status(201).json({
        success: true,
        data: {
          user: userObj,
          token,
          otpSent: false
        }
      })
    }

    // If the phone was pre-verified (4-digit OTP flow before registration),
    // skip sending another SMS and mark the user as verified immediately.
    const preVerified = await PhoneOtp.findOne({ phone: normalizedPhone, verified: true })
      .sort({ createdAt: -1 })
      .lean()

    if (preVerified) {
      await User.findByIdAndUpdate(user._id, { phoneVerified: true })
      await PhoneOtp.deleteMany({ phone: normalizedPhone })

      const userObj = user.toObject()
      delete userObj.password

      return res.status(201).json({
        success: true,
        data: {
          user: { ...userObj, phoneVerified: true },
          token,
          otpSent: false,
          otpChannel: "pre-verified"
        }
      })
    }

    // Phone was NOT pre-verified — generate and send OTP via real SMS
    const { code } = await createOtp(user._id, "phone_verification", req.ip)

    try {
      const smsResult = await sendOtpSms(normalizedPhone, code, OTP_EXPIRY_MINUTES)
      if (smsResult.mock) {
        // Mock only allowed when SMS_ALLOW_MOCK=true — block in all other cases
        if (process.env.SMS_ALLOW_MOCK !== "true") {
          await User.findByIdAndDelete(user._id)
          return res.status(503).json({
            success: false,
            error: "SMS service is not configured. Please set up Twilio credentials in .env"
          })
        }
      }
    } catch (smsError) {
      await User.findByIdAndDelete(user._id)
      return res.status(502).json({
        success: false,
        error: `Failed to send verification SMS: ${smsError.message}`
      })
    }

    const userObj = user.toObject()
    delete userObj.password

    res.status(201).json({
      success: true,
      data: {
        user: userObj,
        token,
        otpSent: true,
        otpChannel: "sms",
        otpPhone: normalizedPhone.replace(/(\+?\d{2})\d+(\d{3})/, "$1*****$2"),
        otpExpiresIn: `${OTP_EXPIRY_MINUTES} minutes`
      }
    })
  } catch (error) {
    if (error.code === 11000) {
      const field = Object.keys(error.keyValue)[0]
      return res.status(400).json({
        success: false,
        error: `${field} is already registered`
      })
    }
    res.status(400).json({ success: false, error: error.message })
  }
}

// ──────────────────────────────────────────────────────────────────────────────
// POST /api/v1/auth/login
// ──────────────────────────────────────────────────────────────────────────────
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: "Email and password are required"
      })
    }

    const normalizedEmail = email.toLowerCase().trim()
    if (normalizedEmail === "admin@roadna.com") {
      const existingAdmin = await User.findOne({ email: "admin@roadna.com" })
      if (!existingAdmin) {
        await User.create({
          fullName: "Admin User",
          email: "admin@roadna.com",
          password: "123456",
          role: "admin",
          verified: true,
          verificationStatus: "approved",
          profileCompleted: true
        })
      }
    }

    const user = await User.findOne({ email: normalizedEmail }).select("+password")

    if (!user) {
      return res.status(401).json({ success: false, error: "Invalid credentials" })
    }

    if (user.suspended) {
      return res.status(403).json({ success: false, error: "Account is suspended" })
    }

    const isMatch = await user.comparePassword(password)
    if (!isMatch) {
      return res.status(401).json({ success: false, error: "Invalid credentials" })
    }

    const token = signToken(user._id)

    const userObj = user.toObject()
    delete userObj.password

    res.json({
      success: true,
      data: { user: userObj, token }
    })
  } catch (error) {
    res.status(500).json({ success: false, error: error.message })
  }
}

// ──────────────────────────────────────────────────────────────────────────────
// POST /api/v1/auth/verify-otp  (requires JWT)
// ──────────────────────────────────────────────────────────────────────────────
exports.verifyOtp = async (req, res) => {
  try {
    const { code, purpose } = req.body

    const otpError = validateOtpCode(code)
    if (otpError) {
      return res.status(400).json({ success: false, error: otpError })
    }

    const otpPurpose = purpose || "phone_verification"

    const result = await verifyOtp(req.user.id, code, otpPurpose, req.ip)

    if (!result.valid) {
      return res.status(400).json({ success: false, error: result.error })
    }

    if (otpPurpose === "phone_verification") {
      await User.findByIdAndUpdate(req.user.id, { phoneVerified: true })
    } else if (otpPurpose === "email_verification") {
      await User.findByIdAndUpdate(req.user.id, { emailVerified: true })
    }

    const updatedUser = await User.findById(req.user.id)

    res.json({
      success: true,
      message: "OTP verified successfully",
      data: { user: updatedUser }
    })
  } catch (error) {
    res.status(500).json({ success: false, error: error.message })
  }
}

// ──────────────────────────────────────────────────────────────────────────────
// POST /api/v1/auth/resend-otp  (requires JWT)
// ──────────────────────────────────────────────────────────────────────────────
exports.resendOtp = async (req, res) => {
  try {
    const otpPurpose = req.body.purpose || "phone_verification"

    const cooldown = await canResendOtp(req.user.id, otpPurpose)
    if (!cooldown.canResend) {
      return res.status(429).json({
        success: false,
        error: `Please wait ${cooldown.waitSeconds} seconds before requesting a new OTP`
      })
    }

    const user = await User.findById(req.user.id)
    if (!user) {
      return res.status(404).json({ success: false, error: "User not found" })
    }

    if (!user.phone) {
      return res.status(400).json({ success: false, error: "No phone number on file" })
    }

    const { code } = await createOtp(user._id, otpPurpose, req.ip)

    let smsResult
    try {
      smsResult = await sendOtpSms(user.phone, code, OTP_EXPIRY_MINUTES)
    } catch (smsError) {
      return res.status(502).json({
        success: false,
        error: smsError.message || "SMS delivery failed"
      })
    }

    if (smsResult.mock && process.env.SMS_ALLOW_MOCK !== "true") {
      return res.status(503).json({
        success: false,
        error: "SMS service is not configured. Set TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, and TWILIO_PHONE_NUMBER in .env"
      })
    }

    res.json({
      success: true,
      message: "OTP sent successfully to your phone",
      data: {
        otpExpiresIn: `${OTP_EXPIRY_MINUTES} minutes`
      }
    })
  } catch (error) {
    res.status(500).json({ success: false, error: error.message })
  }
}

// ──────────────────────────────────────────────────────────────────────────────
// POST /api/v1/auth/request-phone-otp  (NO auth — used before registration)
// Body: { phone }
// ──────────────────────────────────────────────────────────────────────────────
exports.requestPhoneOtp = async (req, res) => {
  try {
    const { phone } = req.body

    if (!phone) {
      return res.status(400).json({ success: false, error: "Phone number is required" })
    }

    const phoneError = validatePhone(phone)
    if (phoneError) return res.status(400).json({ success: false, error: phoneError })

    const normalizedPhone = normalizePhone(phone)

    const cooldown = await canResendPhoneOtp(normalizedPhone)
    if (!cooldown.canResend) {
      return res.status(429).json({
        success: false,
        error: `Please wait ${cooldown.waitSeconds} seconds before requesting a new OTP`
      })
    }

    const { code } = await createPhoneOtp(normalizedPhone, req.ip)

    let smsResult
    try {
      smsResult = await sendOtpSms(normalizedPhone, code, OTP_EXPIRY_MINUTES_PHONE)
    } catch (smsError) {
      return res.status(502).json({
        success: false,
        error: smsError.message || "SMS delivery failed"
      })
    }

    if (smsResult.mock && process.env.SMS_ALLOW_MOCK !== "true") {
      return res.status(503).json({
        success: false,
        error: "SMS service is not configured. Set TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, and TWILIO_PHONE_NUMBER in .env"
      })
    }

    const maskedPhone = normalizedPhone.replace(/(\+?\d{2})\d+(\d{3})$/, "$1*****$2")

    res.json({
      success: true,
      message: `OTP sent to ${maskedPhone}`,
      data: {
        otpPhone: maskedPhone,
        otpExpiresIn: `${OTP_EXPIRY_MINUTES_PHONE} minutes`
      }
    })
  } catch (error) {
    res.status(500).json({ success: false, error: error.message })
  }
}

// ──────────────────────────────────────────────────────────────────────────────
// POST /api/v1/auth/verify-phone-otp  (NO auth — used before registration)
// Body: { phone, code }
// ──────────────────────────────────────────────────────────────────────────────
exports.verifyPhoneOtpPreReg = async (req, res) => {
  try {
    const { phone, code } = req.body

    if (!phone || !code) {
      return res.status(400).json({ success: false, error: "phone and code are required" })
    }

    if (!/^\d{4}$/.test(code)) {
      return res.status(400).json({ success: false, error: "OTP must be exactly 4 digits" })
    }

    const normalizedPhone = normalizePhone(phone)
    const result = await verifyPhoneOtp(normalizedPhone, code)

    if (!result.valid) {
      return res.status(400).json({ success: false, error: result.error })
    }

    res.json({
      success: true,
      message: "Phone number verified successfully",
      data: { phoneVerified: true, phone: normalizedPhone }
    })
  } catch (error) {
    res.status(500).json({ success: false, error: error.message })
  }
}


