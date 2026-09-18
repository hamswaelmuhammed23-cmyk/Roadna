require("dotenv").config();
const express = require("express")
const http = require("http")
const { Server } = require("socket.io")
const cors = require("cors")
const dotenv = require("dotenv")
const path = require("path")

dotenv.config()

// ── Validate required environment variables before starting ──────────────────
const REQUIRED_ENV = ["JWT_SECRET", "MONGO_URI"]
const missingEnv = REQUIRED_ENV.filter(k => !process.env[k])
if (missingEnv.length > 0) {
  console.error(`[STARTUP] Missing required environment variables: ${missingEnv.join(", ")}`)
  process.exit(1)
}

if (process.env.JWT_SECRET === "supersecret" && process.env.NODE_ENV === "production") {
  console.warn("[STARTUP] WARNING: JWT_SECRET is using the default insecure value. Set a strong random secret in .env")
}

const connectDB = require("./config/db")
const { initSocket } = require("./socketHandler")

const app = express()
const server = http.createServer(app)

const io = new Server(server, {
  cors: {
    origin: process.env.CORS_ORIGIN || "*",
    methods: ["GET", "POST"]
  }
})

app.set("io", io)

// ── View engine (Removed EJS) ──────────────────

app.use(cors({ origin: process.env.CORS_ORIGIN || "*" }))
app.use(express.json({ limit: "10mb" }))
app.use(express.urlencoded({ extended: true }))

// ── Admin page routes (SSR removed, handled by React) ─────────

// ── REST API routes ───────────────────────────────────────────────────────────
app.use("/api/v1/auth",    require("./routes/authRoutes"))
app.use("/api/v1/profile", require("./routes/profileRoutes"))
app.use("/api/v1/admin",   require("./routes/adminRoutes"))
app.use("/api/v1/matches", require("./routes/matchRoutes"))
app.use("/api/v1/chat",    require("./routes/chatRoutes"))
app.use("/api/v1/ai",      require("./routes/aiRoutes"))
app.use('/uploads', express.static(path.join(__dirname, 'uploads')))

// ── Health check ──────────────────────────────────────────────────────────────
app.get("/api/v1/health", (req, res) => {
  res.json({ success: true, message: "Roadna API is running", timestamp: new Date() })
})

// ── Static files (React App) ──────────────────────────────────────────────────
const roadnaAppDistPath = path.join(__dirname, "..", "..", "roadna-web", "dist")

const fs = require("fs")
console.log("[STATIC] Serving from:", roadnaAppDistPath)
console.log("[STATIC] Path exists:", fs.existsSync(roadnaAppDistPath))
console.log("[STATIC] index.html exists:", fs.existsSync(path.join(roadnaAppDistPath, "index.html")))
// ─────

app.use(express.static(roadnaAppDistPath))

// ── SPA Catch-all (React App) ─────────────────────────────────────────────────
// app.get(/^(.*)$/, (req, res, next) => {
//   if (req.path.startsWith('/api/')) return next()
  
//   // Do not serve index.html for missing static assets (prevents SyntaxError blank screens)
//   if (req.path.match(/\.(js|css|png|jpg|jpeg|svg|ico|json)$/)) {
//     return res.status(404).send('Not found')
//   }
  
//   res.sendFile(path.join(roadnaAppDistPath, "index.html"))
// })

// ── 404 handler ───────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ success: false, error: `Route ${req.method} ${req.path} not found` })
})

// ── Global error handler ──────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  const statusCode = err.statusCode || err.status || 500
  res.status(statusCode).json({
    success: false,
    error: err.isOperational ? err.message : "Internal server error"
  })
})

process.on("unhandledRejection", (reason) => {
  console.error("[UNHANDLED REJECTION]", reason)
})

process.on("uncaughtException", (err) => {
  console.error("[UNCAUGHT EXCEPTION]", err)
  process.exit(1)
})

// ── Port binding with auto-increment ─────────────────────────────────────────
const PORT = process.env.PORT || 5002;

const startServer = async () => {
  await connectDB()

  initSocket(io)

  const bind = () => {
   
    server.removeAllListeners("error")

    server.once("error", (err) => {
      if (err.code === "EADDRINUSE" && PORT_AUTO && tries < MAX_PORT_TRIES) {
        console.warn(`[Port ${listenPort}] in use — trying ${listenPort + 1}`)
        listenPort += 1
        setImmediate(bind)
        return
      }
      if (err.code === "EADDRINUSE") {
        console.error(`[Port ${listenPort}] is already in use. Free the port or set PORT=5001 in .env`)
        process.exit(1)
      }
      throw err
    })
const PORT = process.env.PORT || 5002;
  

server.listen(PORT, () => {
  console.log(`Roadna backend running on http://localhost:${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/api/v1/health`);
  console.log(`Socket.IO ready on ws://localhost:${PORT}`);
  console.log(`Admin panel: http://localhost:${PORT}/admin?token=<JWT>`);
});
  }

bind()
}

startServer()
