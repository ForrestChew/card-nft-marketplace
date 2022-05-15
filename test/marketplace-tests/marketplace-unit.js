const { expect } = require('chai');
const { ethers } = require('hardhat');

const ONE_ETHER = ethers.utils.parseEther('1');
const vrfCoordinator = '0x7a1BaC17Ccc5b313516C5E16fb24f7659aA5ebed';
const keyHash =
  '0x4b09e658ed251bcafeebbc69400383d49f344ace09b9576fe248bb02c003fe9f';
const callbackGasLimit = 100000;
const subscriptionId = 1;
const requestConfirmations = 3;

describe('CardNftMarketplace', () => {
  let accountOne;
  let cardMarketplace;
  let cardFactory;
  beforeEach(async () => {
    [accountOne, accountTwo] = await ethers.getSigners();
    // Deploy NFT factory in order to mint NFTs
    const CardFactory = await ethers.getContractFactory('CardFactory');
    cardFactory = await CardFactory.deploy(
      'TestName',
      'TSTSYM',
      vrfCoordinator,
      keyHash,
      callbackGasLimit,
      subscriptionId,
      requestConfirmations
    );
    await cardFactory.deployed();
    const CardNftMarketplace = await ethers.getContractFactory(
      'CardNftMarketplace'
    );
    cardMarketplace = await CardNftMarketplace.deploy(
      accountOne.address,
      cardFactory.address
    );
    await cardMarketplace.deployed();
    await cardFactory.setMarketplaceAddress(cardMarketplace.address);
  });
  it('Should deploy CardNftMarketplace', async () => {
    expect(await cardMarketplace.address.length).to.equal(42);
  });
  it('Should set Marketplace owner address', async () => {
    expect(await cardMarketplace.marketplaceOwner()).to.equal(
      accountOne.address
    );
  });
  it('Should set nft card ERC721 address', async () => {
    expect(await cardMarketplace.nftCardFactory()).to.equal(
      cardFactory.address
    );
  });
  it('Should return an accounts NFT pack listing', async () => {
    const sampleNftUri =
      'https://gateway.pinata.cloud/ipfs/QmVo4Bv31zLRvFiAXL6Z8te1kmuu1gYNEnneyBb2FF2aNp';
    // Deploy NFT factory in order to mint and list NFTs
    for (let i = 0; i < 3; i++) {
      await cardFactory.createNFTWithApprovalAdminPack(
        sampleNftUri,
        'Gold',
        1,
        cardMarketplace.address
      );
    }
    await cardMarketplace.listPack(ONE_ETHER, [1, 2, 3]);
    const returnedListing = await cardMarketplace.getListingsByAddress(
      accountOne.address
    );
    expect(returnedListing.length).to.equal(1);
  });
});
