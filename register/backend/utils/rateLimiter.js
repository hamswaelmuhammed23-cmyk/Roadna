const store = new Map()

function rateLimiter({ windowMs = 60000, max = 5, keyGenerator } = {}) {
  return (req, res, next) => {
    const key = keyGenerator ? keyGenerator(req) : req.ip
    const now = Date.now()

    if (!store.has(key)) {
      store.set(key, { count: 1, resetAt: now + windowMs })
      return next()
    }

    const record = store.get(key)

    if (now > record.resetAt) {
      store.set(key, { count: 1, resetAt: now + windowMs })
      return next()
    }

    if (record.count >= max) {
      return res.status(429).json({
        success: false,
        error: "Too many requests. Please try again later.",
        retryAfter: Math.ceil((record.resetAt - now) / 1000)
      })
    }

    record.count++
    next()
  }
}

setInterval(() => {
  const now = Date.now()
  for (const [key, record] of store) {
    if (now > record.resetAt) store.delete(key)
  }
}, 60000).unref()

module.exports = rateLimiter
