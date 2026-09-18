const validator = require("validator")

function validateEmail(email) {
  if (!email || typeof email !== "string") return "Email is required"
  if (!validator.isEmail(email)) return "Invalid email format"
  return null
}

function validatePassword(password) {
  if (!password || typeof password !== "string") return "Password is required"
  if (password.length < 8) return "Password must be at least 8 characters"
  return null
}

function validateOtpCode(code) {
  if (!code || typeof code !== "string") return "OTP code is required"
  if (!/^\d{4}$/.test(code)) return "OTP must be exactly 4 digits"
  return null
}

function validatePhone(phone) {
  if (!phone || typeof phone !== "string") return "Phone number is required"
  const cleaned = phone.replace(/[\s\-().+]/g, "")
  if (!/^\d{7,15}$/.test(cleaned)) return "Phone number must be between 7 and 15 digits"
  return null
}

function normalizePhone(phone) {
  if (!phone) return phone
  let cleaned = phone.replace(/[\s\-()]/g, "")
  // Add + if not present and starts with country code digits
  if (!cleaned.startsWith("+")) {
    // Egyptian numbers: 01x -> +201x
    if (/^01[0-9]{9}$/.test(cleaned)) {
      cleaned = "+2" + cleaned
    } else if (/^[0-9]/.test(cleaned)) {
      cleaned = "+" + cleaned
    }
  }
  return cleaned
}

function validateNationalId(id) {
  if (!id || typeof id !== "string") return "National ID is required"
  if (!/^\d{14}$/.test(id)) return "National ID must be exactly 14 digits"
  return null
}

function validatePagination(query) {
  const page = Math.max(1, parseInt(query.page) || 1)
  const limit = Math.min(100, Math.max(1, parseInt(query.limit) || 20))
  return { page, limit }
}

function sanitize(str) {
  if (typeof str !== "string") return str
  return validator.trim(str)
}

module.exports = {
  validateEmail,
  validatePassword,
  validateOtpCode,
  validatePhone,
  normalizePhone,
  validateNationalId,
  validatePagination,
  sanitize
}
