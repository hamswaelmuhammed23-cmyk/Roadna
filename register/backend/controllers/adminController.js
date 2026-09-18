const User = require("../model/User")
const Conversation = require("../model/Conversation")
const Message = require("../model/Message")
const VerificationLog = require("../model/VerificationLog")
const Trip = require("../model/Trip")
const Event = require("../model/Event")
const { validatePagination } = require("../utils/validators")

// ── Helper: map a Mongoose User doc → frontend-expected shape ─────────────────
function mapUser(u) {
  const doc = u.toObject ? u.toObject() : u
  return {
    id: doc._id.toString(),
    email: doc.email || "",
    username: doc.fullName || "",          // field alias – project has no separate username
    full_name: doc.fullName || "",
    location: doc.country || "",           // project stores country, exposed as location
    bio: doc.bio || "",
    travel_style: doc.travelStyle || null,
    is_active: doc.suspended !== true,     // inverted: active = not suspended
    is_admin: doc.role === "admin" ? 1 : 0,
    is_verified: doc.verified ? 1 : 0,
    phone: doc.phone || "",
    age: doc.age || null,
    language: doc.language || "",
    interests: doc.interests || [],
    personalityType: doc.personalityType || null,
    verificationStatus: doc.verificationStatus || "pending",
    phoneVerified: doc.phoneVerified || false,
    profileCompleted: doc.profileCompleted || false,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt
  }
}

// ── GET /api/v1/admin/dashboard ───────────────────────────────────────────────
exports.getDashboard = async (req, res) => {
  try {
    const [
      totalUsers,
      activeUsers,
      suspendedUsers,
      verifiedUsers,
      pendingVerification,
      rejectedVerification,
      adminCount,
      totalConversations,
      totalMessages,
      totalTrips,
      openTrips,
      totalEvents,
      activeEvents,
      recentUsers
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ suspended: { $ne: true } }),
      User.countDocuments({ suspended: true }),
      User.countDocuments({ verified: true }),
      User.countDocuments({ verificationStatus: "pending" }),
      User.countDocuments({ verificationStatus: "rejected" }),
      User.countDocuments({ role: "admin" }),
      Conversation.countDocuments(),
      Message.countDocuments(),
      Trip.countDocuments(),
      Trip.countDocuments({ status: "open" }),
      Event.countDocuments(),
      Event.countDocuments({ isActive: true }),
      User.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .select("fullName email createdAt verificationStatus suspended role verified")
        .lean()
    ])

    const totalTripParticipants = await Trip.aggregate([
      { $project: { count: { $size: "$participants" } } },
      { $group: { _id: null, total: { $sum: "$count" } } }
    ]).then(r => r[0]?.total || 0)

    const totalEventParticipants = await Event.aggregate([
      { $project: { count: { $size: "$participants" } } },
      { $group: { _id: null, total: { $sum: "$count" } } }
    ]).then(r => r[0]?.total || 0)

    res.json({
      success: true,
      data: {
        totalUsers,
        activeUsers,
        totalTrips,
        totalEvents,
        totalTripParticipants,
        totalEventParticipants,
        openTrips,
        activeEvents,
        // Extended stats for internal use
        suspendedUsers,
        verifiedUsers,
        pendingVerification,
        rejectedVerification,
        adminCount,
        totalConversations,
        totalMessages,
        recentUsers: recentUsers.map(u => ({
          id: u._id.toString(),
          full_name: u.fullName,
          email: u.email,
          is_active: u.suspended !== true,
          is_admin: u.role === "admin" ? 1 : 0,
          is_verified: u.verified ? 1 : 0,
          verificationStatus: u.verificationStatus,
          createdAt: u.createdAt
        }))
      }
    })
  } catch (error) {
    res.status(500).json({ success: false, error: error.message })
  }
}

