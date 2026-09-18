const express = require("express")
const router = express.Router()
const chatController = require("../controllers/chatController")
const protect = require("../middleware/authMiddleware")

router.use(protect)

router.get("/online-users", chatController.getOnlineUsers)
router.post("/conversations", chatController.createConversation)
router.get("/conversations", chatController.listConversations)
router.get("/conversations/:id", chatController.getConversation)
router.delete("/conversations/:id", chatController.deleteConversation)
router.post("/conversations/:id/messages", chatController.sendMessage)
router.get("/conversations/:id/messages", chatController.getMessages)
router.put("/conversations/:id/read", chatController.markConversationAsRead)
router.put("/messages/:id/read", chatController.markAsRead)
router.delete("/messages/:id", chatController.deleteMessage)

module.exports = router
