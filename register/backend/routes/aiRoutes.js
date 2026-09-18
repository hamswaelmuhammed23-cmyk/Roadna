/**
* aiRoutes.js
*
* Proxy routes that forward AI requests from the React frontend
* to the Python Flask AI service running on port 5001.
*
* Routes:
*   GET  /api/v1/ai/health      → AI service health check
*   GET  /api/v1/ai/categories  → list categories & tags from dataset
*   POST /api/v1/ai/recommend   → get AI-powered recommendations
*/

const express = require("express")
const router = express.Router()

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || "http://localhost:5001"

/**
 * Helper: proxy a request to the AI service.
 * Handles connection errors gracefully so the backend doesn't crash
 * if the Python service is down.
 */
async function proxyToAI(path, options = {}) {
  try {
    const url = `${AI_SERVICE_URL}${path}`
    const res = await fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(options.headers || {}),
      },
    })
    const data = await res.json()
    return { status: res.status, data }
  } catch (err) {
    return {
      status: 503,
      data: {
        success: false,
        error: "AI service is unavailable. Make sure the Python AI service is running on port 5001.",
        details: err.message,
      },
    }
  }
}

// ── GET /api/v1/ai/health ────────────────────────────────────────
router.get("/health", async (req, res) => {
  const result = await proxyToAI("/health")
  res.status(result.status).json(result.data)
})

// ── GET /api/v1/ai/categories ────────────────────────────────────
router.get("/categories", async (req, res) => {
  const result = await proxyToAI("/categories")
  res.status(result.status).json(result.data)
})

// ── GET /api/v1/ai/items ────────────────────────────────────────
router.get("/items", async (req, res) => {
  const result = await proxyToAI("/items")
  res.status(result.status).json(result.data)
})
router.post("/items-by-ids", async (req, res) => {
  const { ids = [] } = req.body
  if (!ids.length) return res.json({ success: true, items: [] })

  const result = await proxyToAI("/items-by-ids", {
    method: "POST",
    body: JSON.stringify({ ids }),
  })

  res.status(result.status).json(result.data)
})
// ── POST /api/v1/ai/recommend ────────────────────────────────────
router.post("/recommend", async (req, res) => {
  const { category = "", tags = [], top_n = 50 } = req.body

  // if (!category && tags.length === 0) {
  //   return res.status(400).json({
  //     success: false,
  //     error: "Provide category or at least one tag",
  //   })
  //}

  const result = await proxyToAI("/recommend", {
    method: "POST",
    body: JSON.stringify({
      category,
      tags,
      top_n,
    }),
  })

  res.status(result.status).json(result.data)
})
module.exports = router
