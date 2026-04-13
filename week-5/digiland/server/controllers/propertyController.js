// ── Property Controller ──────────────────────────────────────
// Handles land record CRUD with SHA-256 hash generation
const Property = require("../models/Property");
const { generatePropertyHash, verifyPropertyHash } = require("../utils/hashUtils");

// ── POST /api/properties ─────────────────────────────────────
// Add a new property record + generate its SHA-256 hash
const addProperty = async (req, res) => {
  try {
    const {
      propertyId, ownerName, ownerAadhaar,
      location, areaInAcres, landType,
      marketValue, encumbrances, source,
    } = req.body;

    // Validate required fields
    if (!propertyId || !ownerName || !location || !areaInAcres) {
      return res.status(400).json({ error: "propertyId, ownerName, location, and areaInAcres are required." });
    }

    // Check for duplicate propertyId
    const existing = await Property.findOne({ propertyId: propertyId.toUpperCase() });
    if (existing) {
      return res.status(409).json({ error: `Property ID ${propertyId} already exists.` });
    }

    // ── Generate SHA-256 Hash ─────────────────────────────────
    const rawData = { propertyId, ownerName, location, areaInAcres, landType, marketValue, encumbrances, source };
    const dataHash = generatePropertyHash(rawData);

    // Create and save property
    const property = await Property.create({
      propertyId,
      ownerName,
      ownerAadhaar,
      location,
      areaInAcres,
      landType,
      marketValue,
      encumbrances,
      source,
      dataHash,
      addedBy: req.user._id,
      // blockchainTxHash is set after on-chain confirmation (Phase 2)
    });

    res.status(201).json({
      message: "Property added successfully.",
      property,
      hashInfo: {
        algorithm: "SHA-256",
        hash: dataHash,
        note: "Hash stored in DB. Blockchain sync: pending.",
      },
    });
  } catch (err) {
    console.error("[ADD PROPERTY ERROR]", err.message);
    res.status(500).json({ error: "Failed to add property." });
  }
};

// ── GET /api/properties ──────────────────────────────────────
// Fetch all properties (with optional filters)
const getProperties = async (req, res) => {
  try {
    const { state, district, ownerName, status, page = 1, limit = 10 } = req.query;

    const filter = {};
    if (state) filter["location.state"] = new RegExp(state, "i");
    if (district) filter["location.district"] = new RegExp(district, "i");
    if (ownerName) filter.ownerName = new RegExp(ownerName, "i");
    if (status) filter.status = status;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await Property.countDocuments(filter);
    const properties = await Property.find(filter)
      .populate("addedBy", "name email")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    res.json({
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
      properties,
    });
  } catch (err) {
    console.error("[GET PROPERTIES ERROR]", err.message);
    res.status(500).json({ error: "Failed to fetch properties." });
  }
};

// ── GET /api/properties/:id ──────────────────────────────────
// Fetch a single property by its propertyId
const getPropertyById = async (req, res) => {
  try {
    const property = await Property.findOne({ propertyId: req.params.id.toUpperCase() })
      .populate("addedBy", "name email");

    if (!property) {
      return res.status(404).json({ error: "Property not found." });
    }

    res.json({ property });
  } catch (err) {
    console.error("[GET PROPERTY ERROR]", err.message);
    res.status(500).json({ error: "Failed to fetch property." });
  }
};

// ── POST /api/properties/:id/verify ──────────────────────────
// Recompute hash and check for tampering
const verifyProperty = async (req, res) => {
  try {
    const property = await Property.findOne({ propertyId: req.params.id.toUpperCase() });

    if (!property) {
      return res.status(404).json({ error: "Property not found." });
    }

    const isIntact = verifyPropertyHash(property, property.dataHash);

    // Update tamper flag and lastVerified timestamp
    property.isTampered = !isIntact;
    property.lastVerified = new Date();
    await property.save();

    res.json({
      propertyId: property.propertyId,
      storedHash: property.dataHash,
      isIntact,
      isTampered: !isIntact,
      verifiedAt: property.lastVerified,
      message: isIntact
        ? "✅ Data integrity verified. No tampering detected."
        : "⚠️ TAMPER DETECTED! Hash mismatch found.",
    });
  } catch (err) {
    console.error("[VERIFY PROPERTY ERROR]", err.message);
    res.status(500).json({ error: "Verification failed." });
  }
};

// ── GET /api/properties/stats/summary ───────────────────────
// Dashboard summary statistics
const getStats = async (req, res) => {
  try {
    const [total, tampered, pending, confirmed] = await Promise.all([
      Property.countDocuments(),
      Property.countDocuments({ isTampered: true }),
      Property.countDocuments({ blockchainStatus: "pending" }),
      Property.countDocuments({ blockchainStatus: "confirmed" }),
    ]);

    const byState = await Property.aggregate([
      { $group: { _id: "$location.state", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 },
    ]);

    res.json({ total, tampered, pending, confirmed, topStates: byState });
  } catch (err) {
    console.error("[STATS ERROR]", err.message);
    res.status(500).json({ error: "Failed to fetch stats." });
  }
};

module.exports = { addProperty, getProperties, getPropertyById, verifyProperty, getStats };