// ── GET /api/v1/admin/users ───────────────────────────────────────────────────
exports.listUsers = async (req, res) => {
  try {
    const { page, limit } = validatePagination(req.query)
    const { status, search, suspended, role } = req.query

    const filter = {}
    if (status) filter.verificationStatus = status
    if (suspended === "true") filter.suspended = true
    if (suspended === "false") filter.suspended = { $ne: true }
    if (role) filter.role = role
    if (search) {
      filter.$or = [
        { fullName: { $regex: search, $options: "i" } },
        { email:    { $regex: search, $options: "i" } },
        { phone:    { $regex: search, $options: "i" } }
      ]
    }

    const [users, total] = await Promise.all([
      User.find(filter)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      User.countDocuments(filter)
    ])

    res.json({
      success: true,
      data: {
        users: users.map(u => ({
          id: u._id.toString(),
          email: u.email,
          username: u.fullName,
          full_name: u.fullName,
          location: u.country || "",
          is_active: u.suspended !== true,
          is_admin: u.role === "admin" ? 1 : 0,
          is_verified: u.verified ? 1 : 0,
          verificationStatus: u.verificationStatus,
          createdAt: u.createdAt
        })),
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      }
    })
  } catch (error) {
    res.status(500).json({ success: false, error: error.message })
  }
}

// ── GET /api/v1/admin/users/:id ───────────────────────────────────────────────
exports.getUserDetails = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).lean()
    if (!user) {
      return res.status(404).json({ success: false, error: "User not found" })
    }

    const [verificationLogs, conversationCount, messageCount] = await Promise.all([
      VerificationLog.find({ userId: user._id })
        .sort({ createdAt: -1 })
        .limit(50)
        .lean(),
      Conversation.countDocuments({ participants: user._id }),
      Message.countDocuments({ sender: user._id })
    ])

    res.json({
      success: true,
      data: {
        id: user._id.toString(),
        email: user.email,
        username: user.fullName,
        full_name: user.fullName,
        location: user.country || "",
        bio: user.bio || "",
        travel_style: user.travelStyle || null,
        interests: user.interests || [],
        languages: user.language ? [user.language] : [],
        is_active: user.suspended !== true,
        is_admin: user.role === "admin" ? 1 : 0,
        is_verified: user.verified ? 1 : 0,
        phone: user.phone || "",
        age: user.age || null,
        personalityType: user.personalityType || null,
        verificationStatus: user.verificationStatus,
        phoneVerified: user.phoneVerified || false,
        profileCompleted: user.profileCompleted || false,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        stats: { conversations: conversationCount, messages: messageCount },
        verificationLogs
      }
    })
  } catch (error) {
    res.status(500).json({ success: false, error: error.message })
  }
}

