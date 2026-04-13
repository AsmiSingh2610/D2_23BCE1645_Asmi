// ── Auth Routes ───────────────────────────────────────────────
const express = require("express");
const router = express.Router();
const { signup, login, getMe } = require("../controllers/authController");
const { protect } = require("../middleware/authMiddleware");

// Public routes
router.post("/signup", signup);
router.post("/login", login);

// Protected: get current user
router.get("/me", protect, getMe);

// ── Google OAuth Placeholder (Phase 2) ───────────────────────
// router.get("/google", passport.authenticate("google", { scope: ["profile", "email"] }));
// router.get("/google/callback", passport.authenticate("google"), googleCallback);

module.exports = router;
