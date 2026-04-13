// ── Property Routes ───────────────────────────────────────────
const express = require("express");
const router = express.Router();
const {
  addProperty,
  getProperties,
  getPropertyById,
  verifyProperty,
  getStats,
} = require("../controllers/propertyController");
const { protect, restrictTo } = require("../middleware/authMiddleware");

// All routes below require authentication
router.use(protect);

// Summary stats for dashboard
router.get("/stats/summary", getStats);

// Core CRUD
router.get("/", getProperties);
router.post("/", addProperty);
router.get("/:id", getPropertyById);

// Integrity verification (recomputes SHA-256 and compares)
router.post("/:id/verify", verifyProperty);

module.exports = router;
