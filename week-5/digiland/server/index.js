// ============================================================
// DigiLand - Server Entry Point
// ============================================================
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");

const authRoutes = require("./routes/authRoutes");
const propertyRoutes = require("./routes/propertyRoutes");

const app = express();
const PORT = process.env.PORT || 5000;

// ── Middleware ───────────────────────────────────────────────
app.use(cors({ origin: process.env.CLIENT_URL || "http://localhost:3000" }));
app.use(express.json());

// ── Database Connection ──────────────────────────────────────
connectDB();

// ── Routes ───────────────────────────────────────────────────
app.use("/api/auth", authRoutes);
app.use("/api/properties", propertyRoutes);

// ── Health Check ─────────────────────────────────────────────
app.get("/api/health", (req, res) => {
  res.json({ status: "DigiLand API is running", timestamp: new Date() });
});

// ── Global Error Handler ─────────────────────────────────────
app.use((err, req, res, next) => {
  console.error("[ERROR]", err.message);
  res.status(err.status || 500).json({ error: err.message || "Internal Server Error" });
});

app.listen(PORT, () => console.log(`🚀 DigiLand Server running on port ${PORT}`));
