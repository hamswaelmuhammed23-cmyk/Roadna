const { findMatches, findMatchesByInterest, getMatchedUsers, getMatchScore, getStats } = require("../services/matchService")
const { validatePagination } = require("../utils/validators")

exports.getMatches = async (req, res) => {
  try {
    const { page, limit } = validatePagination(req.query)
    const { minScore, country, language, minAge, maxAge } = req.query

    const result = await findMatches(req.user.id, {
      page,
      limit,
      minScore: parseInt(minScore) || 10,
      country,
      language,
      minAge,
      maxAge
    })

    res.json({ success: true, data: result })
  } catch (error) {
    res.status(500).json({ success: false, error: error.message })
  }
}

exports.getInterestMatches = async (req, res) => {
  try {
    const { page, limit } = validatePagination(req.query)

    const result = await findMatchesByInterest(req.user.id, { page, limit })

    res.json({ success: true, data: result })
  } catch (error) {
    res.status(500).json({ success: false, error: error.message })
  }
}

exports.getMatchedBySharedInterests = async (req, res) => {
  try {
    const { page, limit } = validatePagination(req.query)
    const minShared = parseInt(req.query.minShared) || 3

    const result = await getMatchedUsers(req.user.id, { page, limit, minShared })

    res.json({ success: true, data: result })
  } catch (error) {
    res.status(500).json({ success: false, error: error.message })
  }
}

exports.getMatchScoreWithUser = async (req, res) => {
  try {
    const match = await getMatchScore(req.user.id, req.params.userId)
    res.json({ success: true, data: { match } })
  } catch (error) {
    res.status(500).json({ success: false, error: error.message })
  }
}

exports.getMatchStats = async (req, res) => {
  try {
    const stats = await getStats(req.user.id)
    res.json({ success: true, data: stats })
  } catch (error) {
    res.status(500).json({ success: false, error: error.message })
  }
}
