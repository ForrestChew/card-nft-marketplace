const { getCardMarketplaceInstance } = require('../utils.js');

const delistPack = async (packId) => {
  const cardMarketplace = await getCardMarketplaceInstance();
  const delistPackReceipt = await cardMarketplace.delistPack(packId);
  console.log('-'.padEnd(42, '-'));
  console.log(delistPackReceipt);
  console.log('-'.padEnd(42, '-'));
  console.log('Pack Delisted');
};

delistPack(1)
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
