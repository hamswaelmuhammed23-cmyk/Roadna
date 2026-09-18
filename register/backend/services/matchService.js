const User = require("../model/User")

const WEIGHTS = {
  interests: 40,
  language: 10,
  country: 10,
  ageProximity: 15,
  personalityType: 10,
  travelStyle: 15
}

const MAX_SCORE = Object.values(WEIGHTS).reduce((a, b) => a + b, 0)

function calculateInterestScore(userInterests, candidateInterests) {
  if (!userInterests?.length || !candidateInterests?.length) return 0

  const userSet = new Set(userInterests.map(i => i.toLowerCase().trim()))
  const candidateSet = new Set(candidateInterests.map(i => i.toLowerCase().trim()))

  let shared = 0
  for (const interest of userSet) {
    if (candidateSet.has(interest)) shared++
  }

  const union = new Set([...userSet, ...candidateSet]).size
  if (union === 0) return 0

  return (shared / union) * WEIGHTS.interests
}

function calculateAgeScore(userAge, candidateAge) {
  if (!userAge || !candidateAge) return 0

  const diff = Math.abs(userAge - candidateAge)
  if (diff === 0) return WEIGHTS.ageProximity
  if (diff <= 2) return WEIGHTS.ageProximity * 0.9
  if (diff <= 5) return WEIGHTS.ageProximity * 0.7
  if (diff <= 10) return WEIGHTS.ageProximity * 0.4
  if (diff <= 15) return WEIGHTS.ageProximity * 0.2
  return 0
}

function calculateMatchScore(user, candidate) {
  const breakdown = {}
  let total = 0

  const interestScore = calculateInterestScore(user.interests, candidate.interests)
  breakdown.interests = Math.round(interestScore * 10) / 10
  total += interestScore

  if (user.language && candidate.language && user.language === candidate.language) {
    breakdown.language = WEIGHTS.language
    total += WEIGHTS.language
  } else {
    breakdown.language = 0
  }

  if (user.country && candidate.country &&
      user.country.toLowerCase() === candidate.country.toLowerCase()) {
    breakdown.country = WEIGHTS.country
    total += WEIGHTS.country
  } else {
    breakdown.country = 0
  }

  const ageScore = calculateAgeScore(user.age, candidate.age)
  breakdown.ageProximity = Math.round(ageScore * 10) / 10
  total += ageScore

  if (user.personalityType && candidate.personalityType &&
      user.personalityType === candidate.personalityType) {
    breakdown.personalityType = WEIGHTS.personalityType
    total += WEIGHTS.personalityType
  } else {
    breakdown.personalityType = 0
  }

  if (user.travelStyle && candidate.travelStyle &&
      user.travelStyle === candidate.travelStyle) {
    breakdown.travelStyle = WEIGHTS.travelStyle
    total += WEIGHTS.travelStyle
  } else {
    breakdown.travelStyle = 0
  }

  const percentage = Math.round((total / MAX_SCORE) * 100)

  const userLower = (user.interests || []).map(i => i.toLowerCase().trim())
  const candLower = (candidate.interests || []).map(i => i.toLowerCase().trim())
  const sharedInterests = userLower.filter(i => candLower.includes(i))

  const reasons = []
  if (sharedInterests.length > 0) {
    reasons.push(`Shared interests: ${sharedInterests.join(", ")}`)
  }
  if (breakdown.language > 0) {
    reasons.push(`Both speak ${user.language}`)
  }
  if (breakdown.country > 0) {
    reasons.push(`Both from ${user.country}`)
  }
  if (breakdown.ageProximity >= WEIGHTS.ageProximity * 0.7) {
    reasons.push("Similar age group")
  }
  if (breakdown.personalityType > 0) {
    reasons.push(`Same personality type: ${user.personalityType}`)
  }
  if (breakdown.travelStyle > 0) {
    reasons.push(`Same travel style: ${user.travelStyle}`)
  }

  return {
    score: Math.round(total * 10) / 10,
    maxScore: MAX_SCORE,
    percentage,
    breakdown,
    reasons
  }
}

// ── findMatches: weighted score-based matching ────────────────────────────────
async function findMatches(userId, options = {}) {
  const { limit = 20, minScore = 10, page = 1 } = options

  const user = await User.findById(userId)
  if (!user) throw new Error("User not found")

  const filter = {
    _id: { $ne: userId },
    suspended: { $ne: true }
  }

  if (options.country) filter.country = options.country
  if (options.language) filter.language = options.language
  if (options.minAge || options.maxAge) {
    filter.age = {}
    if (options.minAge) filter.age.$gte = parseInt(options.minAge)
    if (options.maxAge) filter.age.$lte = parseInt(options.maxAge)
  }

  const candidates = await User.find(filter).select("-password").lean()

  const scored = candidates.map(candidate => {
    const match = calculateMatchScore(user, candidate)
    return {
      user: {
        _id: candidate._id,
        fullName: candidate.fullName,
        age: candidate.age,
        country: candidate.country,
        language: candidate.language,
        bio: candidate.bio,
        photo: candidate.photo,
        interests: candidate.interests,
        personalityType: candidate.personalityType,
        travelStyle: candidate.travelStyle,
        verificationStatus: candidate.verificationStatus
      },
      match
    }
  })

  const filtered = scored
    .filter(s => s.match.percentage >= minScore)
    .sort((a, b) => b.match.percentage - a.match.percentage)

  const startIndex = (page - 1) * limit
  const paginated = filtered.slice(startIndex, startIndex + limit)

  return {
    matches: paginated,
    total: filtered.length,
    page,
    totalPages: Math.ceil(filtered.length / limit)
  }
}

