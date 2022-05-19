/*
This script requires user to have deployed NFTs with the NFT card factory
*/
const { ethers } = require('hardhat');
const { getCardMarketplaceInstance } = require('../utils.js');

const ONE_ETHER = ethers.utils.parseEther('1');

const listPack = async (tokenIdsToMint) => {
  const cardMarketplace = await getCardMarketplaceInstance();
  const listPackReceipt = await cardMarketplace.listPack(
    ONE_ETHER,
    tokenIdsToMint
  );
  console.log('-'.padEnd(42, '-'));
  console.log(listPackReceipt);
  console.log('-'.padEnd(42, '-'));
  console.log('Pack Minted');
};

listPack([27, 28, 29, 30])
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