// ── PUT /api/v1/admin/users/:id ───────────────────────────────────────────────
// Accepts frontend format: { email, username, full_name, location, is_active, is_admin }
exports.updateUser = async (req, res) => {
  try {
    const { email, username, full_name, location, is_active, is_admin, bio, travel_style, budget_min, budget_max } = req.body

    const user = await User.findById(req.params.id)
    if (!user) {
      return res.status(404).json({ success: false, error: "User not found" })
    }

    // Build update object translating frontend fields → schema fields
    const updates = {}

    if (email !== undefined) {
      const existing = await User.findOne({ email, _id: { $ne: user._id } })
      if (existing) {
        return res.status(400).json({ success: false, error: "Email already in use" })
      }
      updates.email = email.toLowerCase().trim()
    }

    // Accept either full_name or username (both map to fullName).
    // Pick whichever field the admin actually changed.
    const currentName = user.fullName || ""
    const fullNameInput = typeof full_name === "string" ? full_name.trim() : undefined
    const usernameInput = typeof username === "string" ? username.trim() : undefined
    let nextName

    if (fullNameInput !== undefined && fullNameInput !== currentName) {
      nextName = fullNameInput
    } else if (usernameInput !== undefined && usernameInput !== currentName) {
      nextName = usernameInput
    } else if (fullNameInput !== undefined) {
      nextName = fullNameInput
    } else if (usernameInput !== undefined) {
      nextName = usernameInput
    }

    if (nextName !== undefined) {
      updates.fullName = nextName
    }

    if (location !== undefined) {
      updates.country = location
    }

    if (bio !== undefined) {
      updates.bio = bio
    }

    if (travel_style !== undefined) {
      updates.travelStyle = travel_style
    }

    if (is_active !== undefined) {
      const active = is_active === true || is_active === 1 || is_active === "true"
      if (!active && user.role === "admin") {
        return res.status(400).json({ success: false, error: "Cannot deactivate an admin account" })
      }
      updates.suspended = !active
    }

    if (is_admin !== undefined) {
      const makeAdmin = is_admin === true || is_admin === 1 || is_admin === "true"
      if (!makeAdmin && user._id.toString() === req.user.id) {
        return res.status(400).json({ success: false, error: "Cannot remove your own admin rights" })
      }
      updates.role = makeAdmin ? "admin" : "user"
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ success: false, error: "No valid fields to update" })
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      { $set: updates },
      { returnDocument: "after", runValidators: false }
    ).lean()

    await VerificationLog.create({
      userId: user._id,
      action: "account_activated",
      performedBy: req.user.id,
      details: `User profile updated by admin`,
      ip: req.ip
    })

    res.json({
      success: true,
      message: "User updated successfully",
      data: {
        id: updatedUser._id.toString(),
        email: updatedUser.email,
        username: updatedUser.fullName,
        full_name: updatedUser.fullName,
        location: updatedUser.country || "",
        is_active: updatedUser.suspended !== true,
        is_admin: updatedUser.role === "admin" ? 1 : 0,
        is_verified: updatedUser.verified ? 1 : 0,
        createdAt: updatedUser.createdAt,
        updatedAt: updatedUser.updatedAt
      }
    })
  } catch (error) {
    res.status(500).json({ success: false, error: error.message })
  }
}

// ── PUT /api/v1/admin/users/:id/verify ───────────────────────────────────────
exports.updateVerification = async (req, res) => {
  try {
    const { status, reason } = req.body

    if (!["approved", "rejected"].includes(status)) {
      return res.status(400).json({
        success: false,
        error: "Status must be 'approved' or 'rejected'"
      })
    }

    const user = await User.findById(req.params.id)
    if (!user) {
      return res.status(404).json({ success: false, error: "User not found" })
    }

    user.verificationStatus = status
    user.verified = status === "approved"
    await user.save()

    await VerificationLog.create({
      userId: user._id,
      action: status === "approved" ? "identity_approved" : "identity_rejected",
      performedBy: req.user.id,
      details: reason || `Verification ${status} by admin`,
      ip: req.ip
    })

    res.json({
      success: true,
      message: `User verification ${status}`,
      data: mapUser(user)
    })
  } catch (error) {
    res.status(500).json({ success: false, error: error.message })
  }
}

// ── PUT /api/v1/admin/users/:id/suspend ──────────────────────────────────────
exports.suspendUser = async (req, res) => {
  try {
    const { suspend, reason } = req.body

    if (typeof suspend !== "boolean") {
      return res.status(400).json({
        success: false,
        error: "'suspend' field must be a boolean"
      })
    }

    const user = await User.findById(req.params.id)
    if (!user) {
      return res.status(404).json({ success: false, error: "User not found" })
    }

    if (user.role === "admin") {
      return res.status(400).json({
        success: false,
        error: "Cannot suspend an admin account"
      })
    }

    user.suspended = suspend
    await user.save()

    await VerificationLog.create({
      userId: user._id,
      action: suspend ? "account_suspended" : "account_activated",
      performedBy: req.user.id,
      details: reason || `Account ${suspend ? "suspended" : "activated"} by admin`,
      ip: req.ip
    })

    res.json({
      success: true,
      message: `User ${suspend ? "suspended" : "activated"} successfully`,
      data: mapUser(user)
    })
  } catch (error) {
    res.status(500).json({ success: false, error: error.message })
  }
}

