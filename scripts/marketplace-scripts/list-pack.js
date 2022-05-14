const { ethers } = require('hardhat');
const { getCardMarketplaceInstance } = require('../utils.js');

const ONE_ETHER = ethers.utils.parseEther('1');

const listPack = async () => {
  const cardMarketplace = await getCardMarketplaceInstance();
  await cardMarketplace.listPack(ONE_ETHER, [1, 2, 3]);
  console.log('Pack listed');
};

listPack()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
