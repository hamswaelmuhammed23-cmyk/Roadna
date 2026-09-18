const jwt = require("jsonwebtoken")
const User = require("./model/User")
const Conversation = require("./model/Conversation")
const Message = require("./model/Message")

// userId → Set of socketIds (supports multiple tabs/devices per user)
const onlineUsers = new Map()

function addOnlineUser(userId, socketId) {
  if (!onlineUsers.has(userId)) {
    onlineUsers.set(userId, new Set())
  }
  onlineUsers.get(userId).add(socketId)
}

function removeOnlineUser(userId, socketId) {
  if (!onlineUsers.has(userId)) return
  onlineUsers.get(userId).delete(socketId)
  if (onlineUsers.get(userId).size === 0) {
    onlineUsers.delete(userId)
  }
}

function isUserOnline(userId) {
  return onlineUsers.has(userId) && onlineUsers.get(userId).size > 0
}

function emitToUser(io, userId, event, data) {
  const sockets = onlineUsers.get(userId)
  if (!sockets) return
  for (const socketId of sockets) {
    io.to(socketId).emit(event, data)
  }
}

function initSocket(io) {

  // ── JWT authentication middleware ────────────────────────────────────────────
  io.use(async (socket, next) => {
    try {
      const token =
        socket.handshake.auth?.token ||
        socket.handshake.query?.token

      if (!token) {
        return next(new Error("Authentication required"))
      }

      let decoded
      try {
        decoded = jwt.verify(token, process.env.JWT_SECRET)
      } catch {
        return next(new Error("Invalid or expired token"))
      }

      const user = await User.findById(decoded.id).select("_id fullName role suspended")

      if (!user) return next(new Error("User not found"))
      if (user.suspended) return next(new Error("Account suspended"))

      socket.user = {
        id: user._id.toString(),
        fullName: user.fullName,
        role: user.role
      }

      next()
    } catch (err) {
      next(new Error("Authentication error"))
    }
  })

  // ── Connection ───────────────────────────────────────────────────────────────
  io.on("connection", (socket) => {
    const userId = socket.user.id

    addOnlineUser(userId, socket.id)
    io.emit("user_online", { userId })

    // ── join_room ──────────────────────────────────────────────────────────────
    socket.on("join_room", async (conversationId, callback) => {
      try {
        if (!conversationId) {
          return callback?.({ error: "conversationId is required" })
        }

        const conversation = await Conversation.findById(conversationId)
        if (!conversation) {
          return callback?.({ error: "Conversation not found" })
        }

        const isParticipant = conversation.participants.some(
          p => p.toString() === userId
        )
        if (!isParticipant) {
          return callback?.({ error: "Not a participant in this conversation" })
        }

        socket.join(conversationId)
        callback?.({ success: true, conversationId })
      } catch (err) {
        callback?.({ error: "Failed to join room" })
      }
    })

    // ── leave_room ─────────────────────────────────────────────────────────────
    socket.on("leave_room", (conversationId) => {
      if (conversationId) socket.leave(conversationId)
    })

    // ── send_message ───────────────────────────────────────────────────────────
    socket.on("send_message", async (data, callback) => {
      try {
        const { conversationId, content } = data || {}

        if (!conversationId) {
          return callback?.({ error: "conversationId is required" })
        }

        if (!content || typeof content !== "string" || !content.trim()) {
          return callback?.({ error: "Message content is required" })
        }

        if (content.length > 5000) {
          return callback?.({ error: "Message too long (max 5000 characters)" })
        }

        const conversation = await Conversation.findById(conversationId)
        if (!conversation) {
          return callback?.({ error: "Conversation not found" })
        }

        const isParticipant = conversation.participants.some(
          p => p.toString() === userId
        )
        if (!isParticipant) {
          return callback?.({ error: "Not a participant in this conversation" })
        }

        const message = await Message.create({
          conversation: conversation._id,
          sender: userId,
          content: content.trim(),
          readBy: [userId]
        })

        conversation.lastMessage = message._id
        conversation.lastMessageAt = message.createdAt
        await conversation.save()

        const populated = await Message.findById(message._id)
          .populate("sender", "fullName photo")
          .lean()

        // Emit to everyone in the room (including sender)
        io.to(conversationId).emit("receive_message", {
          message: populated,
          conversationId
        })

        // Push notification to participants not currently in the room
        for (const pid of conversation.participants) {
          const participantId = pid.toString()
          if (participantId !== userId) {
            emitToUser(io, participantId, "new_message_notification", {
              conversationId,
              message: populated
            })
          }
        }

        callback?.({ success: true, message: populated })
      } catch (err) {
        callback?.({ error: "Failed to send message" })
      }
    })

    // ── typing ─────────────────────────────────────────────────────────────────
    socket.on("typing", (conversationId) => {
      if (conversationId) {
        socket.to(conversationId).emit("user_typing", {
          userId,
          fullName: socket.user.fullName,
          conversationId
        })
      }
    })

    // ── stop_typing ────────────────────────────────────────────────────────────
    socket.on("stop_typing", (conversationId) => {
      if (conversationId) {
        socket.to(conversationId).emit("user_stop_typing", {
          userId,
          conversationId
        })
      }
    })

    // ── mark_read ──────────────────────────────────────────────────────────────
    socket.on("mark_read", async (data, callback) => {
      try {
        const { conversationId } = data || {}
        if (!conversationId) {
          return callback?.({ error: "conversationId is required" })
        }

        const conversation = await Conversation.findById(conversationId)
        if (!conversation) return callback?.({ error: "Conversation not found" })

        const isParticipant = conversation.participants.some(
          p => p.toString() === userId
        )
        if (!isParticipant) return callback?.({ error: "Not a participant" })

        await Message.updateMany(
          {
            conversation: conversationId,
            readBy: { $ne: userId }
          },
          { $addToSet: { readBy: userId } }
        )

        socket.to(conversationId).emit("messages_read", {
          conversationId,
          readBy: userId
        })

        callback?.({ success: true })
      } catch (err) {
        callback?.({ error: "Failed to mark messages as read" })
      }
    })

    // ── get_online_users ───────────────────────────────────────────────────────
    socket.on("get_online_users", (callback) => {
      callback?.({ success: true, onlineUsers: [...onlineUsers.keys()] })
    })

    // ── disconnect ─────────────────────────────────────────────────────────────
    socket.on("disconnect", () => {
      removeOnlineUser(userId, socket.id)
      if (!isUserOnline(userId)) {
        io.emit("user_offline", { userId })
      }
    })
  })
}

function getOnlineUsers() {
  return [...onlineUsers.keys()]
}

module.exports = { initSocket, getOnlineUsers }
