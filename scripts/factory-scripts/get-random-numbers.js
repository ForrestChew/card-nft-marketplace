const { getCardFactoryInstance, marketplaceAddress } = require('../utils.js');

const getRandomValues = async () => {
  const cardFactory = await getCardFactoryInstance();
  await cardFactory.requestRandomWords(marketplaceAddress);
  console.log('Marketplace address set in factory to:', marketplaceAddress);
};

getRandomValues()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
