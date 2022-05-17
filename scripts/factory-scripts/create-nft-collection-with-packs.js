const { getCardFactoryInstance, marketplaceAddress } = require('../utils.js');
const IRON_URI =
  'https://gateway.pinata.cloud/ipfs/QmVo4Bv31zLRvFiAXL6Z8te1kmuu1gYNEnneyBb2FF2aNp';
const GOLD_URI =
  'https://gateway.pinata.cloud/ipfs/QmbJj1i9TRAhKRxNeMob7vL4zVE9iwqiySjr1RRNZPo6tC';
const DIAMOND_URI =
  'https://gateway.pinata.cloud/ipfs/Qma2NZzL1XaZEaGK86kxt32TvPLD9tQ5ZPCFGRBJou4KHf';

// Naive implementation of weighting the rarities of NFTs getting minted
const nftMetaData = [
  IRON_URI,
  IRON_URI,
  IRON_URI,
  IRON_URI,
  IRON_URI,
  IRON_URI,
  GOLD_URI,
  GOLD_URI,
  GOLD_URI,
  DIAMOND_URI,
  DIAMOND_URI,
];

const mint = async (
  tokenUri,
  nftRarity,
  packId,
  CARD_MARKETPLACE_ADDR,
  cardFactory
) => {
  await cardFactory.createNFTWithApprovalAdminPack(
    tokenUri,
    nftRarity,
    packId,
    CARD_MARKETPLACE_ADDR
  );
};

const mintCollectionWithPacksAdmin = async (amountOfPacks) => {
  const cardFactory = await getCardFactoryInstance();
  const nftRarityAmounts = { Iron: 0, Gold: 0, Diamond: 0 };
  // Will mint x total NFTs. amountOfPacks * 5 = x
  for (let packId = 1; packId <= amountOfPacks; packId++) {
    for (let nftId = 1; nftId <= 5; nftId++) {
      let tokenUri = randomTokenUri();
      let nftRarity;
      if (tokenUri == IRON_URI) {
        nftRarity = 'Iron';
        nftRarityAmounts['Iron'] += 1;
      } else if (tokenUri == GOLD_URI) {
        nftRarity = 'Gold';
        nftRarityAmounts['Gold'] += 1;
      } else {
        nftRarity = 'Diamond';
        nftRarityAmounts['Diamond'] += 1;
      }
      await mint(tokenUri, nftRarity, packId, marketplaceAddress, cardFactory);
      console.log('Iron amount:', nftRarityAmounts['Iron']);
      console.log('Gold amount:', nftRarityAmounts['Gold']);
      console.log('Diamond amount:', nftRarityAmounts['Diamond']);
    }
  }
  console.log('-'.padEnd(42, '-'));
  console.log('TOTAL:');
  console.log('Iron amount:', nftRarityAmounts['Iron']);
  console.log('Gold amount:', nftRarityAmounts['Gold']);
  console.log('Diamond amount:', nftRarityAmounts['Diamond']);
};

// Helper function
const randomTokenUri = () => {
  // Returns INT between 0 - 11. The number will be used as index to decide which metadata to mint
  const randInt = Math.floor(Math.random() * 11);
  return nftMetaData[randInt];
};

mintCollectionWithPacksAdmin(6)
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
