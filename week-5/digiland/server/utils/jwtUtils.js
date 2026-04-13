// ── JWT Utility ───────────────────────────────────────────────
const jwt = require("jsonwebtoken");

/**
 * Signs and returns a JWT token for the given user payload.
 * @param {Object} payload - { id, email, role }
 * @returns {string} signed JWT
 */
const generateToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });
};

/**
 * Verifies a JWT token and returns its decoded payload.
 * Throws if invalid or expired.
 * @param {string} token
 * @returns {Object} decoded payload
 */
const verifyToken = (token) => {
  return jwt.verify(token, process.env.JWT_SECRET);
};

module.exports = { generateToken, verifyToken };
