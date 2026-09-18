const User = require("../model/User")

// ─────────────────────────────────────────────
// GET OWN PROFILE (AUTH)
// ─────────────────────────────────────────────
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select(
      "+joinedTrips +joinedEvents +savedTrips"
    )

    if (!user) {
      return res.status(404).json({ success: false, error: "User not found" })
    }

    res.json({ success: true, data: { user } })
  } catch (error) {
    res.status(500).json({ success: false, error: error.message })
  }
}


// ─────────────────────────────────────────────
// GET PUBLIC PROFILE (BY ID, NO AUTH)
// ─────────────────────────────────────────────
exports.getPublicProfile = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select(
      "fullName photo bio country age interests joinedTrips joinedEvents savedTrips"
    )

    if (!user) {
      return res.status(404).json({ success: false, error: "User not found" })
    }

    res.json({ success: true, data: { user } })
  } catch (error) {
    res.status(500).json({ success: false, error: error.message })
  }
}


// ─────────────────────────────────────────────
// GET PUBLIC ACTIVITY (BY ID, NO AUTH)
// ─────────────────────────────────────────────
exports.getPublicActivity = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select(
      "joinedTrips joinedEvents savedTrips"
    )

    if (!user) {
      return res.status(404).json({ success: false, error: "User not found" })
    }

    res.json({
      success: true,
      data: {
        joinedTripIds:  user.joinedTrips  || [],
        joinedEventIds: user.joinedEvents || [],
        savedTripIds:   user.savedTrips   || [],
      }
    })
  } catch (error) {
    res.status(500).json({ success: false, error: error.message })
  }
}


// ─────────────────────────────────────────────
// GET MY ACTIVITY (AUTH)
// ─────────────────────────────────────────────
exports.getMyActivity = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select(
      "joinedTrips joinedEvents savedTrips"
    )

    if (!user) {
      return res.status(404).json({ success: false, error: "User not found" })
    }

    res.json({
      success: true,
      data: {
        joinedTripIds:  user.joinedTrips  || [],
        joinedEventIds: user.joinedEvents || [],
        savedTripIds:   user.savedTrips   || [],
      }
    })
  } catch (error) {
    res.status(500).json({ success: false, error: error.message })
  }
}


// ─────────────────────────────────────────────
// UPDATE PROFILE
// ─────────────────────────────────────────────
exports.updateProfile = async (req, res) => {
  try {
    const allowedFields = [
      "fullName", "phone", "dob", "age", "language",
      "country", "bio", "photo", "interests",
      "personalityType", "travelStyle", "governorate"
    ]

    const updates = {}
    for (const field of allowedFields) {
      if (req.body[field] !== undefined) updates[field] = req.body[field]
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ success: false, error: "No valid fields to update" })
    }

    const user = await User.findById(req.user.id)
    if (!user) {
      return res.status(404).json({ success: false, error: "User not found" })
    }

    const merged = { ...user.toObject(), ...updates }
    updates.profileCompleted = !!(merged.phone && merged.dob && merged.interests?.length)

    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      { $set: updates },
      { new: true, runValidators: true }
    )

    res.json({ success: true, data: { user: updatedUser } })
  } catch (error) {
    res.status(400).json({ success: false, error: error.message })
  }
}


// ─────────────────────────────────────────────
// JOIN / LEAVE TRIP
// ─────────────────────────────────────────────
exports.joinTrip = async (req, res) => {
  try {
    const { tripId } = req.body
    if (!tripId) return res.status(400).json({ success: false, error: "tripId required" })

    await User.findByIdAndUpdate(req.user.id, {
      $addToSet: { joinedTrips: String(tripId) }
    })

    res.json({ success: true })
  } catch (error) {
    res.status(500).json({ success: false, error: error.message })
  }
}

exports.leaveTrip = async (req, res) => {
  try {
    const { tripId } = req.body

    await User.findByIdAndUpdate(req.user.id, {
      $pull: { joinedTrips: String(tripId) }
    })

    res.json({ success: true })
  } catch (error) {
    res.status(500).json({ success: false, error: error.message })
  }
}


// ─────────────────────────────────────────────
// JOIN / LEAVE EVENT
// ─────────────────────────────────────────────
exports.joinEvent = async (req, res) => {
  try {
    const { eventId } = req.body
    if (!eventId) return res.status(400).json({ success: false, error: "eventId required" })

    await User.findByIdAndUpdate(req.user.id, {
      $addToSet: { joinedEvents: String(eventId) }
    })

    res.json({ success: true })
  } catch (error) {
    res.status(500).json({ success: false, error: error.message })
  }
}

exports.leaveEvent = async (req, res) => {
  try {
    const { eventId } = req.body

    await User.findByIdAndUpdate(req.user.id, {
      $pull: { joinedEvents: String(eventId) }
    })

    res.json({ success: true })
  } catch (error) {
    res.status(500).json({ success: false, error: error.message })
  }
}


// ─────────────────────────────────────────────
// SAVE / UNSAVE TRIP
// ─────────────────────────────────────────────
exports.saveTrip = async (req, res) => {
  try {
    const { tripId } = req.body
    if (!tripId) return res.status(400).json({ success: false, error: "tripId required" })

    await User.findByIdAndUpdate(req.user.id, {
      $addToSet: { savedTrips: String(tripId) }
    })

    res.json({ success: true })
  } catch (error) {
    res.status(500).json({ success: false, error: error.message })
  }
}

exports.unsaveTrip = async (req, res) => {
  try {
    const { tripId } = req.body

    await User.findByIdAndUpdate(req.user.id, {
      $pull: { savedTrips: String(tripId) }
    })

    res.json({ success: true })
  } catch (error) {
    res.status(500).json({ success: false, error: error.message })
  }
}