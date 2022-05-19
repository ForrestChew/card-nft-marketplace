const ethers = require('ethers')

const {
    factoryAddress,
    factoryAbi,
  } = require('../contract-info/factory-info');
  
  const {
    marketplaceAddress,
    marketplaceAbi,
  } = require('../contract-info/marketplace-info');

exports.getCardFactoryInstance = async () => {
    const cardFactory = await ethers.getContractAt(factoryAbi, factoryAddress);
    return cardFactory;
  };
  
  // Gets deployed instance of CardNftMarketplace smart contract
  exports.getCardMarketplaceInstance = async () => {
    const cardMarketplace = await ethers.getContractAt(
      marketplaceAbi,
      marketplaceAddress
    );
    return cardMarketplace;
  };
  