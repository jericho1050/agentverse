import { ethers } from "hardhat";
import * as fs from "fs";
import * as path from "path";

async function main() {
  // Get deployer signer
  const [deployer] = await ethers.getSigners();

  console.log("Deploying AgentEscrow contract with account:", deployer.address);

  // Get deployer balance
  const balance = await ethers.provider.getBalance(deployer.address);
  console.log("Deployer balance:", ethers.formatEther(balance), "HBAR");

  // Deploy AgentEscrow
  const AgentEscrow = await ethers.getContractFactory("AgentEscrow");
  const escrow = await AgentEscrow.deploy();

  // Wait for deployment
  await escrow.waitForDeployment();

  const contractAddress = await escrow.getAddress();
  console.log("AgentEscrow deployed to:", contractAddress);
  console.log("HashScan link:", `https://hashscan.io/testnet/contract/${contractAddress}`);

  // Save deployment info
  const deploymentInfo = {
    contractAddress,
    deployer: deployer.address,
    network: "hedera_testnet",
    deployedAt: new Date().toISOString(),
    hashscanLink: `https://hashscan.io/testnet/contract/${contractAddress}`,
  };

  const outputPath = path.join(__dirname, "..", "deployment-info.json");
  fs.writeFileSync(outputPath, JSON.stringify(deploymentInfo, null, 2));
  console.log("Deployment info saved to:", outputPath);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
