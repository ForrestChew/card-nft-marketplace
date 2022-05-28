const { ethers } = require('hardhat');
const { getCardMarketplaceInstance } = require('../utils.js');

const ONE_ETHER = ethers.utils.parseEther('3');

const listPack = async (tokenIdsToMint, name) => {
  const cardMarketplace = await getCardMarketplaceInstance();
  const listPackReceipt = await cardMarketplace.listPack(
    ONE_ETHER,
    tokenIdsToMint,
    name
  );
  console.log(listPackReceipt);
  console.log('Pack Minted');
};

listPack([1], 'First Pack')
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
