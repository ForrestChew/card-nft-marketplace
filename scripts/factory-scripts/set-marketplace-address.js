const { getCardFactoryInstance, marketplaceAddress } = require('../utils.js');

const setMarketplaceAddress = async () => {
  const cardFactory = await getCardFactoryInstance();
  await cardFactory.setMarketplaceAddress(marketplaceAddress);
  console.log('Marketplace address set in factory to:', marketplaceAddress);
};

setMarketplaceAddress()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