// ── PUT /api/v1/admin/users/:id/reset-password ───────────────────────────────
exports.resetUserPassword = async (req, res) => {
  try {
    const newPassword = req.body.newPassword || req.body.new_password

    if (!newPassword || newPassword.length < 8) {
      return res.status(400).json({
        success: false,
        error: "newPassword is required and must be at least 8 characters"
      })
    }

    const user = await User.findById(req.params.id).select("+password")
    if (!user) {
      return res.status(404).json({ success: false, error: "User not found" })
    }

    if (user.role === "admin" && user._id.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: "Cannot reset another admin's password"
      })
    }

    user.password = newPassword
    await user.save()

    await VerificationLog.create({
      userId: user._id,
      action: "account_activated",
      performedBy: req.user.id,
      details: "Password reset by admin",
      ip: req.ip
    })

    res.json({ success: true, message: "Password reset successfully" })
  } catch (error) {
    res.status(500).json({ success: false, error: error.message })
  }
}

// ── DELETE /api/v1/admin/users/:id ───────────────────────────────────────────
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
    if (!user) {
      return res.status(404).json({ success: false, error: "User not found" })
    }

    if (user.role === "admin") {
      return res.status(400).json({
        success: false,
        error: "Cannot delete an admin account"
      })
    }

    if (user._id.toString() === req.user.id) {
      return res.status(400).json({
        success: false,
        error: "Cannot delete your own account"
      })
    }

    await Promise.all([
      Message.deleteMany({ sender: user._id }),
      Conversation.deleteMany({ participants: user._id }),
      VerificationLog.deleteMany({ userId: user._id }),
      User.findByIdAndDelete(user._id)
    ])

    res.json({ success: true, message: "User and associated data deleted successfully" })
  } catch (error) {
    res.status(500).json({ success: false, error: error.message })
  }
}

// ── GET /api/v1/admin/verification-logs[/:userId] ────────────────────────────
exports.getVerificationLogs = async (req, res) => {
  try {
    const { page, limit } = validatePagination(req.query)
    const filter = {}

    if (req.params.userId) {
      filter.userId = req.params.userId
    }
    if (req.query.action) {
      filter.action = req.query.action
    }

    const [logs, total] = await Promise.all([
      VerificationLog.find(filter)
        .populate("userId", "fullName email")
        .populate("performedBy", "fullName email")
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      VerificationLog.countDocuments(filter)
    ])

    res.json({
      success: true,
      data: { logs, total, page, totalPages: Math.ceil(total / limit) }
    })
  } catch (error) {
    res.status(500).json({ success: false, error: error.message })
  }
}

// ── POST /api/v1/admin/setup  (PUBLIC — first-time admin bootstrap) ───────────
exports.setupAdmin = async (req, res) => {
  try {
    const { email, setupKey } = req.body

    if (!process.env.ADMIN_SETUP_KEY) {
      return res.status(500).json({
        success: false,
        error: "ADMIN_SETUP_KEY not configured on server"
      })
    }

    if (setupKey !== process.env.ADMIN_SETUP_KEY) {
      return res.status(403).json({ success: false, error: "Invalid setup key" })
    }

    const existingAdmin = await User.findOne({ role: "admin" })
    if (existingAdmin) {
      return res.status(400).json({
        success: false,
        error: "Admin already exists. Use an existing admin to promote users."
      })
    }

    const user = await User.findOne({ email })
    if (!user) {
      return res.status(404).json({ success: false, error: "User not found with that email" })
    }

    user.role = "admin"
    await user.save()

    res.json({
      success: true,
      message: `${user.fullName} has been promoted to admin`
    })
  } catch (error) {
    res.status(500).json({ success: false, error: error.message })
  }
}