// ── getMatchScore: score between two specific users ───────────────────────────
async function getMatchScore(userId, targetUserId) {
  const [user, target] = await Promise.all([
    User.findById(userId),
    User.findById(targetUserId)
  ])

  if (!user || !target) throw new Error("User not found")

  return calculateMatchScore(user, target)
}

// ── findMatchesByInterest: Jaccard similarity on interests ────────────────────
async function findMatchesByInterest(userId, options = {}) {
  const { limit = 20, page = 1 } = options

  const user = await User.findById(userId)
  if (!user) throw new Error("User not found")
  if (!user.interests || user.interests.length === 0) {
    return { matches: [], total: 0, page, totalPages: 0 }
  }

  const filter = {
    _id: { $ne: userId },
    suspended: { $ne: true },
    interests: { $in: user.interests }
  }

  const candidates = await User.find(filter)
    .select("fullName age country language bio photo interests personalityType travelStyle verificationStatus")
    .lean()

  const scored = candidates.map(candidate => {
    const userSet = new Set(user.interests.map(i => i.toLowerCase().trim()))
    const candSet = new Set(candidate.interests.map(i => i.toLowerCase().trim()))

    let shared = 0
    for (const i of userSet) {
      if (candSet.has(i)) shared++
    }

    const union = new Set([...userSet, ...candSet]).size
    const jaccardScore = union > 0 ? shared / union : 0
    const percentage = Math.round(jaccardScore * 100)
    const sharedInterests = [...userSet].filter(i => candSet.has(i))

    return {
      user: {
        _id: candidate._id,
        fullName: candidate.fullName,
        age: candidate.age,
        country: candidate.country,
        language: candidate.language,
        bio: candidate.bio,
        photo: candidate.photo,
        interests: candidate.interests,
        verificationStatus: candidate.verificationStatus
      },
      match: {
        sharedInterests,
        sharedCount: shared,
        totalUnion: union,
        similarityPercent: percentage
      }
    }
  })

  const sorted = scored.sort((a, b) => b.match.similarityPercent - a.match.similarityPercent)
  const startIndex = (page - 1) * limit
  const paginated = sorted.slice(startIndex, startIndex + limit)

  return {
    matches: paginated,
    total: sorted.length,
    page,
    totalPages: Math.ceil(sorted.length / limit)
  }
}

// ── getMatchedUsers: ≥ minShared (default 3) shared interests ─────────────────
// This is the PRIMARY matching function per project requirements.
// Two users are MATCHED if they share >= 3 interests.
// Results sorted descending by shared interest count.
async function getMatchedUsers(userId, options = {}) {
  const { minShared = 3, limit = 20, page = 1 } = options

  if (minShared < 1) throw new Error("minShared must be at least 1")

  const user = await User.findById(userId)
  if (!user) throw new Error("User not found")
  if (!user.interests || user.interests.length === 0) {
    return { matches: [], total: 0, page, totalPages: 0, minSharedUsed: minShared }
  }

  const userLower = user.interests.map(i => i.toLowerCase().trim())
  const userSet = new Set(userLower)

  // Pre-filter in DB: only users who share at least one interest
  const candidates = await User.find({
    _id: { $ne: userId },
    suspended: { $ne: true },
    interests: { $in: user.interests }
  })
    .select("fullName age country language bio photo interests personalityType travelStyle verificationStatus")
    .lean()

  const scored = []

  for (const candidate of candidates) {
    const candLower = (candidate.interests || []).map(i => i.toLowerCase().trim())
    const candSet = new Set(candLower)

    const sharedInterests = []
    for (const i of userSet) {
      if (candSet.has(i)) sharedInterests.push(i)
    }

    // Apply the ≥ 3 shared interests threshold
    if (sharedInterests.length >= minShared) {
      scored.push({
        user: {
          _id: candidate._id,
          fullName: candidate.fullName,
          age: candidate.age,
          country: candidate.country,
          language: candidate.language,
          bio: candidate.bio,
          photo: candidate.photo,
          interests: candidate.interests,
          personalityType: candidate.personalityType,
          travelStyle: candidate.travelStyle,
          verificationStatus: candidate.verificationStatus
        },
        match: {
          sharedInterests,
          sharedCount: sharedInterests.length,
          yourTotalInterests: userLower.length,
          theirTotalInterests: candLower.length
        }
      })
    }
  }

  // Sort descending by shared interest count
  scored.sort((a, b) => b.match.sharedCount - a.match.sharedCount)

  const startIndex = (page - 1) * limit
  const paginated = scored.slice(startIndex, startIndex + limit)

  return {
    matches: paginated,
    total: scored.length,
    page,
    totalPages: Math.ceil(scored.length / limit),
    minSharedUsed: minShared
  }
}

// ── getStats: match statistics for the current user ───────────────────────────
async function getStats(userId) {
  const user = await User.findById(userId)
  if (!user) throw new Error("User not found")

  const totalUsers = await User.countDocuments({
    _id: { $ne: userId },
    suspended: { $ne: true }
  })

  const usersWithSharedInterests = user.interests?.length
    ? await User.countDocuments({
        _id: { $ne: userId },
        suspended: { $ne: true },
        interests: { $in: user.interests }
      })
    : 0

  return {
    totalUsers,
    usersWithSharedInterests,
    yourInterests: user.interests || [],
    yourCountry: user.country,
    yourLanguage: user.language
  }
}

module.exports = {
  findMatches,
  findMatchesByInterest,
  getMatchedUsers,
  getMatchScore,
  getStats,
  calculateMatchScore,
  WEIGHTS
}
