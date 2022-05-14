const { ethers } = require('hardhat');
const { marketplaceOwner, factoryAddress } = require('../utils.js');

const deployMarketplace = async () => {
  const CardNftMarketplace = await ethers.getContractFactory(
    'CardNftMarketplace'
  );
  const cardNftMarketplace = await CardNftMarketplace.deploy(
    marketplaceOwner,
    factoryAddress
  );
  await cardNftMarketplace.deployed();
  console.log('Marketplace deployed to:', cardNftMarketplace.address);
};

deployMarketplace()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
