// Runtime Environment's members available in the global scope.
const { ethers } = require('hardhat');

const createNfts = async () => {
  const CardFactory = await ethers.getContractFactory('CardFactory');
  const cardFactory = await CardFactory.deploy('Cards Collection', 'CC');
  await cardFactory.deployed();
  console.log('CardFactory deployed to:', cardFactory.address, '\n');
  await mintCollectionWithPacksAdmin(cardFactory);
};

const CARD_MARKETPLACE_ADDR = '0x'.padEnd(42, '0');

const IRON_URI =
  'https://gateway.pinata.cloud/ipfs/QmVo4Bv31zLRvFiAXL6Z8te1kmuu1gYNEnneyBb2FF2aNp';
const GOLD_URI =
  'https://gateway.pinata.cloud/ipfs/QmbJj1i9TRAhKRxNeMob7vL4zVE9iwqiySjr1RRNZPo6tC';
const DIAMOND_URI =
  'https://gateway.pinata.cloud/ipfs/Qma2NZzL1XaZEaGK86kxt32TvPLD9tQ5ZPCFGRBJou4KHf';

const nftMetaData = [IRON_URI, GOLD_URI, DIAMOND_URI];

// Helper function
const randomTokenUri = () => {
  // Returns INT between 0 - 2. The number will be used as index to decide which metadata to mint
  const randInt = Math.floor(Math.random() * 3);
  return nftMetaData[randInt];
};

const mintCollectionWithPacksAdmin = async (cardFactory) => {
  const nftsInPack = {};
  // Creates hashtable of NFT pack --> amount of NFTs in pack
  for (let packId = 1; packId <= 200; packId++) {
    nftsInPack[packId] = 0;
  }
  //   Will mint 1000 total NFTs. 200 * 5 = 1000
  for (let packId = 1; packId <= 200; packId++) {
    for (let nftId = 1; nftId <= 5; nftId++) {
      let tokenUri = randomTokenUri();
      let nftRarity;
      if (tokenUri == IRON_URI) nftRarity = 'Iron';
      if (tokenUri == GOLD_URI) nftRarity = 'Gold';
      if (tokenUri == DIAMOND_URI) nftRarity = 'Diamond';
      await cardFactory.createNFTWithApprovalAdminPack(
        tokenUri,
        nftRarity,
        packId,
        CARD_MARKETPLACE_ADDR
      );
    }
  }
  console.log(
    'You have created 1000 NFTs with the following metrics:\n -125 Diamond\n -300 Gold \n -475 Iron\n'
  );
};

createNfts()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
