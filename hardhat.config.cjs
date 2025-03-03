require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    version: "0.8.19",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200
      }
    }
  },
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts"
  },
  networks: {
    hardhat: {
      chainId: 31337,
      url: "https://eth-sepolia.g.alchemy.com/v2/hQfI7k6KfafWc8o0M69aMDPez3crZbDg",
    },
    sepolia: {
      url: "https://sepolia.infura.io/v3/ec895f4e045048f0a69a7fad7968b439",
      accounts: process.env.SEPOLIA_PRIVATE_KEY ? [process.env.SEPOLIA_PRIVATE_KEY] : [],
      chainId: 11155111,
      gasPrice: 26000000000, // 26 gwei
      gas: 30000000, // Block gas limit
      allowUnlimitedContractSize: true,
      timeout: 300000, // 5 minutes
      verify: {
        etherscan: {
          apiKey: process.env.ETHERSCAN_API_KEY
        }
      }
    }
  },
  gasReporter: {
    enabled: true,
    currency: "ETH",
    coinmarketcap: process.env.COINMARKETCAP_API_KEY
  },
  etherscan: {
    apiKey: {
      sepolia: process.env.ETHERSCAN_API_KEY
    }
  },
  mocha: {
    timeout: 300000 // 5 minutes
  }
}; 