const { ethers } = require('hardhat');
const { expect } = require('chai');

const SAMPLE_NFT_URI =
  'https://gateway.pinata.cloud/ipfs/QmVo4Bv31zLRvFiAXL6Z8te1kmuu1gYNEnneyBb2FF2aNp';
const ONE_ETHER = ethers.utils.parseEther('1');
const ETHEREUM_ZERO_ADDRESS = '0x'.padEnd(42, '0');

describe('Card Factory', () => {
  let accountOne;
  let accountTwo;
  let cardFactory;
  beforeEach(async () => {
    [accountOne, accountTwo] = await ethers.getSigners();
    const CardFactory = await ethers.getContractFactory('CardFactory');
    cardFactory = await CardFactory.deploy('TestName', 'TSTSYM');
    await cardFactory.deployed();
  });
  it('Should deploy contract', async () => {
    expect(cardFactory.address.length).to.equal(42);
  });
  describe('setMarketplaceAddress: function', () => {
    it('Should set the marketplace address with admin call', async () => {
      // For testing purposes, the address does not matter
      await cardFactory.setMarketplaceAddress(ETHEREUM_ZERO_ADDRESS);
    });
  });
  describe('createNftWithApprovalUser: function', async () => {
    it('Should allow non admin account to mint token', async () => {
      await cardFactory
        .connect(accountTwo)
        .createNftWithApprovalUser(SAMPLE_NFT_URI);
      expect(await cardFactory.ownerOf(1)).to.equal(accountTwo.address);
    });
    it('Should allow admin account to mint token', async () => {
      await cardFactory.createNftWithApprovalUser(SAMPLE_NFT_URI);
      expect(await cardFactory.ownerOf(1)).to.equal(accountOne.address);
    });
    it('NFT rarity should be Iron', async () => {
      await cardFactory.createNftWithApprovalUser(SAMPLE_NFT_URI);
      const nftRarity = await cardFactory.nftRarity(1);
      expect(nftRarity).to.equal('Iron');
      expect(nftRarity).to.be.a('string');
    });
    it('NFT should have correct token URI', async () => {
      await cardFactory.createNftWithApprovalUser(SAMPLE_NFT_URI);
      const tokenUri = await cardFactory.tokenURI(1);
      expect(tokenUri).to.equal(SAMPLE_NFT_URI);
    });
    it('Should approve the marketplace address', async () => {
      await cardFactory.createNftWithApprovalUser(SAMPLE_NFT_URI);
      // For testing purposes, the address does not matter
      await cardFactory.setMarketplaceAddress(ETHEREUM_ZERO_ADDRESS);
      expect(await cardFactory.getApproved(1)).to.equal(ETHEREUM_ZERO_ADDRESS);
    });
  });
  describe('createNFTWithApprovalAdminPack: function', () => {
    it('Should allow admin account to mint token', async () => {
      await cardFactory.createNFTWithApprovalAdminPack(
        SAMPLE_NFT_URI,
        'Gold',
        1,
        ETHEREUM_ZERO_ADDRESS
      );
      expect(await cardFactory.ownerOf(1)).to.equal(accountOne.address);
    });
    it('NFT rarity should be Gold', async () => {
      await cardFactory.createNFTWithApprovalAdminPack(
        SAMPLE_NFT_URI,
        'Gold',
        1,
        ETHEREUM_ZERO_ADDRESS
      );
      const nftRarity = await cardFactory.nftRarity(1);
      expect(nftRarity).to.equal('Gold');
    });
    it('NFT pack Id should be 1', async () => {
      await cardFactory.createNFTWithApprovalAdminPack(
        SAMPLE_NFT_URI,
        'Gold',
        1,
        ETHEREUM_ZERO_ADDRESS
      );
      const nftToPackId = await cardFactory.nftIdToPackId(1);
      expect(nftToPackId).to.equal(1);
    });
    it('NFT Should have correct token Uri', async () => {
      await cardFactory.createNFTWithApprovalAdminPack(
        SAMPLE_NFT_URI,
        'Gold',
        2,
        ETHEREUM_ZERO_ADDRESS
      );
      expect(await cardFactory.tokenURI(1)).to.equal(SAMPLE_NFT_URI);
    });
    it('Should approve the marketplace address', async () => {
      await cardFactory.setMarketplaceAddress(ETHEREUM_ZERO_ADDRESS);
      await cardFactory.createNFTWithApprovalAdminPack(
        SAMPLE_NFT_URI,
        'Gold',
        3,
        ETHEREUM_ZERO_ADDRESS
      );
      // For testing purposes, the address does not matter
      expect(await cardFactory.getApproved(1)).to.equal(ETHEREUM_ZERO_ADDRESS);
    });
  });
  describe('transferFrom: function', () => {
    it('Should transfer admin created NFT between accounts', async () => {
      await cardFactory.createNFTWithApprovalAdminPack(
        SAMPLE_NFT_URI,
        'Gold',
        1,
        ETHEREUM_ZERO_ADDRESS
      );
      expect(await cardFactory.ownerOf(1)).to.equal(accountOne.address);
      await cardFactory.transferFrom(accountOne.address, accountTwo.address, 1);
      expect(await cardFactory.ownerOf(1)).to.equal(accountTwo.address);
    });
    it('Should transfer non admin created NFT between accounts', async () => {
      await cardFactory
        .connect(accountTwo)
        .createNftWithApprovalUser(SAMPLE_NFT_URI);
      expect(await cardFactory.ownerOf(1)).to.equal(accountTwo.address);
      await cardFactory.transferFrom(accountTwo.address, accountOne.address, 1);
      expect(await cardFactory.ownerOf(1)).to.equal(accountOne.address);
    });
    it('Should increase number of NFTs in pack owned by an address', async () => {
      await cardFactory.createNFTWithApprovalAdminPack(
        SAMPLE_NFT_URI,
        'Gold',
        1,
        ETHEREUM_ZERO_ADDRESS
      );
      expect(
        await cardFactory.numOfNftsOwnedPerPack(1, accountOne.address)
      ).to.equal(1);
      await cardFactory.transferFrom(accountOne.address, accountTwo.address, 1);
      expect(
        await cardFactory.numOfNftsOwnedPerPack(1, accountTwo.address)
      ).to.equal(1);
    });
  });
});
