require('@nomiclabs/hardhat-waffle');
require('dotenv').config();
require('@nomiclabs/hardhat-etherscan');
require('hardhat-gas-reporter');

const mumabaiAccount = process.env.PRIVATE_KEY;
const mumbaiUrl = process.env.MUMBAI_URL;

module.exports = {
  solidity: {
    version: '0.8.14',
    settings: {
      optimizer: {
        enabled: true,
        runs: 10000,
      },
    },
  },
  networks: {
    hardhat: {
      forking: {
        url: mumbaiUrl,
        blockNumber: 26342800,
      },
    },
    mumbai: {
      url: mumbaiUrl,
      accounts: [mumabaiAccount],
    },
  },
  etherscan: {
    apiKey: process.env.POLYGONSCAN_API_TOKEN,
  },
};
