const { getCardMarketplaceInstance, marketplaceOwner } = require('../utils.js');

const getListingsByAddress = async (address) => {
  const cardMarketplace = await getCardMarketplaceInstance();
  const tx = await cardMarketplace.getListingsByAddress(address);
  console.log(address, 'has', tx, 'listings');
};

getListingsByAddress(marketplaceOwner)
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
