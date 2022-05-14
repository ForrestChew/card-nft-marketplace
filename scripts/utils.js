const {
  factoryAddress,
  factoryAbi,
} = require('../src/contract-info/factory-info');

const {
  marketplaceAddress,
  marketplaceAbi,
} = require('../src/contract-info/marketplace-info');

exports.marketplaceOwner = '0x42A7b811d096Cba5b3bbf346361106bDe275C8d7';
exports.marketplaceAddress = marketplaceAddress;
exports.factoryAddress = factoryAddress;
// Gets deployed instance of CardFactory smart contract
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