// ── PUT /api/v1/admin/users/:id/role ─────────────────────────────────────────
exports.promoteUser = async (req, res) => {
  try {
    const { role } = req.body

    if (!["user", "admin"].includes(role)) {
      return res.status(400).json({
        success: false,
        error: "Role must be 'user' or 'admin'"
      })
    }

    if (req.params.id === req.user.id && role === "user") {
      return res.status(400).json({
        success: false,
        error: "Cannot demote yourself"
      })
    }

    const user = await User.findById(req.params.id)
    if (!user) {
      return res.status(404).json({ success: false, error: "User not found" })
    }

    user.role = role
    await user.save()

    res.json({
      success: true,
      message: `User role updated to ${role}`,
      data: mapUser(user)
    })
  } catch (error) {
    res.status(500).json({ success: false, error: error.message })
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// TRIPS — Admin API
// ─────────────────────────────────────────────────────────────────────────────

// ── GET /api/v1/admin/trips ───────────────────────────────────────────────────
exports.getAdminTrips = async (req, res) => {
  try {
    const { page, limit } = validatePagination(req.query)
    const { search, status } = req.query

    const filter = {}
    if (status) filter.status = status
    if (search) {
      filter.$or = [
        { title:       { $regex: search, $options: "i" } },
        { destination: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } }
      ]
    }

    const [trips, total] = await Promise.all([
      Trip.find(filter)
        .populate("host", "fullName email")
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      Trip.countDocuments(filter)
    ])

    res.json({
      success: true,
      data: {
        trips: trips.map(t => ({
          id: t._id.toString(),
          title: t.title,
          destination: t.destination || "",
          description: t.description || "",
          host_name: t.host?.fullName || "",
          host_username: t.host?.fullName || "",
          host_email: t.host?.email || "",
          status: t.status || "open",
          start_date: t.startDate || null,
          end_date: t.endDate || null,
          max_participants: t.maxParticipants || null,
          participant_count: (t.participants || []).length,
          createdAt: t.createdAt
        })),
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      }
    })
  } catch (error) {
    res.status(500).json({ success: false, error: error.message })
  }
}

// ── GET /api/v1/admin/trips/:id ───────────────────────────────────────────────
exports.getAdminTripById = async (req, res) => {
  try {
    const trip = await Trip.findById(req.params.id)
      .populate("host", "fullName email")
      .populate("participants", "fullName email")
      .lean()

    if (!trip) {
      return res.status(404).json({ success: false, error: "Trip not found" })
    }

    res.json({
      success: true,
      data: {
        id: trip._id.toString(),
        title: trip.title,
        destination: trip.destination,
        description: trip.description,
        host_name: trip.host?.fullName || "",
        host_email: trip.host?.email || "",
        status: trip.status,
        start_date: trip.startDate,
        end_date: trip.endDate,
        max_participants: trip.maxParticipants,
        participants: trip.participants,
        tags: trip.tags,
        createdAt: trip.createdAt
      }
    })
  } catch (error) {
    res.status(500).json({ success: false, error: error.message })
  }
}

// ── PUT /api/v1/admin/trips/:id ───────────────────────────────────────────────
exports.updateAdminTrip = async (req, res) => {
  try {
    const { title, description, destination, start_date, end_date,
            budget_min, budget_max, activity_type, status, max_participants } = req.body

    const trip = await Trip.findById(req.params.id)
    if (!trip) {
      return res.status(404).json({ success: false, error: "Trip not found" })
    }

    if (title !== undefined) trip.title = title
    if (description !== undefined) trip.description = description
    if (destination !== undefined) trip.destination = destination
    if (start_date !== undefined) trip.startDate = start_date
    if (end_date !== undefined) trip.endDate = end_date
    if (budget_min !== undefined) trip.budgetMin = budget_min
    if (budget_max !== undefined) trip.budgetMax = budget_max
    if (activity_type !== undefined) trip.activityType = activity_type
    if (status !== undefined) trip.status = status
    if (max_participants !== undefined) trip.maxParticipants = max_participants

    await trip.save()

    res.json({ success: true, message: "Trip updated successfully" })
  } catch (error) {
    res.status(500).json({ success: false, error: error.message })
  }
}

// ── DELETE /api/v1/admin/trips/:id ────────────────────────────────────────────
exports.deleteAdminTrip = async (req, res) => {
  try {
    const trip = await Trip.findById(req.params.id)
    if (!trip) {
      return res.status(404).json({ success: false, error: "Trip not found" })
    }

    await trip.deleteOne()

    res.json({ success: true, message: "Trip deleted successfully" })
  } catch (error) {
    res.status(500).json({ success: false, error: error.message })
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// EVENTS — Admin API
// ─────────────────────────────────────────────────────────────────────────────

// ── GET /api/v1/admin/events ──────────────────────────────────────────────────
exports.getAdminEvents = async (req, res) => {
  try {
    const { page, limit } = validatePagination(req.query)
    const { search } = req.query

    const filter = {}
    if (search) {
      filter.$or = [
        { title:       { $regex: search, $options: "i" } },
        { location:    { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } }
      ]
    }

    const [events, total] = await Promise.all([
      Event.find(filter)
        .populate("organizer", "fullName email")
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      Event.countDocuments(filter)
    ])

    res.json({
      success: true,
      data: {
        events: events.map(e => ({
          id: e._id.toString(),
          title: e.title,
          location: e.location || "",
          description: e.description || "",
          creator_username: e.organizer?.fullName || "",
          organizer: e.organizer?.fullName || "",
          creator_email: e.organizer?.email || "",
          event_date: e.eventDate || null,
          event_type: e.eventType || null,
          category: e.category || null,
          price: e.price || 0,
          is_active: e.isActive !== false,
          participant_count: (e.participants || []).length,
          createdAt: e.createdAt
        })),
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      }
    })
  } catch (error) {
    res.status(500).json({ success: false, error: error.message })
  }
}

// ── GET /api/v1/admin/events/:id ──────────────────────────────────────────────
exports.getAdminEventById = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id)
      .populate("organizer", "fullName email")
      .lean()

    if (!event) {
      return res.status(404).json({ success: false, error: "Event not found" })
    }

    res.json({
      success: true,
      data: {
        id: event._id.toString(),
        title: event.title,
        location: event.location,
        description: event.description,
        organizer: event.organizer?.fullName || "",
        creator_email: event.organizer?.email || "",
        event_date: event.eventDate,
        event_type: event.eventType,
        category: event.category,
        price: event.price,
        is_active: event.isActive,
        tags: event.tags,
        createdAt: event.createdAt
      }
    })
  } catch (error) {
    res.status(500).json({ success: false, error: error.message })
  }
}

