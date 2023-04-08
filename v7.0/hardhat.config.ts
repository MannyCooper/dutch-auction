import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import "solidity-coverage";
import dotenv from "dotenv";

dotenv.config({ path: __dirname + "/.env" });
const { ALCHEMY_API_KEY, SEPOLIA_PRIVATE_KEY } = process.env;

const config: HardhatUserConfig = {
  solidity: "0.8.17",
  paths: {
    artifacts: "./frontend/src/artifacts",
  },
  networks: {
    sepolia: {
      url: `https://eth-mainnet.g.alchemy.com/v2/${ALCHEMY_API_KEY}`,
      accounts: [SEPOLIA_PRIVATE_KEY as string],
    },
  },
};

export default config;
