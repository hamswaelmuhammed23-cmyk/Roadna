const mongoose = require("mongoose")
const bcrypt = require("bcryptjs")

const userSchema = new mongoose.Schema({

  // ===== AUTH DATA =====
  fullName: {
    type: String,
    required: true,
    trim: true
  },

  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },

  password: {
    type: String,
    required: true,
    minlength: 6,
    select: false
  },

  role: {
    type: String,
    enum: ["user", "admin"],
    default: "user"
  },

  // ===== PROFILE DATA =====

  phone: {
    type: String
  },

  dob: {
    type: Date
  },

  age: {
    type: Number,
    min: 10,
    max: 100
  },

  language: {
    type: String,
    enum: ["Arabic", "English", "French", "German", "Spanish", "Other"]
  },

  country: {
    type: String
  },

  governorate: {
    type: String,
    default: null
  },

  bio: {
    type: String,
    default: ""
  },

  photo: {
    type: String,
    default: null
  },

  interests: {
    type: [String],
    default: []
  },

  personalityType: {
    type: String,
    enum: ["adventurer", "planner", "spontaneous", "cultural", "relaxed", "social"],
    default: null
  },

  travelStyle: {
    type: String,
    enum: ["budget", "mid-range", "luxury", "backpacker", "business"],
    default: null
  },

  // ===== VERIFICATION DATA =====

  nationalId: {
    type: String,
    sparse: true,
    unique: true,
    validate: {
      validator: v => !v || /^\d{14}$/.test(v),
      message: "National ID must be exactly 14 digits"
    }
  },

  idFront: {
    type: String,
    default: null
  },

  idBack: {
    type: String,
    default: null
  },

  address: {
    type: String,
    default: ""
  },

  additionalData: {
    type: String,
    default: ""
  },

  verificationStatus: {
    type: String,
    enum: ["pending", "approved", "rejected"],
    default: "pending"
  },

  // ===== SYSTEM FLAGS =====

  profileCompleted: {
    type: Boolean,
    default: false
  },

  verified: {
    type: Boolean,
    default: false
  },

  emailVerified: {
    type: Boolean,
    default: false
  },

  phoneVerified: {
    type: Boolean,
    default: false
  },

  suspended: {
    type: Boolean,
    default: false
  },  

// ===== ACTIVITY DATA =====
joinedTrips:  { type: [String], default: [] },
joinedEvents: { type: [String], default: [] },
savedTrips:   { type: [String], default: [] },
  
}, {
  timestamps: true
})

userSchema.index({ interests: 1 })
userSchema.index({ country: 1 })
userSchema.index({ language: 1 })
userSchema.index({ age: 1 })

userSchema.pre("save", async function () {
  if (!this.isModified("password")) return
  const salt = await bcrypt.genSalt(10)
  this.password = await bcrypt.hash(this.password, salt)
})

userSchema.methods.comparePassword = async function (password) {
  return await bcrypt.compare(password, this.password)
}

module.exports = mongoose.model("User", userSchema)
