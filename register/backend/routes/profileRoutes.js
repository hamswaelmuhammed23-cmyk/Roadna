// register/backend/routes/profileRoutes.js

const express = require("express")
const router = express.Router()
const profileController = require("../controllers/profileController")
const protect = require("../middleware/authMiddleware")

// ── Own profile (auth required) — MUST be before /:id ──
router.get("/",             protect, profileController.getProfile)
router.put("/",             protect, profileController.updateProfile)
router.get("/activity",     protect, profileController.getMyActivity)

// ── Activity actions (auth required) ──
router.post("/join-trip",   protect, profileController.joinTrip)
router.post("/leave-trip",  protect, profileController.leaveTrip)
router.post("/join-event",  protect, profileController.joinEvent)
router.post("/leave-event", protect, profileController.leaveEvent)
router.post("/save-trip",   protect, profileController.saveTrip)
router.post("/unsave-trip", protect, profileController.unsaveTrip)

// ── Public routes — /:id MUST be last ──
router.get("/:id/activity", profileController.getPublicActivity)
router.get("/:id",          profileController.getPublicProfile)

module.exports = router