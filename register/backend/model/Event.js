  const mongoose = require("mongoose")

  const eventSchema = new mongoose.Schema({
    title: {
      type: String,
      required: true,
      trim: true
    },
    description: {
      type: String,
      default: ""
    },
    location: {
      type: String,
      default: ""
    },
    eventDate: {
      type: Date,
      default: null
    },
    eventType: {
      type: String,
      default: null
    },
    category: {
      type: String,
      default: null
    },
    price: {
      type: Number,
      default: 0
    },
    isActive: {
      type: Boolean,
      default: true
    },
    organizer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    participants: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    }],
    tags: {
      type: [String],
      default: []
    }
  }, {
    timestamps: true
  })

  eventSchema.index({ organizer: 1 })
  eventSchema.index({ isActive: 1 })
  eventSchema.index({ createdAt: -1 })

  module.exports = mongoose.model("Event", eventSchema)
