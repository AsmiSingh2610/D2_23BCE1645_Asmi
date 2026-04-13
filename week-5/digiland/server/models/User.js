// ── User Model ───────────────────────────────────────────────
// Supports both local (email/password) and Google OAuth users
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      // Not required for OAuth users
      minlength: 6,
    },
    googleId: {
      type: String,
      default: null,
    },
    role: {
      type: String,
      enum: ["user", "admin", "verifier"],
      default: "user",
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// ── Hash password before saving ───────────────────────────────
userSchema.pre("save", async function (next) {
  if (!this.isModified("password") || !this.password) return next();
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// ── Instance method: compare passwords ───────────────────────
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// ── Hide sensitive fields in JSON output ─────────────────────
userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  delete obj.__v;
  return obj;
};

module.exports = mongoose.model("User", userSchema);
