// ── Property Model ───────────────────────────────────────────
// Stores land record with SHA-256 hash for tamper detection
const mongoose = require("mongoose");

const propertySchema = new mongoose.Schema(
  {
    propertyId: {
      type: String,
      required: [true, "Property ID is required"],
      unique: true,
      trim: true,
      uppercase: true,
    },
    ownerName: {
      type: String,
      required: [true, "Owner name is required"],
      trim: true,
    },
    ownerAadhaar: {
      type: String, // Partial/masked for privacy
      trim: true,
    },
    location: {
      state: { type: String, required: true },
      district: { type: String, required: true },
      village: { type: String },
      surveyNumber: { type: String },
      address: { type: String },
    },
    areaInAcres: {
      type: Number,
      required: true,
      min: 0,
    },
    landType: {
      type: String,
      enum: ["Agricultural", "Residential", "Commercial", "Industrial", "Forest", "Other"],
      default: "Other",
    },
    marketValue: {
      type: Number, // In INR
      default: 0,
    },
    encumbrances: [
      {
        type: { type: String }, // Mortgage, Lien, etc.
        description: String,
        amount: Number,
        date: Date,
      },
    ],
    // ── Blockchain / Integrity fields ─────────────────────────
    dataHash: {
      type: String,
      required: true,
      // SHA-256 hash of property data snapshot
    },
    blockchainTxHash: {
      type: String,
      default: null, // Ethereum tx hash after on-chain storage
    },
    blockchainStatus: {
      type: String,
      enum: ["pending", "confirmed", "failed"],
      default: "pending",
    },
    lastVerified: {
      type: Date,
      default: null,
    },
    isTampered: {
      type: Boolean,
      default: false, // Set to true if hash mismatch detected
    },
    // ── Metadata ─────────────────────────────────────────────
    addedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    source: {
      type: String,
      enum: ["DORIS", "DLRC", "CERSAI", "MCA21", "Manual", "Other"],
      default: "Manual",
    },
    status: {
      type: String,
      enum: ["Active", "Disputed", "Transferred", "Archived"],
      default: "Active",
    },
  },
  { timestamps: true }
);

// ── Index for fast lookups ───────────────────────────────────
propertySchema.index({ propertyId: 1 });
propertySchema.index({ "location.state": 1, "location.district": 1 });
propertySchema.index({ ownerName: "text" });

module.exports = mongoose.model("Property", propertySchema);
