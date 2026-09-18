const Conversation = require("../model/Conversation")
const Message = require("../model/Message")
const User = require("../model/User")
const { validatePagination } = require("../utils/validators")
const { getOnlineUsers } = require("../socketHandler")

exports.createConversation = async (req, res) => {
  try {
    const { participantId } = req.body

    if (!participantId) {
      return res.status(400).json({ success: false, error: "participantId is required" })
    }

    if (participantId === req.user.id) {
      return res.status(400).json({ success: false, error: "Cannot create conversation with yourself" })
    }

    const participant = await User.findById(participantId)
    if (!participant) {
      return res.status(404).json({ success: false, error: "Participant not found" })
    }

    if (participant.suspended) {
      return res.status(400).json({ success: false, error: "Cannot message a suspended user" })
    }

    const existing = await Conversation.findOne({
      participants: { $all: [req.user.id, participantId], $size: 2 }
    })
      .populate("participants", "fullName email photo")
      .populate("lastMessage")

    if (existing) {
      return res.json({
        success: true,
        data: { conversation: existing },
        message: "Existing conversation returned"
      })
    }

    const conversation = await Conversation.create({
      participants: [req.user.id, participantId]
    })

    const populated = await Conversation.findById(conversation._id)
      .populate("participants", "fullName email photo")

    res.status(201).json({
      success: true,
      data: { conversation: populated }
    })
  } catch (error) {
    res.status(500).json({ success: false, error: error.message })
  }
}

