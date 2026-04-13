// ── Deployment Script ─────────────────────────────────────────
// Run: npx hardhat run scripts/deploy.js --network localhost
const { ethers } = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("🚀 Deploying DigiLandRegistry contract...\n");

  const [deployer] = await ethers.getSigners();
  console.log(`📬 Deployer address: ${deployer.address}`);
  console.log(`💰 Balance: ${ethers.formatEther(await deployer.provider.getBalance(deployer.address))} ETH\n`);

  // Deploy the contract
  const DigiLandRegistry = await ethers.getContractFactory("DigiLandRegistry");
  const contract = await DigiLandRegistry.deploy();
  await contract.waitForDeployment();

  const contractAddress = await contract.getAddress();
  console.log(`✅ DigiLandRegistry deployed to: ${contractAddress}`);

  // Save deployment info for the backend
  const deploymentInfo = {
    contractAddress,
    deployerAddress: deployer.address,
    network: hre.network.name,
    deployedAt: new Date().toISOString(),
  };

  const outputPath = path.join(__dirname, "../artifacts/deployment.json");
  fs.writeFileSync(outputPath, JSON.stringify(deploymentInfo, null, 2));
  console.log(`\n📄 Deployment info saved to: artifacts/deployment.json`);
  console.log("ℹ️  Update CONTRACT_ADDRESS in server/.env with:", contractAddress);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });
