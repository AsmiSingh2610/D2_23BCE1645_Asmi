// ── Hash Utility ─────────────────────────────────────────────
// Generates SHA-256 hash for property data integrity verification
const crypto = require("crypto");

/**
 * Generates a SHA-256 hash from a property data object.
 * Fields are sorted to ensure deterministic hashing regardless
 * of insertion order.
 *
 * @param {Object} propertyData - The property fields to hash
 * @returns {string} - Hex-encoded SHA-256 hash
 */
const generatePropertyHash = (propertyData) => {
  // Extract only the core data fields (not metadata like _id, timestamps)
  const coreData = {
    propertyId: propertyData.propertyId,
    ownerName: propertyData.ownerName,
    location: propertyData.location,
    areaInAcres: propertyData.areaInAcres,
    landType: propertyData.landType,
    marketValue: propertyData.marketValue,
    encumbrances: propertyData.encumbrances || [],
    source: propertyData.source,
  };

  // Sort keys for deterministic serialization
  const sortedJson = JSON.stringify(coreData, Object.keys(coreData).sort());

  return crypto.createHash("sha256").update(sortedJson).digest("hex");
};

/**
 * Verifies whether the stored hash still matches a recomputed hash.
 * Returns true if data is INTACT, false if TAMPERED.
 *
 * @param {Object} propertyData - Current property data from DB
 * @param {string} storedHash   - Hash stored at time of creation
 * @returns {boolean}
 */
const verifyPropertyHash = (propertyData, storedHash) => {
  const recomputedHash = generatePropertyHash(propertyData);
  return recomputedHash === storedHash;
};

module.exports = { generatePropertyHash, verifyPropertyHash };
