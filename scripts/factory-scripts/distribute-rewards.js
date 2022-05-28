const { getCardFactoryInstance, marketplaceAddress } = require('../utils.js');

const distributeRewards = async () => {
  const cardFactory = await getCardFactoryInstance();
  await cardFactory.requestRandomWords(marketplaceAddress);
  console.log('Marketplace address set in factory to:', marketplaceAddress);
};

distributeRewards()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
