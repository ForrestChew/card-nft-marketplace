/*
This script requires user to have deployed NFTs with the NFT card factory
*/
const { ethers } = require('hardhat');
const { getCardMarketplaceInstance, marketplaceOwner } = require('../utils.js');

const ONE_ETHER = ethers.utils.parseEther('1');

const listPack = async () => {
  const cardMarketplace = await getCardMarketplaceInstance();
  const listPackReceipt = await cardMarketplace.listPack(
    ONE_ETHER,
    [1, 2, 3, 4, 5],
    {
      gasLimit: 10000000,
    }
  );
  console.log('-'.padEnd(42, '-'));
  console.log(listPackReceipt);
  console.log('-'.padEnd(42, '-'));
  console.log('Pack Minted');
};

listPack()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
