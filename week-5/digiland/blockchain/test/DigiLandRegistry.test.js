// ── DigiLandRegistry Tests ────────────────────────────────────
const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("DigiLandRegistry", function () {
  let registry, owner, addr1;

  // Sample property data
  const PROPERTY_ID = "DL-KA-MYS-001";
  const SAMPLE_HASH = ethers.keccak256(ethers.toUtf8Bytes("sample_property_data"));

  beforeEach(async function () {
    [owner, addr1] = await ethers.getSigners();
    const DigiLandRegistry = await ethers.getContractFactory("DigiLandRegistry");
    registry = await DigiLandRegistry.deploy();
  });

  describe("Deployment", function () {
    it("Should set the deployer as owner", async function () {
      expect(await registry.owner()).to.equal(owner.address);
    });

    it("Should start with 0 registered properties", async function () {
      expect(await registry.getTotalProperties()).to.equal(0);
    });
  });

  describe("registerProperty", function () {
    it("Should register a property and emit event", async function () {
      await expect(registry.registerProperty(PROPERTY_ID, SAMPLE_HASH))
        .to.emit(registry, "PropertyRegistered")
        .withArgs(PROPERTY_ID, SAMPLE_HASH, owner.address, anyValue);
    });

    it("Should mark property as registered", async function () {
      await registry.registerProperty(PROPERTY_ID, SAMPLE_HASH);
      expect(await registry.isPropertyRegistered(PROPERTY_ID)).to.be.true;
    });

    it("Should fail if same propertyId registered twice", async function () {
      await registry.registerProperty(PROPERTY_ID, SAMPLE_HASH);
      await expect(registry.registerProperty(PROPERTY_ID, SAMPLE_HASH))
        .to.be.revertedWith("DigiLand: Property already registered");
    });

    it("Should fail if called by non-owner", async function () {
      await expect(registry.connect(addr1).registerProperty(PROPERTY_ID, SAMPLE_HASH))
        .to.be.revertedWith("DigiLand: Caller is not the owner");
    });
  });

  describe("getPropertyHash & verifyHash", function () {
    beforeEach(async function () {
      await registry.registerProperty(PROPERTY_ID, SAMPLE_HASH);
    });

    it("Should return stored hash correctly", async function () {
      expect(await registry.getPropertyHash(PROPERTY_ID)).to.equal(SAMPLE_HASH);
    });

    it("Should return true for correct hash", async function () {
      expect(await registry.verifyHash(PROPERTY_ID, SAMPLE_HASH)).to.be.true;
    });

    it("Should return false for tampered hash", async function () {
      const tamperedHash = ethers.keccak256(ethers.toUtf8Bytes("tampered_data"));
      expect(await registry.verifyHash(PROPERTY_ID, tamperedHash)).to.be.false;
    });
  });

  describe("updatePropertyHash", function () {
    const NEW_HASH = ethers.keccak256(ethers.toUtf8Bytes("updated_property_data"));

    beforeEach(async function () {
      await registry.registerProperty(PROPERTY_ID, SAMPLE_HASH);
    });

    it("Should update hash and emit event", async function () {
      await expect(registry.updatePropertyHash(PROPERTY_ID, NEW_HASH))
        .to.emit(registry, "PropertyHashUpdated")
        .withArgs(PROPERTY_ID, SAMPLE_HASH, NEW_HASH, owner.address, anyValue);
    });

    it("Should fail for non-existent property", async function () {
      await expect(registry.updatePropertyHash("INVALID-ID", NEW_HASH))
        .to.be.revertedWith("DigiLand: Property not registered");
    });
  });
});

// Helper for ignoring specific event argument values in Chai/Ethers
function anyValue() { return true; }
