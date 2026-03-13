import "dotenv/config";
import type { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.24",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  networks: {
    hedera_testnet: {
      url: "https://testnet.hashio.io/api",
      chainId: 296,
      accounts: process.env.HEDERA_OPERATOR_KEY
        ? [process.env.HEDERA_OPERATOR_KEY]
        : [],
    },
  },
};

export default config;
