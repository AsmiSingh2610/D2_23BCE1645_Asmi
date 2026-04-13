// ── Auth Controller ──────────────────────────────────────────
// Handles user registration and login logic
const User = require("../models/User");
const { generateToken } = require("../utils/jwtUtils");

// ── POST /api/auth/signup ────────────────────────────────────
const signup = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Validate required fields
    if (!name || !email || !password) {
      return res.status(400).json({ error: "Name, email, and password are required." });
    }

    // Check for duplicate email
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ error: "Email already registered. Please login." });
    }

    // Create user (password hashed via pre-save hook in model)
    const user = await User.create({ name, email, password });

    const token = generateToken({ id: user._id, email: user.email, role: user.role });

    res.status(201).json({
      message: "Account created successfully.",
      token,
      user: user.toJSON(),
    });
  } catch (err) {
    console.error("[SIGNUP ERROR]", err.message);
    res.status(500).json({ error: "Signup failed. Please try again." });
  }
};

// ── POST /api/auth/login ─────────────────────────────────────
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required." });
    }

    // Fetch user with password for comparison
    const user = await User.findOne({ email }).select("+password");
    if (!user || !user.password) {
      return res.status(401).json({ error: "Invalid email or password." });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ error: "Invalid email or password." });
    }

    const token = generateToken({ id: user._id, email: user.email, role: user.role });

    res.json({
      message: "Login successful.",
      token,
      user: user.toJSON(),
    });
  } catch (err) {
    console.error("[LOGIN ERROR]", err.message);
    res.status(500).json({ error: "Login failed. Please try again." });
  }
};

// ── GET /api/auth/me ─────────────────────────────────────────
const getMe = async (req, res) => {
  res.json({ user: req.user });
};

module.exports = { signup, login, getMe };
