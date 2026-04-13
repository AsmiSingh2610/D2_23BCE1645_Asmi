// ── Auth Middleware ───────────────────────────────────────────
// Validates JWT from Authorization header before protected routes
const { verifyToken } = require("../utils/jwtUtils");
const User = require("../models/User");

const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    // Check header format: "Bearer <token>"
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Access denied. No token provided." });
    }

    const token = authHeader.split(" ")[1];
    const decoded = verifyToken(token);

    // Attach user to request (exclude password)
    const user = await User.findById(decoded.id).select("-password");
    if (!user) {
      return res.status(401).json({ error: "User no longer exists." });
    }

    req.user = user;
    next();
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      return res.status(401).json({ error: "Token expired. Please login again." });
    }
    return res.status(401).json({ error: "Invalid token." });
  }
};

// ── Role-based access (for future verifier/admin routes) ─────
const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: "You do not have permission for this action." });
    }
    next();
  };
};

module.exports = { protect, restrictTo };
