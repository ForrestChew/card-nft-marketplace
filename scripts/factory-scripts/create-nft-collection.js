const { getCardFactoryInstance, marketplaceAddress } = require('../utils.js');

// Naive implementation of weighting the rarities of NFTs getting minted
const nftRarity = [
  'Iron',
  'Iron',
  'Iron',
  'Iron',
  'Iron',
  'Iron',
  'Gold',
  'Gold',
  'Gold',
  'Diamond',
  'Diamond',
];

// Retuns NFT Pinata URL to mint into NFT
const getNftPinataUrl = (metadataNum) => {
  let metadataHashPath = `../../nft_collection_builder/nft_metadata_urls/nft_metadata_url_${metadataNum}.json`;
  const metadataHash = require(metadataHashPath);
  const pinataUrl = 'https://gateway.pinata.cloud/ipfs/' + metadataHash;
  return pinataUrl;
};

// Interacts with Factory smart contract and mints NFT
const mint = async (
  nftRarity,
  packId,
  nftId,
  CARD_MARKETPLACE_ADDR,
  cardFactory
) => {
  const nftUri = getNftPinataUrl(nftId);
  await cardFactory.createNFTWithApprovalAdminPack(
    nftUri,
    nftRarity,
    packId,
    CARD_MARKETPLACE_ADDR
  );
};

// Picks rarity to assign each minted NFT
const randomRarity = () => {
  // Returns INT between 0 - 11. The number will be used as index to decide which metadata to mint
  const randInt = Math.floor(Math.random() * 11);
  return nftRarity[randInt];
};

// Picks rarities for NFTs then call mint functions
const mintCollectionWithPacksAdmin = async (amountOfPacks) => {
  const cardFactory = await getCardFactoryInstance();
  const nftRarityAmounts = { Iron: 0, Gold: 0, Diamond: 0 };
  // Will mint x total NFTs. amountOfPacks * 5 = total amount of NFTs to mint
  for (let packId = 1; packId <= amountOfPacks; packId++) {
    for (let nftId = 1; nftId <= 5; nftId++) {
      let rarity = randomRarity();
      let nftRarity;
      if (rarity == 'Iron') {
        nftRarity = 'Iron';
        nftRarityAmounts['Iron'] += 1;
      } else if (rarity == GOLD_URI) {
        rarity = 'Gold';
        nftRarityAmounts['Gold'] += 1;
      } else {
        rarity = 'Diamond';
        nftRarityAmounts['Diamond'] += 1;
      }
      await mint(nftRarity, packId, nftId, marketplaceAddress, cardFactory);
    }
  }
  console.log('-'.padEnd(42, '-'));
  console.log('TOTAL:');
  console.log('Iron amount:', nftRarityAmounts['Iron']);
  console.log('Gold amount:', nftRarityAmounts['Gold']);
  console.log('Diamond amount:', nftRarityAmounts['Diamond']);
};

// Adjust param for total amount of packs to be minted
mintCollectionWithPacksAdmin(10)
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
