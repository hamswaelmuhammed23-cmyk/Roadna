const express = require("express")
const router = express.Router()
const authController = require("../controllers/authController")
const protect = require("../middleware/authMiddleware")
const rateLimiter = require("../utils/rateLimiter")

const otpLimiter = rateLimiter({
  windowMs: 60 * 1000,
  max: 3,
  keyGenerator: (req) => `otp:${req.user?.id || req.ip}`
})

const publicOtpLimiter = rateLimiter({
  windowMs: 60 * 1000,
  max: 3,
  keyGenerator: (req) => `pub-otp:${req.ip}`
})

const authLimiter = rateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 20,
  keyGenerator: (req) => `auth:${req.ip}`
})

router.post("/register", authLimiter, authController.register)
router.post("/login", authLimiter, authController.login)
router.get("/me", protect, authController.getMe)
router.post("/verify-otp", protect, otpLimiter, authController.verifyOtp)
router.post("/resend-otp", protect, otpLimiter, authController.resendOtp)

router.post("/request-phone-otp", publicOtpLimiter, authController.requestPhoneOtp)
router.post("/verify-phone-otp", publicOtpLimiter, authController.verifyPhoneOtpPreReg)

module.exports = router