// ── PUT /api/v1/admin/events/:id ──────────────────────────────────────────────
exports.updateAdminEvent = async (req, res) => {
  try {
    const { title, description, location, event_date, event_type,
            category, price, is_active } = req.body

    const event = await Event.findById(req.params.id)
    if (!event) {
      return res.status(404).json({ success: false, error: "Event not found" })
    }

    if (title !== undefined) event.title = title
    if (description !== undefined) event.description = description
    if (location !== undefined) event.location = location
    if (event_date !== undefined) event.eventDate = event_date
    if (event_type !== undefined) event.eventType = event_type
    if (category !== undefined) event.category = category
    if (price !== undefined) event.price = price
    if (is_active !== undefined) event.isActive = is_active === true || is_active === 1

    await event.save()

    res.json({ success: true, message: "Event updated successfully" })
  } catch (error) {
    res.status(500).json({ success: false, error: error.message })
  }
}

// ── DELETE /api/v1/admin/events/:id ───────────────────────────────────────────
exports.deleteAdminEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id)
    if (!event) {
      return res.status(404).json({ success: false, error: "Event not found" })
    }

    await event.deleteOne()

    res.json({ success: true, message: "Event deleted successfully" })
  } catch (error) {
    res.status(500).json({ success: false, error: error.message })
  }
}
