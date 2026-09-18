const jwt = require("jsonwebtoken")
const User = require("../model/User")

module.exports = async (req, res, next) => {
  const authHeader = req.headers.authorization

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ success: false, error: "No token provided" })
  }

  const token = authHeader.split(" ")[1]

  if (!token) {
    return res.status(401).json({ success: false, error: "Malformed authorization header" })
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)

    if (!decoded.id) {
      return res.status(401).json({ success: false, error: "Invalid token payload" })
    }

    const user = await User.findById(decoded.id).select("_id role suspended")

    if (!user) {
      return res.status(401).json({ success: false, error: "User no longer exists" })
    }

    if (user.suspended) {
      return res.status(403).json({ success: false, error: "Account is suspended" })
    }

    req.user = { id: user._id.toString(), role: user.role }
    next()
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ success: false, error: "Token has expired. Please log in again." })
    }
    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({ success: false, error: "Invalid token" })
    }
    return res.status(401).json({ success: false, error: "Authentication failed" })
  }
}
