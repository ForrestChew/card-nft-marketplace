const { ethers } = require('hardhat');
const { getCardMarketplaceInstance } = require('../utils.js');

const ONE_ETHER = ethers.utils.parseEther('1');

const listPack = async (tokenIdsToMint, name) => {
  const cardMarketplace = await getCardMarketplaceInstance();
  const listPackReceipt = await cardMarketplace.listPack(
    ONE_ETHER,
    tokenIdsToMint,
    name
  );
  console.log('-'.padEnd(42, '-'));
  console.log(listPackReceipt);
  console.log('-'.padEnd(42, '-'));
  console.log('Pack Minted');
};

listPack([28, 29, 30], 'Test_7')
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
