const mongoose = require("mongoose")

const tripSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    default: ""
  },
  destination: {
    type: String,
    default: ""
  },
  startDate: {
    type: Date,
    default: null
  },
  endDate: {
    type: Date,
    default: null
  },
  status: {
    type: String,
    enum: ["open", "full", "cancelled", "completed"],
    default: "open"
  },
  host: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  participants: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  }],
  maxParticipants: {
    type: Number,
    default: null
  },
  budgetMin: {
    type: Number,
    default: null
  },
  budgetMax: {
    type: Number,
    default: null
  },
  activityType: {
    type: String,
    default: null
  },
  tags: {
    type: [String],
    default: []
  },
  requirements: {
    type: [String],
    default: []
  }
}, {
  timestamps: true
})

tripSchema.index({ host: 1 })
tripSchema.index({ status: 1 })
tripSchema.index({ createdAt: -1 })

module.exports = mongoose.model("Trip", tripSchema)
