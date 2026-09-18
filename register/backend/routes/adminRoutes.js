const express = require("express")
const router = express.Router()
const adminController = require("../controllers/adminController")
const protect = require("../middleware/authMiddleware")
const admin = require("../middleware/adminMiddleware")

// ── Public — first-time admin bootstrap (requires ADMIN_SETUP_KEY) ────────────
router.post("/setup", adminController.setupAdmin)

// All routes below require authentication + admin role
router.use(protect, admin)

// ── Dashboard ─────────────────────────────────────────────────────────────────
router.get("/dashboard", adminController.getDashboard)

// ── User management ───────────────────────────────────────────────────────────
router.get("/users",                       adminController.listUsers)
router.get("/users/:id",                   adminController.getUserDetails)
router.put("/users/:id",                   adminController.updateUser)
router.put("/users/:id/verify",            adminController.updateVerification)
router.put("/users/:id/suspend",           adminController.suspendUser)
router.put("/users/:id/role",              adminController.promoteUser)
router.post("/users/:id/reset-password",   adminController.resetUserPassword)
router.put("/users/:id/reset-password",    adminController.resetUserPassword)
router.delete("/users/:id",                adminController.deleteUser)

// ── Verification audit logs ───────────────────────────────────────────────────
router.get("/verification-logs",           adminController.getVerificationLogs)
router.get("/verification-logs/:userId",   adminController.getVerificationLogs)

// ── Trip management ───────────────────────────────────────────────────────────
router.get("/trips",        adminController.getAdminTrips)
router.get("/trips/:id",    adminController.getAdminTripById)
router.put("/trips/:id",    adminController.updateAdminTrip)
router.delete("/trips/:id", adminController.deleteAdminTrip)

// ── Event management ──────────────────────────────────────────────────────────
router.get("/events",        adminController.getAdminEvents)
router.get("/events/:id",    adminController.getAdminEventById)
router.put("/events/:id",    adminController.updateAdminEvent)
router.delete("/events/:id", adminController.deleteAdminEvent)

module.exports = router