exports.listConversations = async (req, res) => {
  try {
    const { page, limit } = validatePagination(req.query)

    const filter = { participants: req.user.id }

    const [conversations, total] = await Promise.all([
      Conversation.find(filter)
        .populate("participants", "fullName email photo")
        .populate("lastMessage")
        .sort({ lastMessageAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      Conversation.countDocuments(filter)
    ])

    const withUnread = await Promise.all(
      conversations.map(async (conv) => {
        const unreadCount = await Message.countDocuments({
          conversation: conv._id,
          sender: { $ne: req.user.id },
          readBy: { $ne: req.user.id }
        })
        return { ...conv, unreadCount }
      })
    )

    res.json({
      success: true,
      data: {
        conversations: withUnread,
        total,
        page,
        totalPages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    res.status(500).json({ success: false, error: error.message })
  }
}

exports.getConversation = async (req, res) => {
  try {
    const conversation = await Conversation.findById(req.params.id)
      .populate("participants", "fullName email photo")
      .populate("lastMessage")

    if (!conversation) {
      return res.status(404).json({ success: false, error: "Conversation not found" })
    }

    const isParticipant = conversation.participants.some(
      p => p._id.toString() === req.user.id
    )
    if (!isParticipant) {
      return res.status(403).json({ success: false, error: "Not a participant in this conversation" })
    }

    res.json({ success: true, data: { conversation } })
  } catch (error) {
    res.status(500).json({ success: false, error: error.message })
  }
}

exports.sendMessage = async (req, res) => {
  try {
    const { content } = req.body

    if (!content || typeof content !== "string" || !content.trim()) {
      return res.status(400).json({ success: false, error: "Message content is required" })
    }

    if (content.length > 5000) {
      return res.status(400).json({ success: false, error: "Message too long (max 5000 characters)" })
    }

    const conversation = await Conversation.findById(req.params.id)
    if (!conversation) {
      return res.status(404).json({ success: false, error: "Conversation not found" })
    }

    const isParticipant = conversation.participants.some(
      p => p.toString() === req.user.id
    )
    if (!isParticipant) {
      return res.status(403).json({ success: false, error: "Not a participant in this conversation" })
    }

    const message = await Message.create({
      conversation: conversation._id,
      sender: req.user.id,
      content: content.trim(),
      readBy: [req.user.id]
    })

    conversation.lastMessage = message._id
    conversation.lastMessageAt = message.createdAt
    await conversation.save()

    const populated = await Message.findById(message._id)
      .populate("sender", "fullName photo")
      .lean()

    const io = req.app.get("io")
    if (io) {
      io.to(conversation._id.toString()).emit("receive_message", {
        message: populated,
        conversationId: conversation._id.toString()
      })
    }

    res.status(201).json({
      success: true,
      data: { message: populated }
    })
  } catch (error) {
    res.status(500).json({ success: false, error: error.message })
  }
}

exports.getMessages = async (req, res) => {
  try {
    const { page, limit } = validatePagination(req.query)

    const conversation = await Conversation.findById(req.params.id)
    if (!conversation) {
      return res.status(404).json({ success: false, error: "Conversation not found" })
    }

    const isParticipant = conversation.participants.some(
      p => p.toString() === req.user.id
    )
    if (!isParticipant) {
      return res.status(403).json({ success: false, error: "Not a participant in this conversation" })
    }

    const [messages, total] = await Promise.all([
      Message.find({ conversation: conversation._id })
        .populate("sender", "fullName photo")
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      Message.countDocuments({ conversation: conversation._id })
    ])

    res.json({
      success: true,
      data: {
        messages: messages.reverse(),
        total,
        page,
        totalPages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    res.status(500).json({ success: false, error: error.message })
  }
}

exports.markAsRead = async (req, res) => {
  try {
    const message = await Message.findById(req.params.id)
    if (!message) {
      return res.status(404).json({ success: false, error: "Message not found" })
    }

    const conversation = await Conversation.findById(message.conversation)
    const isParticipant = conversation?.participants.some(
      p => p.toString() === req.user.id
    )
    if (!isParticipant) {
      return res.status(403).json({ success: false, error: "Not authorized" })
    }

    if (!message.readBy.map(id => id.toString()).includes(req.user.id)) {
      message.readBy.push(req.user.id)
      await message.save()
    }

    res.json({ success: true, message: "Message marked as read" })
  } catch (error) {
    res.status(500).json({ success: false, error: error.message })
  }
}

exports.markConversationAsRead = async (req, res) => {
  try {
    const conversation = await Conversation.findById(req.params.id)
    if (!conversation) {
      return res.status(404).json({ success: false, error: "Conversation not found" })
    }

    const isParticipant = conversation.participants.some(
      p => p.toString() === req.user.id
    )
    if (!isParticipant) {
      return res.status(403).json({ success: false, error: "Not authorized" })
    }

    await Message.updateMany(
      {
        conversation: conversation._id,
        readBy: { $ne: req.user.id }
      },
      { $addToSet: { readBy: req.user.id } }
    )

    res.json({ success: true, message: "All messages marked as read" })
  } catch (error) {
    res.status(500).json({ success: false, error: error.message })
  }
}

exports.deleteMessage = async (req, res) => {
  try {
    const message = await Message.findById(req.params.id)
    if (!message) {
      return res.status(404).json({ success: false, error: "Message not found" })
    }

    if (message.sender.toString() !== req.user.id) {
      return res.status(403).json({ success: false, error: "Can only delete your own messages" })
    }

    const conversation = await Conversation.findById(message.conversation)

    await message.deleteOne()

    if (conversation && conversation.lastMessage?.toString() === req.params.id) {
      const latestMsg = await Message.findOne({ conversation: conversation._id })
        .sort({ createdAt: -1 })
      conversation.lastMessage = latestMsg ? latestMsg._id : null
      conversation.lastMessageAt = latestMsg ? latestMsg.createdAt : conversation.createdAt
      await conversation.save()
    }

    res.json({ success: true, message: "Message deleted" })
  } catch (error) {
    res.status(500).json({ success: false, error: error.message })
  }
}

exports.deleteConversation = async (req, res) => {
  try {
    const conversation = await Conversation.findById(req.params.id)
    if (!conversation) {
      return res.status(404).json({ success: false, error: "Conversation not found" })
    }

    const isParticipant = conversation.participants.some(
      p => p.toString() === req.user.id
    )
    if (!isParticipant) {
      return res.status(403).json({ success: false, error: "Not a participant in this conversation" })
    }

    await Message.deleteMany({ conversation: conversation._id })
    await conversation.deleteOne()

    res.json({ success: true, message: "Conversation and all messages deleted" })
  } catch (error) {
    res.status(500).json({ success: false, error: error.message })
  }
}

exports.getOnlineUsers = (req, res) => {
  try {
    res.json({ success: true, data: { onlineUsers: getOnlineUsers() } })
  } catch (error) {
    res.status(500).json({ success: false, error: error.message })
  }
}
