const express = require("express")
const router = express.Router()
const jwt = require("jsonwebtoken")
const User = require("../model/User")

// ── Middleware: verify token from query param and assert admin role ────────────
async function verifyAdminPage(req, res, next) {
  const token = req.query.token

  if (!token) {
    return res.redirect("/login")
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)

    if (!decoded.id) {
      return res.redirect("/login")
    }

    const user = await User.findById(decoded.id).select("_id fullName email role suspended")

    if (!user) {
      return res.redirect("/login")
    }

    if (user.suspended) {
      return res.status(403).send(
        "<h2 style='font-family:sans-serif;color:#dc3545;padding:40px;'>Your account has been suspended.</h2>"
      )
    }

    if (user.role !== "admin") {
      return res.status(403).send(
        `<!DOCTYPE html>
         <html><head><meta charset="UTF-8"/>
         <style>body{font-family:sans-serif;background:#f5f5f5;display:flex;align-items:center;
         justify-content:center;height:100vh;margin:0;}
         .box{background:#fff;padding:40px;border-radius:12px;text-align:center;
         box-shadow:0 4px 20px rgba(0,0,0,.1);}
         h2{color:#dc3545;margin-bottom:12px;}a{color:#f7971e;}</style>
         </head><body><div class="box">
         <h2>⛔ Admin Access Required</h2>
         <p>You do not have permission to access this page.</p>
         <p><a href="/">← Back to Home</a></p>
         </div></body></html>`
      )
    }

    req.adminUser = {
      id: user._id.toString(),
      fullName: user.fullName,
      email: user.email,
      role: user.role
    }
    req.adminToken = token

    next()
  } catch (err) {
    return res.redirect("/login")
  }
}

// ── Helper: build view locals ─────────────────────────────────────────────────
function viewLocals(req, title) {
  return {
    title,
    token: req.adminToken,
    user: req.adminUser
  }
}

// ── GET /admin  →  Admin Dashboard ───────────────────────────────────────────
router.get("/", verifyAdminPage, (req, res) => {
  res.render("admin/dashboard", viewLocals(req, "Admin Dashboard - Roadna"))
})

// ── GET /admin/users  →  Manage Users ────────────────────────────────────────
router.get("/users", verifyAdminPage, (req, res) => {
  res.render("admin/users", viewLocals(req, "Manage Users - Admin Dashboard"))
})

// ── GET /admin/trips  →  Manage Trips ────────────────────────────────────────
router.get("/trips", verifyAdminPage, (req, res) => {
  res.render("admin/trips", viewLocals(req, "Manage Trips - Admin Dashboard"))
})

// ── GET /admin/events  →  Manage Events ──────────────────────────────────────
router.get("/events", verifyAdminPage, (req, res) => {
  res.render("admin/events", viewLocals(req, "Manage Events - Admin Dashboard"))
})

module.exports = router
