import "@nomicfoundation/hardhat-ignition-viem";
import "hardhat-chai-matchers-viem";
import "hardhat-gas-reporter";
import type { HardhatUserConfig } from "hardhat/config";
import { vars } from "hardhat/config";
import type { NetworkUserConfig } from "hardhat/types";
import * as chains from "viem/chains";

const mnemonic: string = vars.get("MNEMONIC", "test test test test test test test test test test test junk");
const alchemyApiKey: string = vars.get("ALCHEMY_API_KEY", "oKxs-03sij-U_N0iOlrSsZFr29-IqbuF");
const etherscanApiKey: string = vars.get("ETHERSCAN_API_KEY", "");
const coinmarketcapApiKey: string = vars.get("COINMARKETCAP_API_KEY", "");

const getUrl = (chain: keyof typeof chains): string => chains[chain].rpcUrls.default.http[0];

const getChainConfig = (chain: keyof typeof chains, url = getUrl(chain)): NetworkUserConfig => ({
  accounts: {
    count: 10,
    mnemonic,
    path: "m/44'/60'/0'/0",
  },
  chainId: chains[chain].id,
  url,
});

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.20",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  etherscan: {
    apiKey: etherscanApiKey,
    customChains: [
      {
        network: "polygonAmoy",
        chainId: 80002,
        urls: {
          apiURL: "https://api-amoy.polygonscan.com/api",
          browserURL: "https://amoy.polygonscan.com",
        },
      },
    ],
  },
  networks: {
    hardhat: {
      accounts: {
        mnemonic,
      },
      chainId: chains.hardhat.id,
    },
    sepolia: getChainConfig("sepolia", `https://eth-sepolia.g.alchemy.com/v2/${alchemyApiKey}`),
    mainnet: getChainConfig("mainnet", `https://eth-mainnet.g.alchemy.com/v2/${alchemyApiKey}`),
    polygonAmoy: getChainConfig("polygonAmoy"),
    polygon: getChainConfig("polygon", `https://polygon-mainnet.g.alchemy.com/v2/${alchemyApiKey}`),
  },
  gasReporter: {
    enabled: process.env.REPORT_GAS === "true",
    outputFile: process.env.REPORT_GAS_FILE === "true" ? "gas-report.txt" : undefined,
    L1Etherscan: etherscanApiKey,
    coinmarketcap: coinmarketcapApiKey,
  },
};

export default config;
