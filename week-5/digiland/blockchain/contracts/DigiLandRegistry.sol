// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title DigiLandRegistry
 * @author DigiLand Team
 * @notice Immutable on-chain registry for land record hash storage.
 *         Each property's SHA-256 hash is stored here to enable
 *         tamper detection — any off-chain data change will produce
 *         a different hash that won't match what's on-chain.
 *
 * @dev Phase 1 MVP: owner-controlled hash registry with event logging.
 *      Phase 2 will add multi-sig verification and role-based access.
 */
contract DigiLandRegistry {

    // ── State Variables ───────────────────────────────────────

    address public owner;

    /// @dev Maps a propertyId string to its SHA-256 hash (stored as bytes32)
    mapping(string => bytes32) private propertyHashes;

    /// @dev Track all registered property IDs (for enumeration)
    string[] private propertyIds;

    /// @dev Prevent duplicate registrations
    mapping(string => bool) private isRegistered;

    // ── Events ────────────────────────────────────────────────

    /// @notice Emitted when a new property hash is recorded on-chain
    event PropertyRegistered(
        string indexed propertyId,
        bytes32 dataHash,
        address registeredBy,
        uint256 timestamp
    );

    /// @notice Emitted when an existing property hash is updated
    event PropertyHashUpdated(
        string indexed propertyId,
        bytes32 oldHash,
        bytes32 newHash,
        address updatedBy,
        uint256 timestamp
    );

    // ── Modifiers ─────────────────────────────────────────────

    modifier onlyOwner() {
        require(msg.sender == owner, "DigiLand: Caller is not the owner");
        _;
    }

    modifier propertyExists(string memory propertyId) {
        require(isRegistered[propertyId], "DigiLand: Property not registered");
        _;
    }

    modifier propertyNotExists(string memory propertyId) {
        require(!isRegistered[propertyId], "DigiLand: Property already registered");
        _;
    }

    // ── Constructor ───────────────────────────────────────────

    constructor() {
        owner = msg.sender;
    }

    // ── Write Functions ───────────────────────────────────────

    /**
     * @notice Register a new property's SHA-256 hash on-chain.
     * @param propertyId  Unique property identifier (e.g. "DL-KA-MYS-001")
     * @param dataHash    SHA-256 hash of the property data (as bytes32)
     *
     * @dev The hash is computed off-chain (Node.js) and submitted here.
     *      Only callable by contract owner in Phase 1.
     */
    function registerProperty(string memory propertyId, bytes32 dataHash)
        external
        onlyOwner
        propertyNotExists(propertyId)
    {
        require(bytes(propertyId).length > 0, "DigiLand: propertyId cannot be empty");
        require(dataHash != bytes32(0), "DigiLand: Hash cannot be zero");

        propertyHashes[propertyId] = dataHash;
        isRegistered[propertyId] = true;
        propertyIds.push(propertyId);

        emit PropertyRegistered(propertyId, dataHash, msg.sender, block.timestamp);
    }

    /**
     * @notice Update the hash of an existing property (e.g. after legal transfer).
     * @param propertyId  The property to update
     * @param newHash     New SHA-256 hash of updated property data
     */
    function updatePropertyHash(string memory propertyId, bytes32 newHash)
        external
        onlyOwner
        propertyExists(propertyId)
    {
        require(newHash != bytes32(0), "DigiLand: Hash cannot be zero");

        bytes32 oldHash = propertyHashes[propertyId];
        propertyHashes[propertyId] = newHash;

        emit PropertyHashUpdated(propertyId, oldHash, newHash, msg.sender, block.timestamp);
    }

    // ── Read Functions ────────────────────────────────────────

    /**
     * @notice Retrieve the stored hash for a given property ID.
     * @param propertyId  The property to look up
     * @return            The stored bytes32 SHA-256 hash
     */
    function getPropertyHash(string memory propertyId)
        external
        view
        propertyExists(propertyId)
        returns (bytes32)
    {
        return propertyHashes[propertyId];
    }

    /**
     * @notice Verify if a given hash matches what's stored on-chain.
     * @param propertyId  Property to verify
     * @param hashToCheck Hash computed from current data
     * @return            true if data is intact, false if tampered
     */
    function verifyHash(string memory propertyId, bytes32 hashToCheck)
        external
        view
        propertyExists(propertyId)
        returns (bool)
    {
        return propertyHashes[propertyId] == hashToCheck;
    }

    /**
     * @notice Check if a propertyId has been registered.
     * @param propertyId  Property ID to check
     * @return            true if registered
     */
    function isPropertyRegistered(string memory propertyId)
        external
        view
        returns (bool)
    {
        return isRegistered[propertyId];
    }

    /**
     * @notice Returns the total number of registered properties.
     */
    function getTotalProperties() external view returns (uint256) {
        return propertyIds.length;
    }

    /**
     * @notice Returns the property ID at a specific index (for iteration).
     * @param index  Index in the propertyIds array
     */
    function getPropertyIdAtIndex(uint256 index) external view returns (string memory) {
        require(index < propertyIds.length, "DigiLand: Index out of bounds");
        return propertyIds[index];
    }

    // ── Admin Functions ───────────────────────────────────────

    /**
     * @notice Transfer contract ownership to a new address.
     * @param newOwner  Address of new owner
     */
    function transferOwnership(address newOwner) external onlyOwner {
        require(newOwner != address(0), "DigiLand: Invalid address");
        owner = newOwner;
    }
}
