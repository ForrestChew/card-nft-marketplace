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
const getNftPinataUrl = (nftMetadataId) => {
  let metadataHashPath = `../../nft_collection_builder/nft_metadata_urls/nft_metadata_url_${nftMetadataId}.json`;
  let metadataHash = require(metadataHashPath);
  let pinataUrl = 'https://gateway.pinata.cloud/ipfs/' + metadataHash;
  console.log(pinataUrl);
  return pinataUrl;
};

// Interacts with Factory smart contract and mints NFT
const mint = async (
  nftRarity,
  packId,
  nftMetadataId,
  cardMarketplaceAddress
) => {
  let nftUri = getNftPinataUrl(nftMetadataId);
  const cardFactory = await getCardFactoryInstance();
  const tx = await cardFactory.createNFTWithApprovalAdminPack(
    nftUri,
    nftRarity,
    packId,
    cardMarketplaceAddress
  );
  console.log('Token Minted', tx, 'ID:', nftMetadataId);
};

// Picks rarity to assign each minted NFT
const randomRarity = () => {
  // Returns INT between 0 - 11. The number will be used as index to decide which metadata to mint
  const randInt = Math.floor(Math.random() * 11);
  return nftRarity[randInt];
};

// Picks rarities for NFTs then call mint functions
const mintCollectionWithPacksAdmin = async (amountOfPacks) => {
  // Will mint x total NFTs. amountOfPacks * 5 = total amount of NFTs to mint
  let nftMetadataId = 1;
  for (let packId = 1; packId <= amountOfPacks; packId++) {
    for (let nftId = 1; nftId <= 5; nftId++) {
      let rarity = randomRarity();
      let nftRarity = '';
      if (rarity == 'Iron') nftRarity = 'Iron';
      if (rarity == 'Gold') nftRarity = 'Gold';
      if (rarity == 'Diamond') nftRarity = 'Diamond';
      const tx = await mint(
        nftRarity,
        packId,
        nftMetadataId,
        marketplaceAddress
      );
      nftMetadataId++;
    }
  }
};

// Adjust param for total amount of packs to be minted
mintCollectionWithPacksAdmin(10)
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
