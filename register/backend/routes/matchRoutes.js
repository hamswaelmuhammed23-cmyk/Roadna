const express = require("express")
const router = express.Router()
const matchController = require("../controllers/matchController")
const protect = require("../middleware/authMiddleware")

router.get("/", protect, matchController.getMatches)
router.get("/interests", protect, matchController.getInterestMatches)
router.get("/shared", protect, matchController.getMatchedBySharedInterests)
router.get("/stats", protect, matchController.getMatchStats)
router.get("/score/:userId", protect, matchController.getMatchScoreWithUser)

module.exports = router
